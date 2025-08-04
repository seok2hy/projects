package com.hjs.meltube.services;

import com.hjs.meltube.entities.UserEntity;
import com.hjs.meltube.mappers.UserMapper;
import com.hjs.meltube.regexes.UserRegex;
import com.hjs.meltube.results.CommonResult;
import com.hjs.meltube.results.Result;
import com.hjs.meltube.results.ResultTuple;
import com.hjs.meltube.results.user.LoginResult;
import com.hjs.meltube.results.user.RegisterResult;
import com.hjs.meltube.utils.CryptoUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service(value = "com.yhp.meltube.services.UserService")
public class UserService {
    private final UserMapper userMapper;

    @Autowired
    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public Result isEmailAvailable(String email) {
        if (!UserRegex.email.matches(email)) {
            return CommonResult.FAILURE;
        }
        return this.userMapper.selectCountByEmail(email) == 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result isNicknameAvailable(String nickname) {
        if (!UserRegex.nickname.matches(nickname)) {
            return CommonResult.FAILURE;
        }
        return this.userMapper.selectCountByNickname(nickname) == 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public ResultTuple<UserEntity> login(String email, String password) {
        if (!UserRegex.email.matches(email) || !UserRegex.password.matches(password)) {
            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }
        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null || dbUser.isDeleted()) {
            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }
        String hashedPassword = CryptoUtils.hashSha512(password);
        if (!dbUser.getPassword().equals(hashedPassword)) {
            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }
        if (dbUser.isSuspended()) {
            return ResultTuple.<UserEntity>builder().result(LoginResult.FAILURE_SUSPENDED).build();
        }
        return ResultTuple.<UserEntity>builder()
                .payload(dbUser)
                .result(CommonResult.SUCCESS)
                .build();
    }

    public Result register(UserEntity user) {
        if (user == null ||
            !UserRegex.email.matches(user.getEmail()) ||
            !UserRegex.password.matches(user.getPassword()) ||
            !UserRegex.nickname.matches(user.getNickname())) {
            return CommonResult.FAILURE;
        }
        if (this.userMapper.selectCountByEmail(user.getEmail()) > 0) {
            return RegisterResult.FAILURE_DUPLICATE_EMAIL;
        }
        if (this.userMapper.selectCountByNickname(user.getNickname()) > 0) {
            return RegisterResult.FAILURE_DUPLICATE_NICKNAME;
        }
        user.setPassword(CryptoUtils.hashSha512(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setAdmin(false);
        user.setDeleted(false);
        user.setSuspended(false);
        return this.userMapper.insert(user) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}











