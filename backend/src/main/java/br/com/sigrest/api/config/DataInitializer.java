package br.com.sigrest.api.config;

import br.com.sigrest.api.entity.Category;
import br.com.sigrest.api.entity.User;
import br.com.sigrest.api.repository.CategoryRepository;
import br.com.sigrest.api.repository.UserRepository;
import br.com.sigrest.api.service.UserService;
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

    private static final String ADMIN_EMAIL = "admin@admin.com";
    private static final String ADMIN_PLAIN_PASSWORD = "admin123";

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

