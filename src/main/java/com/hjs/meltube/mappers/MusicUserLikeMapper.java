package com.hjs.meltube.mappers;

import com.hjs.meltube.entities.MusicUserLikeEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MusicUserLikeMapper {
    int delete(@Param(value = "musicIndex") int musicIndex,
               @Param(value = "userEmail") String userEmail);

    int insert(@Param(value = "musicUserLike") MusicUserLikeEntity musicUserLike);

    MusicUserLikeEntity selectByMusicIndexAndUserEmail(@Param(value = "musicIndex") int musicIndex,
                                                       @Param(value = "userEmail") String userEmail);
}