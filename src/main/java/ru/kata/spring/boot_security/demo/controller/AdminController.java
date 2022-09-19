package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.service.UserService;

@Controller
@RequestMapping("/admin/*")
public class AdminController {

    private final UserService userService;

    @Autowired
    public AdminController (UserService userService){
        this.userService = userService;
    }

    @GetMapping("/")
    public String userList(Model model) {
        return "adminPage";
    }
}
