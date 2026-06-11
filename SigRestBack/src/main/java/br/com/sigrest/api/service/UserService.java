package br.com.sigrest.api.service;

import br.com.sigrest.api.entity.User;
import br.com.sigrest.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User signUp(User user){
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User login(String email, String password){
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("UsuÃ¡rio nÃ£o encontrado"));
        if(!passwordEncoder.matches(password, user.getPassword())){
            throw new RuntimeException("Senha incorreta.");
        }
        return user;
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }
}

