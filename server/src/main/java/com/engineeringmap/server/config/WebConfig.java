// package com.engineeringmap.server.config;

// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
// import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @Configuration
// public class WebConfig implements WebMvcConfigurer {
    
// @Override
// public void addResourceHandlers(ResourceHandlerRegistry registry) {
//     // Serve from dist folder
//     registry.addResourceHandler("/**")
//             .addResourceLocations("classpath:/static/dist/");
    
//     // Serve assets
//     registry.addResourceHandler("/assets/**")
//             .addResourceLocations("classpath:/static/dist/assets/");
// }
// }