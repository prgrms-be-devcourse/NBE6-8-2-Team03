package com.tododuk.domain.user.controller;

import com.tododuk.domain.user.dto.UserDto;
import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.service.UserService;
import com.tododuk.global.rsData.RsData;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
public class UserController {
    private final UserService userService;

    record UserJoinReqDto(
            @NotBlank
            @Size(min = 2, max = 30)
            String email,
            @NotBlank
            @Size(min = 2, max = 30)
            String password,
            @NotBlank
            @Size(min = 2, max = 30)
            String nickname
    ) {
    }

    @PostMapping("/register")
    public RsData<UserDto> join(
            @Valid @RequestBody UserJoinReqDto reqBody
    ){
        userService.findByUserEmail(reqBody.email)
                .ifPresent(_user -> {
                    throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
                });

        User user = userService.join(
                reqBody.email(),
                reqBody.password(),
                reqBody.nickname()
        );

        return new RsData<>(
                "201-1",
                "%s님 환영합니다. 회원가입이 완료되었습니다.".formatted(user.getNickName()),
                new UserDto(user)
        );
    }

    record UserLoginReqDto(
            @NotBlank
            @Size(min = 2, max = 30)
            String email,
            @NotBlank
            @Size(min = 2, max = 30)
            String password
    ) {
    }

    record UserLoginResDto(

            UserDto userDto,
            String apiKey
    ) {
    }
    @PostMapping("/login")
    public RsData<UserLoginResDto> login(
            @Valid @RequestBody UserLoginReqDto reqBody
    ) {
        User user = userService.findByUserEmail(reqBody.email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다."));

        if (!user.getPassword().equals(reqBody.password)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        //dto 안에 기본 정보만 포함되어있음
        return new RsData<>(
                "201-1",
                "%s님 환영합니다.".formatted(user.getNickName()),
                new UserLoginResDto(
                        new UserDto(user),
                        user.getApiKey()
                )
        );
    }

    // 내 정보 조회 : 고유번호, 이메일, 닉네임, 프로필 사진
    @GetMapping("/me")
    public RsData<UserDto> getMyInfo(
            @RequestHeader("Authorization") String authorization
    ){
        String apiKey = authorization.replace("Bearer ", "");
        User user = userService.findByApiKey(apiKey)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 apiKey 입니다."));

        return new RsData<>(
                "200-1",
                "내 정보 조회 성공",
                new UserDto(user)
        );
    }
    // 내 정보 수정 : 닉네임, 프로필 사진 변경 가능
    @PostMapping("/me")
    public RsData<UserDto> updateMyInfo(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody UserDto reqBody
    ){
        String apiKey = authorization.replace("Bearer ", "");
        User user = userService.findByApiKey(apiKey)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 apiKey 입니다."));

        userService.updateUserInfo(user, reqBody);

        return new RsData<>(
                "200-1",
                "내 정보 수정 성공",
                new UserDto(user)
        );
    }

}
