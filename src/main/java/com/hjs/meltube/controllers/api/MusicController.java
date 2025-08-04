package com.hjs.meltube.controllers.api;

import com.hjs.meltube.entities.MusicEntity;
import com.hjs.meltube.entities.UserEntity;
import com.hjs.meltube.results.CommonResult;
import com.hjs.meltube.results.Result;
import com.hjs.meltube.results.ResultTuple;
import com.hjs.meltube.services.MusicService;
import com.hjs.meltube.vos.FileVo;
import com.hjs.meltube.vos.MusicVo;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping(value = "/api/music")
public class MusicController {
    private final MusicService musicService;

    @Autowired
    public MusicController(MusicService musicService) {
        this.musicService = musicService;
    }

    @RequestMapping(value = "/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    public String deleteIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                              @RequestParam(value = "index", required = false) int index) {
        Result result = this.musicService.deleteByIndex(signedUser, index);
        JSONObject response = new JSONObject();
        response.put("result", result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public String postIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            @RequestParam(value = "_coverUrl", required = false) String coverUrl,
                            MusicEntity music) throws IOException, InterruptedException {
        Result result;
        FileVo coverFile = this.musicService.downloadCoverImage(coverUrl);
        if (coverFile == null) {
            result = CommonResult.FAILURE;
        } else {
            music.setCoverImageName(coverFile.getName());
            music.setCoverImageContentType(coverFile.getContentType());
            music.setCoverImageData(coverFile.getData());
            result = this.musicService.register(signedUser, music);
        }
        JSONObject response = new JSONObject();
        response.put("result", result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/check-youtube-id", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public String getCheckYouTubeId(@RequestParam(value = "id", required = false) String id) throws IOException, InterruptedException {
        Result result = this.musicService.checkYouTubeId(id);
        JSONObject response = new JSONObject();
        response.put("result", result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/cover", method = RequestMethod.GET)
    public ResponseEntity<byte[]> getCover(@RequestParam(value = "index", required = false) int index) {
        MusicEntity music = this.musicService.getByIndex(index, true);
        if (music == null || music.isDeleted()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity
                .ok()
                .header("Content-Disposition", String.format("inline; filename=\"%s\"", URLEncoder.encode(music.getCoverImageName(), StandardCharsets.UTF_8)))
                .header("Content-Length", String.valueOf(music.getCoverImageData().length))
                .header("Content-Type", music.getCoverImageContentType())
                .body(music.getCoverImageData());
    }

    @RequestMapping(value = "/crawl", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public MusicEntity getCrawl(@RequestParam(value = "id", required = false) String id) throws IOException {
        return this.musicService.crawl(id);
    }

    @RequestMapping(value = "/like", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    public String patchLike(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            @RequestParam(value = "index", required = false) int index) {
        Boolean result = this.musicService.toggleLike(signedUser, index);
        JSONObject response = new JSONObject();
        if (result == null) {
            response.put("result", CommonResult.FAILURE.nameToLower());
        } else {
            response.put("result", result);
        }
        return response.toString();
        // {result: failure} : 실패한것
        // {result: true} : 좋아하게 된 것
        // {result: false} : 좋아하지 않게 된 것
    }

    @RequestMapping(value = "/register-history", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public MusicEntity[] getRegisterHistory(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        ResultTuple<MusicEntity[]> result = this.musicService.getRegisterHistory(signedUser);
        if (result.getResult() != CommonResult.SUCCESS) {
            return new MusicEntity[0];
        }
        return result.getPayload();
    }

    @RequestMapping(value = "/search", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public MusicVo[] getSearch(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                               @RequestParam(value = "keyword", required = false) String keyword) {
        return this.musicService.search(signedUser, keyword);
    }

    @RequestMapping(value = "/search-external", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public MusicEntity[] getSearchExternal(@RequestParam(value = "keyword", required = false) String keyword) throws IOException, InterruptedException {
        return this.musicService.searchExternal(keyword);
    }
}