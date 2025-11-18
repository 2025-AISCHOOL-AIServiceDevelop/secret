package com.aischool.service;

import com.aischool.entity.User;
import com.aischool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    // ✅ 소셜 로그인 시 유저 생성/업데이트
    @Transactional
    public User upsertOAuthUser(String provider,
                                String email,
                                String name,
                                String profile,
                                String providerId) {

        return userRepository.findByEmail(email)
                .map(u -> {
                    u.updateFromOAuth(name, profile);
                    return u;
                })
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(email)
                                .userName(name)
                                .profile(profile)
                                .provider(provider)
                                .providerId(providerId)
                                .build()
                ));
    }

    // ✅ SecurityConfig 의 successHandler에서 사용하는 메서드
    //    이메일로 DB User를 찾고, 그 PK(id)를 돌려줌
    @Transactional(readOnly = true)
    public Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다: " + email));
    }
}
