package com.tododuk.global.rq;

import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;

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

        if (headerAuthorization != null && !headerAuthorization.isBlank()) {
            if (!headerAuthorization.startsWith("Bearer "))
                throw new IllegalArgumentException("Authorization 헤더가 올바르지 않습니다.");

            apiKey = headerAuthorization.substring("Bearer ".length()).trim();
        } else {
            apiKey = req.getCookies() == null ?
                    "" :
                    Arrays.stream(req.getCookies())
                            .filter(cookie -> "apiKey".equals(cookie.getName()))
                            .map(Cookie::getValue)
                            .findFirst()
                            .orElse("");
        }

        if (apiKey.isBlank()) {
            throw new IllegalArgumentException("로그인 후 이용해주세요.");
        }

        User user = userService
                .findByApiKey(apiKey)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 Api키 입니다."));

        return user;
    }

    //apiKey 쿠키 설정
    public void setCookie(String name, String value) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);

        resp.addCookie(cookie);
    }
}
