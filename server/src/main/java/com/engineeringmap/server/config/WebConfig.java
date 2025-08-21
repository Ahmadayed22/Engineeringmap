package com.engineeringmap.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Forward non-API paths to index.html, excluding API endpoints and static resources
        registry.addViewController("/{spring:^(?!api|static|webjars|\\.js|\\.css|\\.ico|\\.png|\\.jpg|\\.jpeg|\\.gif|\\.woff|\\.woff2|\\.ttf|\\.eot|\\.svg$).*$}/**")
                .setViewName("forward:/index.html");
    }
}