// package com.engineeringmap.server.config;

// import org.springframework.boot.CommandLineRunner;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// import com.engineeringmap.server.entity.Role;
// import com.engineeringmap.server.entity.RoleType;
// import com.engineeringmap.server.repo.RoleRepo;

// @Configuration
// public class StartupConfig {

//   // assign a default role (like RoleType.USER) to the new user,
//     @Bean
//     public CommandLineRunner seedRoles(RoleRepo roleRepo) {
//         return args -> {
//             if (roleRepo.findAll().isEmpty()) {
                
//                 roleRepo.save(new Role(null, RoleType.USER));
//                 roleRepo.save(new Role(null, RoleType.ADMIN));
//                 System.out.println(" Roles seeded.");
//             }
//         };
//     }
// }
