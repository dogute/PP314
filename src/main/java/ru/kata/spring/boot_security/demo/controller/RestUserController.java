package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.List;

@RequestMapping("/api/users")
@RestController
public class RestUserController {

    @Autowired
    private UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<User> showAllUsers() {
        List<User> list = userService.getAllUsers();
        return list;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public List<User> addUser(@RequestBody User user) {
        userService.saveUser(user);
        return userService.getAllUsers();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public User showUser(@PathVariable long id) {
        User user = userService.getUserById(id);
        return user;
    }

    @GetMapping("/auth_user")
    public User getAuthUser() {
        return userService.getAuthUser();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public List<User> updateUser(@RequestBody User user, @PathVariable Long id) {
        user.setId(id);
        userService.updateUser(user);
        return userService.getAllUsers();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public List<User> deleteUser(@PathVariable long id) {
        userService.deleteUser(id);
        return userService.getAllUsers();
    }
}