package com.engineeringmap.server.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class SPAController {
  // Matches root "/"
    @GetMapping("/")
    public String root() {
        return "forward:/index.html";
    }

    // Matches all frontend routes except API routes
    @GetMapping("/{path:^(?!api$).*$}/**")
    public String forward() {
        return "forward:/index.html";
    }
}