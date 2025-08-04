package com.hjs.meltube.vos;

import com.hjs.meltube.entities.MusicEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MusicVo extends MusicEntity {
    private int likeCount;
    private boolean isLiked;
}