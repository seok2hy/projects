package com.hjs.meltube.regexes;

import lombok.experimental.UtilityClass;

@UtilityClass
public class UserRegex {
    public static final Regex email = new Regex("^(?=.{8,50}$)([\\da-z\\-_.]{4,})@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2,3})?$");
    public static final Regex password = new Regex("^([\\da-zA-Z`~!@#$%^&*\\(\\)\\-_=+\\[\\{\\]\\}\\\\\\|;:'\",<.>\\/?]{8,50})$");
    public static final Regex nickname = new Regex("^([\\da-zA-Z가-힣]{2,10})$");
}