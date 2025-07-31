package com.tododuk.global.security;

import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.service.spi.ServiceException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.tododuk.global.rq.Rq;

@Component
@RequiredArgsConstructor
@Log
public class CustomAuthenticationFilter extends OncePerRequestFilter {
    private final Rq rq;
    private  final UserService userService;
    //커스텀 인증 필터 (액션 메서드 실행 전 작동)
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 로그레벨 디버그인 경우에만 로그 남김
        logger.debug("CustomAuthenticationFilter: processing request for: " + request.getRequestURI());

        //api요청이 아니면 패스
        if (!request.getRequestURI().startsWith("/api/")){
            filterChain.doFilter(request, response);
            return;
        }

        // 인증,인가가 필요 없는 요청이면 패스
        if (List.of(
                "/api/v1/user/register",
                "/api/v1/user/login",
                "/api/v1/user/logout"
        ).contains(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        // 인증, 인가가 필요한 요청인 경우
        String apiKey;
        String accessToken;
        String headerAuthorization = rq.getHeader("Authorization", "");

        //Authentication 헤더에서 조회 시도
        if (headerAuthorization != null && !headerAuthorization.isBlank()) {
            if (!headerAuthorization.startsWith("Bearer "))
                throw new IllegalArgumentException("Authorization 헤더가 올바르지 않습니다.");
            // Bearer 토큰에서 apiKey, accessToken 추출 (Authorization = Bearer apiKey accessToken)
            String[] headerParts = headerAuthorization.split(" ",3);
            apiKey = headerParts[1];
            accessToken = headerParts.length == 3 ? headerParts[2] : "";
            //Authentication 헤더가 없는 경우 쿠키에서 조회
        } else {
            apiKey = rq.getCookieValue("apiKey", "");
            accessToken = rq.getCookieValue("accessToken", "");
        }

        logger.debug("apiKey : " + apiKey);
        logger.debug("accessToken : " + accessToken);

        // apiKey와 accessToken이 모두 비어있으면 그냥 통과 (인증, 인가가 필요 없는 요청)
        boolean isApiKeyExists = !apiKey.isBlank();
        boolean isAccessTokenExists = !accessToken.isBlank();

        if (!isApiKeyExists && !isAccessTokenExists) {
            filterChain.doFilter(request, response);
            return;
        }

        //조회 시도
        User user = null;
        boolean isAccessTokenValid = false;

        if (isAccessTokenExists) {
            Map<String, Object> payload = userService.payload(accessToken);

            if (payload != null) {
                int id = (int) payload.get("id");
                String userEmail = (String) payload.get("userEmail");
                user = new User(id, userEmail);

                isAccessTokenValid = true;
            }
        }

        if (user == null) {
            user = userService
                    .findByApiKey(apiKey)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 Api키 입니다."));
        }

        if (isAccessTokenExists && !isAccessTokenValid) {

            String actorAccessToken = userService.genAccessToken(user);
            rq.setCookie("accessToken", actorAccessToken);
            rq.setHeader("Authorization", actorAccessToken);
        }

        // 다음 필터로 요청을 전달
        filterChain.doFilter(request, response);
    }
}
