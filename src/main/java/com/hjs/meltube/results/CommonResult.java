package com.hjs.meltube.results;

public enum CommonResult implements Result {
    FAILURE,
    FAILURE_DENIED,
    FAILURE_DUPLICATE,
    FAILURE_NO_AFFILIATION,
    FAILURE_SESSION_EXPIRED,
    SUCCESS
}