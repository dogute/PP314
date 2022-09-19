package ru.kata.spring.boot_security.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.UserRepository;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, RoleRepository roleRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;

    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsername(username);
        return user;
    }

    @Transactional
    public User getUserById(Long id) {
        Optional<User> userFromDB = userRepository.findById(id);
        return userFromDB.orElse(new User());
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public boolean saveUser(User user) {

        for (Role role : user.getRoles()) {
            role.setId(roleRepository.findAll().stream().filter(i -> i.getRole().equals(role.getRole())).findFirst().get().getId());
        }
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return true;
    }

    @Transactional
    public boolean updateUser(User user) {

        for (Role role : user.getRoles()) {
            role.setId(roleRepository.findAll().stream().filter(i -> i.getRole().equals(role.getRole())).findFirst().get().getId());
        }

        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return true;
    }

    @Transactional
    public boolean deleteUser(Long id) {
        if (userRepository.findById(id).isPresent()) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }



    @Transactional
    public User getAuthUser() {
        User user = (User) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return user;
    }
}
