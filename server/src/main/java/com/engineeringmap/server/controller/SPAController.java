package com.engineeringmap.server.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SPAController {

    // This will catch all routes that are NOT API routes or static resources
    @RequestMapping(value = "/{path:^(?!api)(?!static).*$}/**")
    public String forwardToIndex() {
        return "forward:/index.html";
    }
    
    // Handle root path
    @RequestMapping("/")
    public String index() {
        return "forward:/index.html";
    }
}