package com.aischool.config;

import com.aischool.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    // ✅ 이메일로 userId 조회해서 세션에 넣을 때 사용할 서비스
    private final AuthService authService;

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
                // ✅ 로그인 성공 시 세션에 loginUserId 저장
                .successHandler((request, response, authentication) -> {
                    OAuth2User oAuthUser =
                            (OAuth2User) authentication.getPrincipal();
                    OAuth2AuthenticationToken token =
                            (OAuth2AuthenticationToken) authentication;

                    String registrationId =
                            token.getAuthorizedClientRegistrationId(); // google / kakao
                    String email = null;

                    if ("google".equalsIgnoreCase(registrationId)) {
                        // 구글: email 바로 있음
                        email = (String) oAuthUser.getAttribute("email");

                    } else if ("kakao".equalsIgnoreCase(registrationId)) {
                        // 카카오: kakao_account 안에 email
                        Map<String, Object> attr = oAuthUser.getAttributes();
                        Map<String, Object> account =
                                (Map<String, Object>) attr.get("kakao_account");

                        if (account != null) {
                            email = (String) account.get("email");
                        }

                        // CustomOAuth2UserService에서와 동일한 규칙 맞추기
                        if (email == null || email.isBlank()) {
                            String id = String.valueOf(attr.get("id"));
                            email = id + "@kakao.local";
                        }
                    }

                    // 🔸 이메일로 DB 유저 PK 조회
                    Long userId = authService.getUserIdByEmail(email);

                    // 🔸 세션에 loginUserId 저장 → 학습 API가 여기서 읽음
                    request.getSession().setAttribute("loginUserId", userId);

                    // 🔸 로그인 후 프론트로 리다이렉트
                    response.sendRedirect("http://localhost:5173");
                })
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
