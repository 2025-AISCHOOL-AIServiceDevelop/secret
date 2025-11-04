package com.aischool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (테스트용)
            .csrf(csrf -> csrf.disable())
            // ✅ CORS 설정 추가
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 요청 권한
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/translate/**",
                    "/api/contents/**",   // ✅ 프론트 검색 API 허용 추가
                    "/error",
                    "/login/**",
                    "/oauth2/**"
                ).permitAll()
                .anyRequest().permitAll()
            )

            // OAuth2 로그인 설정
            .oauth2Login(oauth -> oauth
                .loginPage("/login")
                .defaultSuccessUrl("http://localhost:5173", true)
            )

            // 로그아웃 설정
            .logout(logout -> logout
                .logoutSuccessUrl("http://localhost:5173/login")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            )

            .formLogin(login -> login.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }

    // ✅ 프론트엔드와의 CORS 통신 허용 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173")); // React dev 서버
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true); // 쿠키/세션 공유 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
