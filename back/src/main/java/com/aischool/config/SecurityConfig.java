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
                    "/error",               // 스프링 기본 에러 페이지
                    "/login/**",           // OAuth2 로그인 엔드포인트 허용
                    "/oauth2/**"           // Google/Kakao redirect 허용
                ).permitAll()
                .anyRequest().permitAll() // 임시로 전부 오픈(테스트 끝나면 tighten)
            )

            // OAuth2 로그인 설정
            .oauth2Login(oauth -> oauth
                .loginPage("/login")  // (선택) 사용자 지정 로그인 페이지
                .defaultSuccessUrl("http://localhost:5173", true) // 로그인 성공 시 React로 리다이렉트
            )
            // 로그아웃 설정
            .logout(logout -> logout
                .logoutSuccessUrl("http://localhost:5173/login")  // 로그아웃 후 프런트 로그인 페이지로
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            )

            // 기본 로그인/로그아웃 화면 비활성(선택)
            .formLogin(login -> login.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
