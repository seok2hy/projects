package com.hjs.meltube.results.user;

import com.hjs.meltube.results.Result;

public enum RegisterResult implements Result {
    FAILURE_DUPLICATE_EMAIL,
    FAILURE_DUPLICATE_NICKNAME
}