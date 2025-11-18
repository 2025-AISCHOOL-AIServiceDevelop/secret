package com.aischool.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String loginPage() {
        // 실제 페이지는 없지만, Spring Security가 OAuth2 로그인으로 리다이렉트만 하면 됨
        return "redirect:/oauth2/authorization/google";
    }
}
