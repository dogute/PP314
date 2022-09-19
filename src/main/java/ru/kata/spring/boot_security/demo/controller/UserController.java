package ru.kata.spring.boot_security.demo.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import ru.kata.spring.boot_security.demo.model.User;

@Controller
@RequestMapping("/user/*")
public class UserController {

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/")
    public String userList(@AuthenticationPrincipal User user, Model model) {
        model.addAttribute("authorisedUser", user);
        return "userPage";
    }
}
