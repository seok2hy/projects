package com.hjs.meltube.mappers;

import com.hjs.meltube.entities.MusicEntity;
import com.hjs.meltube.entities.PlaylistEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PlaylistMapper {
    int insert(@Param(value = "playlist") PlaylistEntity playlist);

    PlaylistEntity selectByIndex(@Param(value = "index") int index);

    PlaylistEntity selectByUserEmailAndName(@Param(value = "userEmail") String userEmail,
                                            @Param(value = "name") String name);

    PlaylistEntity[] selectAllByUserEmail(@Param(value = "userEmail") String userEmail);

    MusicEntity[] selectAllMusicsByIndex(@Param(value = "index") int index);

    int update(@Param(value = "playlist") PlaylistEntity playlist);
}