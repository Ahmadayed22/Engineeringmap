package com.engineeringmap.server.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestControlerr {
    
    @GetMapping("/hello")
    public String hello() {
        return "Hello, World!";
    }
}
