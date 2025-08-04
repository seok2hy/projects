package com.hjs.meltube.mappers;

import com.hjs.meltube.entities.MusicEntity;
import com.hjs.meltube.vos.MusicVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MusicMapper {
    int deleteByIndex(@Param(value = "index") int index);

    int insert(@Param(value = "music") MusicEntity music);

    MusicVo[] search(@Param(value = "userEmail") String userEmail,
                     @Param(value = "keyword") String keyword);

    MusicEntity selectByIndex(@Param(value = "index") int index);

    MusicEntity selectByIndexWithCover(@Param(value = "index") int index);

    MusicEntity[] selectByUserEmail(@Param(value = "userEmail") String userEmail);

    int selectCountByYoutubeId(@Param(value = "youtubeId") String youtubeId);
}