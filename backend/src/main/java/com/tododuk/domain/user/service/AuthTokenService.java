package com.tododuk.domain.user.service;

import com.tododuk.domain.user.entity.User;
import com.tododuk.standard.util.Ut;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthTokenService {
    //액세스 토큰 생성
    public String genAccessToken(User user) {
        long id = user.getId();
        String email = user.getUserEmail();

        return Ut.jwt.toString(
                "abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890",
                // 토큰 만료 시간 1년
                60 * 60 * 24 * 365,
                Map.of("id", id, "email", email)
        );
    }
}
