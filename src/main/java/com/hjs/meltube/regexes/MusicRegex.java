package com.hjs.meltube.regexes;

import lombok.experimental.UtilityClass;

@UtilityClass
public class MusicRegex {
    public static final Regex artist = new Regex("^(.{1,100})$");
    public static final Regex album = new Regex("^(.{1,100})$");
    public static final Regex name = new Regex("^(.{1,100})$");
    public static final Regex _name = MusicRegex.name;
    public static final Regex genre = new Regex("^(.{1,100})$");
    public static final Regex lyrics = new Regex("^([\\s\\S]{1,10000})$");
    public static final Regex releaseDate = CommonRegex.iso8601Date;
    public static final Regex youtubeId = new Regex("^([\\da-zA-Z\\-_]{11})$");
}