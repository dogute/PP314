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
import ru.kata.spring.boot_security.demo.dao.UserDao;
import ru.kata.spring.boot_security.demo.dao.RoleDao;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserDao userDao;
    private final RoleDao roleDao;

    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public UserService(UserDao userDao, RoleDao roleDao, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.roleDao = roleDao;
        this.userDao = userDao;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;

    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) {
        User user = userDao.findByUsername(username);
        return user;
    }

    @Transactional
    public User getUserById(Long id) {
        Optional<User> userFromDB = userDao.findById(id);
        return userFromDB.orElse(new User());
    }

    public List<User> getAllUsers() {
        return userDao.findAll();
    }

    @Transactional
    public boolean saveUser(User user) {

        for (Role role : user.getRoles()) {
            role.setId(roleDao.findAll().stream().filter(i -> i.getRole().equals(role.getRole())).findFirst().get().getId());
        }
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        userDao.save(user);
        return true;
    }

    @Transactional
    public boolean updateUser(User user) {

        for (Role role : user.getRoles()) {
            role.setId(roleDao.findAll().stream().filter(i -> i.getRole().equals(role.getRole())).findFirst().get().getId());
        }

        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        userDao.save(user);
        return true;
    }

    @Transactional
    public boolean deleteUser(Long id) {
        if (userDao.findById(id).isPresent()) {
            userDao.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public List<Role> getAllRoles() {
        return roleDao.findAll();
    }



    @Transactional
    public User getAuthUser() {
        User user = (User) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return user;
    }
}
