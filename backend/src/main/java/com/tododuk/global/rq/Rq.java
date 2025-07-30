package com.tododuk.global.rq;

import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class Rq {
    private final UserService userService;
    private final HttpServletRequest req;
    private final HttpServletResponse resp;

    //로그인 사용자 정보 가져오기 + apiKey 검증
    public User getActor() {
        String headerAuthorization = req.getHeader("Authorization");

        String apiKey;
        String accessToken;

        //Authentication 헤더에서 조회 시도
        //인증,인가 52강 통해 리펙토링 필요
        if (headerAuthorization != null && !headerAuthorization.isBlank()) {
            if (!headerAuthorization.startsWith("Bearer "))
                throw new IllegalArgumentException("Authorization 헤더가 올바르지 않습니다.");
            // Bearer 토큰에서 apiKey, accessToken 추출 (Authorization = Bearer apiKey accessToken)
            String[] headerParts = headerAuthorization.split(" ",3);
            apiKey = headerParts[1];
            accessToken = headerParts.length == 3 ? headerParts[2] : "";
        //Authentication 헤더가 없는 경우 쿠키에서 조회
        } else {
            apiKey = getCookieValue("apiKey", "");
            accessToken = getCookieValue("accessToken", "");
        }

        if (apiKey.isBlank()) {
            throw new IllegalArgumentException("로그인 후 이용해주세요.");
        }
        User user = null;

        //accessToken으로 데이터 조회 시도
        if (!accessToken.isBlank()) {
            Map<String,Object> payload = userService.payload(accessToken);

            if (payload != null) {
                //accessToken의 payload에서 사용자 정보 추출
                //로그인 유저는 반드시 accessToken을 가지고 있으므로
                //쿼리검색 안하고 payload에서 바로 사용자 정보 추출
                int id = (int) payload.get("id");
                String userEmail = (String) payload.get("userEmail");
                user = new User(id, userEmail);
            }
        }
        //accessToken이 없거나 유효하지 않은 경우 apiKey로 사용자 조회
        if (user == null) {
            user = userService
                    .findByApiKey(apiKey)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 Api키 입니다."));
        }

        return user;
    }

    private String getHeader(String name, String defaultValue) {
        return Optional
                .ofNullable(req.getHeader(name))
                .filter(headerValue -> !headerValue.isBlank())
                .orElse(defaultValue);
    }

    private String getCookieValue(String name, String defaultValue) {
        return Optional
                .ofNullable(req.getCookies())
                .flatMap(
                        cookies ->
                                Arrays.stream(cookies)
                                        .filter(cookie -> cookie.getName().equals(name))
                                        .map(Cookie::getValue)
                                        .filter(value -> !value.isBlank())
                                        .findFirst()
                )
                .orElse(defaultValue);
    }

    //apiKey 쿠키 설정
    public void setCookie(String name, String value) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);

        if (value == null || value.isBlank()) {
            cookie.setMaxAge(0);
        }

        resp.addCookie(cookie);
    }

    //apiKey가 삭제되는 쿠키 생성
    public void deleteCookie(String name) {
        setCookie(name, null);

    }
}
