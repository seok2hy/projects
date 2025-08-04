package com.hjs.meltube.results;

import java.util.Locale;

public interface Result {
    String name();

    default String nameToLower() {
        return this.name().toLowerCase();
    }
}