package br.com.sigrest.api.config;

import br.com.sigrest.api.entity.Category;
import br.com.sigrest.api.entity.User;
import br.com.sigrest.api.repository.CategoryRepository;
import br.com.sigrest.api.repository.UserRepository;
import br.com.sigrest.api.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;

    public DataInitializer(UserRepository userRepository, UserService userService,
                           PasswordEncoder passwordEncoder, CategoryRepository categoryRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.categoryRepository = categoryRepository;
    }

    @Value("${app.admin.email:admin@admin.com}")
    private String adminEmail;

    /** Default de desenvolvimento — trocar via ADMIN_PASSWORD antes de qualquer uso real. */
    @Value("${app.admin.password:admin123}")
    private String adminPlainPassword;

    /** Tipos de produto padrão da Maju's Assados e Congelados. */
    private static final Map<String, String> DEFAULT_CATEGORIES = Map.of(
            "Insumo", "Matéria-prima usada na produção",
            "Marmita", "Marmitas congeladas prontas",
            "Produto Pronto", "Produtos prontos para venda",
            "Promoção", "Itens em promoção por período"
    );

    @Override
    public void run(String... args) throws Exception {
        seedDefaultCategories();
        Optional<User> existing = userRepository.findByEmail(adminEmail);

        if (existing.isEmpty()) {
            User admin = new User();
            admin.setName("Master User");
            admin.setEmail(adminEmail);
            admin.setPassword(adminPlainPassword);
            admin.setRole("ADMIN");
            userService.signUp(admin);
            System.out.println("=== Admin criado: " + adminEmail + " ===");
        } else {
            // Garante que a senha sempre está em BCrypt (corrige inserções diretas no banco)
            User admin = existing.get();
            if (!admin.getPassword().startsWith("$2")) {
                admin.setPassword(passwordEncoder.encode(adminPlainPassword));
                userRepository.save(admin);
                System.out.println("=== Senha do admin corrigida para BCrypt ===");
            }
        }
    }

    /** Cria as categorias padrão (idempotente: não duplica as já existentes). */
    private void seedDefaultCategories() {
        DEFAULT_CATEGORIES.forEach((name, description) -> {
            if (!categoryRepository.existsByNameIgnoreCase(name)) {
                Category category = new Category();
                category.setName(name);
                category.setDescription(description);
                categoryRepository.save(category);
                System.out.println("=== Categoria padrão criada: " + name + " ===");
            }
        });
    }
}

