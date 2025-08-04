package com.hjs.meltube.entities;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = {"musicIndex", "userEmail"})
public class MusicUserLikeEntity {
    private int musicIndex;
    private String userEmail;
    private LocalDateTime createdAt;
}