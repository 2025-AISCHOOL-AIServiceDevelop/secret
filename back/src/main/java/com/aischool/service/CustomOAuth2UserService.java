package com.aischool.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final AuthService authService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId(); // google or kakao
        Map<String, Object> attr = oAuth2User.getAttributes();

        if ("google".equalsIgnoreCase(registrationId)) {
            String sub = (String) attr.get("sub");
            String email = (String) attr.get("email");
            String name = (String) attr.get("name");
            String picture = (String) attr.get("picture");
            authService.upsertOAuthUser("google", email, name, picture, sub);

        } else if ("kakao".equalsIgnoreCase(registrationId)) {
            String id = String.valueOf(attr.get("id"));
            Map<String, Object> account = (Map<String, Object>) attr.get("kakao_account");
            String email = account != null ? (String) account.get("email") : null;
            Map<String, Object> profile = account != null ? (Map<String, Object>) account.get("profile") : null;
            String name = profile != null ? (String) profile.get("nickname") : null;
            String picture = profile != null ? (String) profile.get("profile_image_url") : null;

            if (email == null || email.isBlank()) {
                email = id + "@kakao.local";
            }

            authService.upsertOAuthUser("kakao", email, name, picture, id);
        }

        return oAuth2User;
    }
}
