package br.com.sigrest.api.service;

import br.com.sigrest.api.entity.User;
import br.com.sigrest.api.exception.BusinessException;
import br.com.sigrest.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    /** Mensagem generica de proposito: nao revela se o problema foi o email ou a senha. */
    public User login(String email, String password){
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException("Email ou senha invalidos", HttpStatus.UNAUTHORIZED);
        }
        return user;
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    /** O ultimo administrador nao pode ser excluido — ninguem fica sem acesso ao sistema. */
    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario nao encontrado", HttpStatus.NOT_FOUND));
        if ("ADMIN".equals(user.getRole()) && userRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole())).count() <= 1) {
            throw new BusinessException("Nao e possivel excluir o ultimo administrador", HttpStatus.CONFLICT);
        }
        userRepository.deleteById(id);
    }
}

