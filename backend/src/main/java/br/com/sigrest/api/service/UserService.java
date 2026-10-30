package br.com.sigrest.api.service;

import br.com.sigrest.api.dto.UserUpdateRequestDTO;
import br.com.sigrest.api.entity.User;
import br.com.sigrest.api.exception.BusinessException;
import br.com.sigrest.api.exception.ErrorCode;
import br.com.sigrest.api.repository.UserRepository;
import br.com.sigrest.api.service.audit.LogAtividadeService;
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

    @Autowired
    private LogAtividadeService logAtividadeService;

    public User signUp(User user){
        String email = normalizeEmail(user.getEmail());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException(ErrorCode.USER_EMAIL_DUPLICADO);
        }
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /** Edição pelo administrador. Senha em branco mantém a atual; o último admin não perde o perfil. */
    public User update(Long id, UserUpdateRequestDTO dto, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NAO_ENCONTRADO));
        String email = normalizeEmail(dto.email());
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new BusinessException(ErrorCode.USER_EMAIL_DUPLICADO);
        }
        if ("ADMIN".equals(user.getRole()) && !"ADMIN".equals(dto.role()) && countAdmins() <= 1) {
            throw new BusinessException(ErrorCode.USER_ULTIMO_ADMIN,
                    "Não é possível tirar o perfil do último administrador do sistema.");
        }
        user.setName(dto.name().trim());
        user.setEmail(email);
        user.setRole(dto.role());
        if (dto.password() != null && !dto.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.password()));
        }
        User saved = userRepository.save(user);
        logAtividadeService.registrar("EDITAR_USUARIO", "User", saved.getId(),
                "Usuário editado: " + saved.getEmail(), currentUser);
        return saved;
    }

    /** Troca de senha pelo próprio usuário, exigindo a senha atual. */
    public void changeOwnPassword(User currentUser, String currentPassword, String newPassword) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NAO_ENCONTRADO));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException(ErrorCode.USER_SENHA_ATUAL_INCORRETA);
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logAtividadeService.registrar("ALTERAR_SENHA", "User", user.getId(),
                "Senha alterada pelo próprio usuário", user);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private long countAdmins() {
        return userRepository.findAll().stream().filter(u -> "ADMIN".equals(u.getRole())).count();
    }

    /** Mensagem generica de proposito: nao revela se o problema foi o email ou a senha. */
    public User login(String email, String password){
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email)).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException(ErrorCode.AUTH_CREDENCIAIS_INVALIDAS);
        }
        return user;
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    /** O ultimo administrador nao pode ser excluido — ninguem fica sem acesso ao sistema. */
    public void delete(Long id, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NAO_ENCONTRADO));
        if (currentUser != null && id.equals(currentUser.getId())) {
            throw new BusinessException(ErrorCode.USER_AUTOEXCLUSAO);
        }
        if ("ADMIN".equals(user.getRole()) && countAdmins() <= 1) {
            throw new BusinessException(ErrorCode.USER_ULTIMO_ADMIN);
        }
        userRepository.deleteById(id);
        logAtividadeService.registrar("EXCLUIR_USUARIO", "User", id,
                "Usuário removido: " + user.getEmail(), logAtividadeService.usuarioAtual());
    }
}

