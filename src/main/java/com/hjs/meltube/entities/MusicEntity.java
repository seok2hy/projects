package com.hjs.meltube.entities;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "index")
public class MusicEntity {
    public enum Statuses {
        ALLOWED,
        DENIED,
        PENDING
    }

    private int index;
    private String userEmail;
    private String artist;
    private String album;
    private String name;
    private String genre;
    private String lyrics;
    private LocalDate releaseDate;
    private byte[] coverImageData;
    private String coverImageName;
    private String coverImageContentType;
    private String youtubeId;
    private String status;
    private String deniedReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isDeleted;
}