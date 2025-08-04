package com.hjs.meltube.services;

import com.hjs.meltube.entities.MusicEntity;
import com.hjs.meltube.entities.MusicUserLikeEntity;
import com.hjs.meltube.entities.UserEntity;
import com.hjs.meltube.mappers.MusicMapper;
import com.hjs.meltube.mappers.MusicUserLikeMapper;
import com.hjs.meltube.regexes.CommonRegex;
import com.hjs.meltube.regexes.MusicRegex;
import com.hjs.meltube.results.CommonResult;
import com.hjs.meltube.results.Result;
import com.hjs.meltube.results.ResultTuple;
import com.hjs.meltube.results.music.RegisterResult;
import com.hjs.meltube.vos.FileVo;
import com.hjs.meltube.vos.MusicVo;
import org.json.JSONArray;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class MusicService {
    private final MusicMapper musicMapper;
    private final MusicUserLikeMapper musicUserLikeMapper;

    @Autowired
    public MusicService(MusicMapper musicMapper, MusicUserLikeMapper musicUserLikeMapper) {
        this.musicMapper = musicMapper;
        this.musicUserLikeMapper = musicUserLikeMapper;
    }

    public Result checkYouTubeId(String id) throws IOException, InterruptedException {
        if (!MusicRegex.youtubeId.matches(id)) {
            return CommonResult.FAILURE;
        }
        if (this.musicMapper.selectCountByYoutubeId(id) > 0) {
            return CommonResult.FAILURE_DUPLICATE;
        }
        String url = String.format("https://img.youtube.com/vi/%s/mqdefault.jpg", id);
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create(url))
                .build();
        HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
        return response.statusCode() >= 200 && response.statusCode() < 300
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public MusicEntity crawl(String id) throws IOException {
        if (id == null || id.isEmpty()) {
            return null;
        }
        String url = String.format("https://www.melon.com/song/lyrics.htm?songId=%s", id);
        Document document = Jsoup.connect(url).get();
        Elements $list = document.select(".meta > .list");
        Elements $artist = document.select(".artist_name > span:first-child");
        Elements $album = $list.select("dd:nth-child(2)");
        Elements $genre = $list.select("dd:nth-child(6)");
        Elements $releaseDate = $list.select("dd:nth-child(4)");
        Elements $name = document.select(".song_name");
        Elements $lyrics = document.select(".lyric");
        Elements $cover = document.select("img[src^=\"https://cdnimg.melon.co.kr/cm\"][src*=\"/album/images/\"]");
        $name.select(".none").remove();
        String releaseDateStr = $releaseDate.text().replace(".", "-");
        String[] releaseDateArray = releaseDateStr.split("-");
        if (releaseDateArray.length == 1) {
            releaseDateStr += "-01-01";
        } else if (releaseDateArray.length == 2) {
            releaseDateStr += "-01";
        }
        LocalDate releaseDate = LocalDate.parse(releaseDateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        MusicEntity music = MusicEntity.builder()
                .index(Integer.parseInt(id))
                .artist($artist.text())
                .album($album.text())
                .name($name.text())
                .genre($genre.text())
                .lyrics($lyrics.html()
                        .replaceAll("<!--.*?-->", "")
                        .replace("<br>", "")
                        .strip())
                .releaseDate(releaseDate)
                .coverImageName($cover.attr("src"))
                .build();
        String searchQuery = URLEncoder.encode(String.format("%s %s", music.getArtist(), music.getName()), StandardCharsets.UTF_8);
        Document searchDocument = Jsoup.connect(String.format("https://search.naver.com/search.naver?where=video&sort=rel&view=big&query=%s&selected_cp=3130781782", searchQuery)).get();
        Element searchResult = searchDocument.selectFirst("a.info_title");
        if (searchResult != null) {
            String href = searchResult.attr("href");
            String[] hrefArray = href.split("=");
            if (hrefArray.length > 1) {
                music.setYoutubeId(hrefArray[1]);
            }
        }
        return music;
    }

    public Result deleteByIndex(UserEntity signedUser, int index) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        MusicEntity dbMusic = this.musicMapper.selectByIndex(index);
        if (dbMusic == null || dbMusic.isDeleted()) {
            return CommonResult.FAILURE_NO_AFFILIATION;
        }
        if (!signedUser.getEmail().equals(dbMusic.getUserEmail()) && !signedUser.isAdmin()) {
            return CommonResult.FAILURE_DENIED;
        }
        return this.musicMapper.deleteByIndex(index) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public FileVo downloadCoverImage(String url) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create(url))
                .build();
        HttpResponse<byte[]> response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            return null;
        }
        String[] nameArray = url.split("\\?")[0].split("/");
        String name = nameArray[nameArray.length - 1];
        if (name.isEmpty() || !CommonRegex.fileName.matches(name)) {
            name = "cover.jpg";
        }
        return FileVo.builder()
                .name(name)
                .contentType(response.headers().firstValue("Content-Type").orElse("image/jpeg"))
                .data(response.body())
                .build();
    }

    public MusicEntity getByIndex(int index, boolean includesCover) {
        if (index < 1) {
            return null;
        }
        if (includesCover) {
            return this.musicMapper.selectByIndexWithCover(index);
        } else {
            return this.musicMapper.selectByIndex(index);
        }
    }

    public ResultTuple<MusicEntity[]> getRegisterHistory(UserEntity signedUser) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return ResultTuple.<MusicEntity[]>builder().result(CommonResult.FAILURE_SESSION_EXPIRED).build();
        }
        return ResultTuple.<MusicEntity[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(this.musicMapper.selectByUserEmail(signedUser.getEmail()))
                .build();
    }

    public Result register(UserEntity signedUser, MusicEntity music) throws IOException, InterruptedException {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (music == null ||
            !MusicRegex.artist.matches(music.getArtist()) ||
            !MusicRegex.album.matches(music.getAlbum()) ||
            !MusicRegex.name.matches(music.getName()) ||
            !MusicRegex.genre.matches(music.getGenre()) ||
            !MusicRegex.lyrics.matches(music.getLyrics()) ||
            !MusicRegex.youtubeId.matches(music.getYoutubeId()) ||
            !CommonRegex.fileName.matches(music.getCoverImageName()) ||
            !CommonRegex.fileMimeType.matches(music.getCoverImageContentType()) ||
            music.getCoverImageData() == null || music.getCoverImageData().length == 0) {
            return CommonResult.FAILURE;
        }
        Result youtubeIdCheckResult = this.checkYouTubeId(music.getYoutubeId());
        if (youtubeIdCheckResult == CommonResult.FAILURE) {
            return RegisterResult.FAILURE_YOUTUBE_ID_INVALID;
        }
        if (youtubeIdCheckResult == CommonResult.FAILURE_DUPLICATE) {
            return CommonResult.FAILURE_DUPLICATE;
        }
        music.setUserEmail(signedUser.getEmail());
        music.setStatus(MusicEntity.Statuses.PENDING.name()); // "PENDING"
        music.setCreatedAt(LocalDateTime.now());
        music.setUpdatedAt(LocalDateTime.now());
        music.setDeleted(false);
        return this.musicMapper.insert(music) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public MusicVo[] search(UserEntity signedUser, String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return new MusicVo[0];
        }
        return this.musicMapper.search(signedUser == null ? null : signedUser.getEmail(), keyword);
    }

    public MusicEntity[] searchExternal(String keyword) throws IOException, InterruptedException {
        if (keyword == null || keyword.isEmpty()) {
            return new MusicEntity[0];
        }
        String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8); // "REBEL HEART" -> "REBEL+HEART"
        String url = String.format("https://www.melon.com/search/keyword/index.json?query=%s", encodedKeyword);
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create(url))
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            return new MusicEntity[0];
        }
        String responseText = response.body();
        JSONObject responseObject = new JSONObject(responseText); // JSON.parse : 문자열 -> 오브젝트|배열
        if (!responseObject.has("STATUS") ||
            !responseObject.has("SONGCONTENTS") ||
            !responseObject.getString("STATUS").equals("0")) {
            return new MusicEntity[0];
        }
        JSONArray songContents = responseObject.getJSONArray("SONGCONTENTS");
        MusicEntity[] musics = new MusicEntity[songContents.length()];
        for (int i = 0; i < songContents.length(); i++) {
            JSONObject songContent = songContents.getJSONObject(i);
            musics[i] = MusicEntity.builder()
                    .index(Integer.parseInt(songContent.getString("SONGID")))
                    .artist(songContent.getString("ARTISTNAME"))
                    .album(songContent.getString("ALBUMNAME"))
                    .name(songContent.getString("SONGNAME"))
                    .coverImageName(songContent.getString("ALBUMIMG"))
                    .build();
        }
        return musics;
    }

    public Boolean toggleLike(UserEntity signedUser, int musicIndex) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended() || musicIndex < 1) {
            return null;
        }
        MusicEntity dbMusic = this.musicMapper.selectByIndex(musicIndex);
        if (dbMusic == null || dbMusic.isDeleted()) {
            return null;
        }
        if (this.musicUserLikeMapper.selectByMusicIndexAndUserEmail(musicIndex, signedUser.getEmail()) == null) {
            // 음악 인덱스, 유저 이메일로 SELECT 해서 null 이면 좋아요 하지 않은 상태
            // > 좋아요 해주면 됨
            MusicUserLikeEntity musicUserLike = MusicUserLikeEntity.builder()
                    .musicIndex(musicIndex)
                    .userEmail(signedUser.getEmail())
                    .createdAt(LocalDateTime.now())
                    .build();
            return this.musicUserLikeMapper.insert(musicUserLike) > 0 ? true : null;
            // true 를 반환하면 최종적으로 좋아요 한 상태라는 의미
        } else {
            // null이 아니면 좋아요한 상태
            // > 좋아요 취소
            return this.musicUserLikeMapper.delete(musicIndex, signedUser.getEmail()) > 0 ? false : null;
            // false 를 반환하면 최종적으로 좋아요 하지 않은 상태라는 의미
        }
    }
}
























