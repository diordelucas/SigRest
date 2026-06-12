package br.com.sigrest.api.config;

import br.com.sigrest.api.entity.User;
import br.com.sigrest.api.repository.UserRepository;
import br.com.sigrest.api.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, UserService userService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    private static final String ADMIN_EMAIL = "admin@admin.com";
    private static final String ADMIN_PLAIN_PASSWORD = "admin123";

    @Override
    public void run(String... args) throws Exception {
        Optional<User> existing = userRepository.findByEmail(ADMIN_EMAIL);

        if (existing.isEmpty()) {
            User admin = new User();
            admin.setName("Master User");
            admin.setEmail(ADMIN_EMAIL);
            admin.setPassword(ADMIN_PLAIN_PASSWORD);
            admin.setRole("ADMIN");
            userService.signUp(admin);
            System.out.println("=== Admin criado: " + ADMIN_EMAIL + " ===");
        } else {
            // Garante que a senha sempre está em BCrypt (corrige inserções diretas no banco)
            User admin = existing.get();
            if (!admin.getPassword().startsWith("$2")) {
                admin.setPassword(passwordEncoder.encode(ADMIN_PLAIN_PASSWORD));
                userRepository.save(admin);
                System.out.println("=== Senha do admin corrigida para BCrypt ===");
            }
        }
    }
}

