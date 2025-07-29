package com.tododuk.domain.user.dto;

import com.tododuk.domain.user.entity.User;

public record UserDto(
    int id,
    String nickname,
    String email,
    String profileImageUrl
){
    public UserDto(User user) {
        this(
            user.getId(),
            user.getNickName(),
            user.getUserEmail(),
            user.getProfileImgUrl()
        );
    }
}



