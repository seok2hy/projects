package com.hjs.meltube.entities;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "email")
public class UserEntity {
    private String email;
    private String password;
    private String nickname;
    private LocalDateTime createdAt;
    private boolean isAdmin;
    private boolean isDeleted;
    private boolean isSuspended;
}