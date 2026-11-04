package com.engineeringmap.server.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the React app for client-side routes so a page refresh or a shared link
 * (e.g. /progress/abc123, /course/23) works. Paths with a dot are static files, and
 * anything under /api is left to the API (unknown API paths still return 404).
 */
@Controller
public class SPAController {

    @GetMapping(value = {
            "/",
            "/{p1:(?!api$)[^.]*}",
            "/{p1:(?!api$)[^.]*}/{p2:[^.]*}",
            "/{p1:(?!api$)[^.]*}/{p2:[^.]*}/{p3:[^.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
