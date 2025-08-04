package com.hjs.meltube.services;

import com.hjs.meltube.entities.MusicEntity;
import com.hjs.meltube.entities.PlaylistEntity;
import com.hjs.meltube.entities.PlaylistMusicMappingEntity;
import com.hjs.meltube.entities.UserEntity;
import com.hjs.meltube.mappers.PlaylistMapper;
import com.hjs.meltube.mappers.PlaylistMusicMappingMapper;
import com.hjs.meltube.mappers.UserMapper;
import com.hjs.meltube.results.CommonResult;
import com.hjs.meltube.results.Result;
import com.hjs.meltube.results.ResultTuple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PlaylistService {
    private final PlaylistMapper playlistMapper;
    private final PlaylistMusicMappingMapper playlistMusicMappingMapper;

    @Autowired
    public PlaylistService(PlaylistMapper playlistMapper, PlaylistMusicMappingMapper playlistMusicMappingMapper) {
        this.playlistMapper = playlistMapper;
        this.playlistMusicMappingMapper = playlistMusicMappingMapper;
    }

    public ResultTuple<PlaylistEntity> add(UserEntity signedUser, String name, int[] musics) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return ResultTuple.<PlaylistEntity>builder().result(CommonResult.FAILURE_SESSION_EXPIRED).build();
        }
        if (name == null || name.isEmpty() || musics == null || musics.length == 0) {
            return ResultTuple.<PlaylistEntity>builder().result(CommonResult.FAILURE).build();
        }
        PlaylistEntity dbPlaylist = this.playlistMapper.selectByUserEmailAndName(signedUser.getEmail(), name);
        if (dbPlaylist == null) {
            dbPlaylist = PlaylistEntity.builder()
                    .userEmail(signedUser.getEmail())
                    .name(name)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            if (this.playlistMapper.insert(dbPlaylist) == 0) {
                return ResultTuple.<PlaylistEntity>builder().result(CommonResult.FAILURE).build();
            }
        } else {
            this.playlistMusicMappingMapper.deleteAllByPlaylistIndex(dbPlaylist.getIndex());
        }
        for (int musicIndex : musics) {
            PlaylistMusicMappingEntity playlistMusicMapping = PlaylistMusicMappingEntity.builder()
                    .playlistIndex(dbPlaylist.getIndex())
                    .musicIndex(musicIndex)
                    .build();
            this.playlistMusicMappingMapper.insert(playlistMusicMapping);
        }
        return ResultTuple.<PlaylistEntity>builder()
                .payload(dbPlaylist)
                .result(CommonResult.SUCCESS)
                .build();
    }

    public PlaylistEntity[] getAll(UserEntity signedUser) {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return new PlaylistEntity[0];
        }
        return this.playlistMapper.selectAllByUserEmail(signedUser.getEmail());
    }

    public ResultTuple<MusicEntity[]> getAllMusicsByIndex(UserEntity signedUser, int index){
        if (index < 1) {
            return ResultTuple.<MusicEntity[]>builder().result(CommonResult.FAILURE).build();
        }
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return ResultTuple.<MusicEntity[]>builder().result(CommonResult.FAILURE_SESSION_EXPIRED).build();
        }
        PlaylistEntity playlist = this.playlistMapper.selectByIndex(index);
        if (playlist == null) {
            return ResultTuple.<MusicEntity[]>builder().result(CommonResult.FAILURE_NO_AFFILIATION).build();
        }
        if (!playlist.getUserEmail().equals(signedUser.getEmail())) {
            return ResultTuple.<MusicEntity[]>builder().result(CommonResult.FAILURE_DENIED).build();
        }
        return ResultTuple.<MusicEntity[]>builder()
                .payload(this.playlistMapper.selectAllMusicsByIndex(index))
                .result(CommonResult.SUCCESS)
                .build();
    }
}






















