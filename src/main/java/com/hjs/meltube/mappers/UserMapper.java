package com.hjs.meltube.mappers;

import com.hjs.meltube.entities.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    int insert(@Param(value = "user") UserEntity user);

    int selectCountByEmail(@Param(value = "email") String email);

    int selectCountByNickname(@Param(value = "nickname") String nickname);

    UserEntity selectByEmail(@Param(value = "email") String email);
}