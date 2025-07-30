package com.tododuk.global.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    //비밀번호 암호화
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(

                        auth -> auth
                                //웹 아이콘 접근 허용
                                .requestMatchers("/favicon.ico").permitAll()
                                // H2 콘솔 접근 허용
                                .requestMatchers("/h2-console/**").permitAll()
                                // 접근 허용
                                .requestMatchers("/**").permitAll()
                                .anyRequest().authenticated()
                )
                .headers(
                        headers -> headers
                                .frameOptions(
                                        HeadersConfigurer.FrameOptionsConfig::sameOrigin
                                )
                        // csrf 설정 끔 (rest api에서는 csrf를 사용하지 않음)
                ).csrf(
                        AbstractHttpConfigurer::disable
                );

        return http.build();
    }
}
