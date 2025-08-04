package com.hjs.meltube.entities;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "index")
public class PlaylistEntity {
    private int index;
    private String userEmail;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}