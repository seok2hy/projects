package com.hjs.meltube.vos;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FileVo {
    private String name;
    private String contentType;
    private byte[] data;
}