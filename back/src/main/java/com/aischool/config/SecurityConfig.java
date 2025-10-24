package com.aischool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF는 Postman 테스트 시 비활성화
            .csrf(csrf -> csrf.disable())
            // CORS 기본
            .cors(Customizer.withDefaults())
            // 요청 권한
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/translate/**",   // 번역 테스트 열기
                    "/error"               // 스프링 기본 에러 페이지
                ).permitAll()
                .anyRequest().permitAll() // 임시로 전부 오픈(테스트 끝나면 tighten)
            )
            // 기본 로그인/로그아웃 화면 비활성(선택)
            .formLogin(login -> login.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
