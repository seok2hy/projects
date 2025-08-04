package com.hjs.meltube.controllers.api;

import com.hjs.meltube.entities.MusicEntity;
import com.hjs.meltube.entities.PlaylistEntity;
import com.hjs.meltube.entities.UserEntity;
import com.hjs.meltube.results.CommonResult;
import com.hjs.meltube.results.ResultTuple;
import com.hjs.meltube.services.PlaylistService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/playlist")
public class PlaylistController {
    private final PlaylistService playlistService;

    @Autowired
    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public String postIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            @RequestParam(value = "name", required = false) String name,
                            @RequestParam(value = "musics", required = false) int[] musics) {
        ResultTuple<PlaylistEntity> result = this.playlistService.add(signedUser, name, musics);
        JSONObject response = new JSONObject();
        response.put("result", result.getResult().nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/all", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public PlaylistEntity[] getAll(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        return this.playlistService.getAll(signedUser);
    }

    @RequestMapping(value = "/musics", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public MusicEntity[] getMusics(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                   @RequestParam(value = "index", required = false) int index) {
        ResultTuple<MusicEntity[]> result = this.playlistService.getAllMusicsByIndex(signedUser, index);
        if (result.getResult() != CommonResult.SUCCESS) {
            return new MusicEntity[0];
        }
        return result.getPayload();
    }
}






















