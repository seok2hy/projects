package com.hjs.meltube.mappers;

import com.hjs.meltube.entities.MusicEntity;
import com.hjs.meltube.entities.PlaylistMusicMappingEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PlaylistMusicMappingMapper {
    int deleteAllByPlaylistIndex(@Param(value = "playlistIndex") int playlistIndex);

    int insert(@Param(value = "playlistMusicMapping")PlaylistMusicMappingEntity playlistMusicMapping);

    MusicEntity[] selectAllByPlaylistIndexAsMusic(@Param(value = "playlistIndex") int playlistIndex);
}