package com.hjs.meltube.entities;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "index")
public class PlaylistMusicMappingEntity {
    private int index;
    private int playlistIndex;
    private int musicIndex;
}