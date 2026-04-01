package com.hostel;

import com.hostel.model.User;
import com.hostel.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class HostelApplication {

    public static void main(String[] args) {
        SpringApplication.run(HostelApplication.class, args);
    }

    /**
     * Seeds the admin user on first startup if no users exist.
     * Admin: adminhostel@gmail.com / passhostel
     */
    @Bean
    CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("adminhostel@gmail.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("adminhostel@gmail.com");
                admin.setPassword(passwordEncoder.encode("passhostel"));
                userRepository.save(admin);
                System.out.println("✅ Admin user seeded: adminhostel@gmail.com");
            } else {
                System.out.println("ℹ️  Admin user already exists.");
            }
        };
    }
}
