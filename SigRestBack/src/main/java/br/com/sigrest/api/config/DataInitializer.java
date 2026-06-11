package br.com.sigrest.api.config;

import br.com.sigrest.api.entity.User;
import br.com.sigrest.api.repository.UserRepository;
import br.com.sigrest.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail("admin@admin.com").isEmpty()) {
            User admin = new User();
            admin.setName("Master User");
            admin.setEmail("admin@admin.com");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            userService.signUp(admin);
            System.out.println("==========================================================");
            System.out.println("UsuÃ¡rio master criado com sucesso: admin@admin.com / admin123");
            System.out.println("==========================================================");
        }
    }
}

