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

    @Transactional
    public User upsertOAuthUser(String provider, String email, String name, String profile, String providerId) {
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
}
