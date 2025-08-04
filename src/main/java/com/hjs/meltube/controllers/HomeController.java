package com.hjs.meltube.controllers;

import com.hjs.meltube.entities.UserEntity;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttribute;

@Controller(value = "com.hjs.meltube.controllers.HomeController")
@RequestMapping(value = "/")
public class HomeController {
    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                           HttpServletRequest request) {
        if (signedUser == null) {
            System.out.println("로그인 안 됨");
        } else {
            System.out.printf("로그인 됨 (%s, %s, %s)\n",
                    signedUser.getNickname(),
                    request.getRemoteAddr(),
                    request.getRequestURI());
        }
        return "home/index";
    }

    @RequestMapping(value = "/user-logout", method = RequestMethod.GET)
    public String getUserLogout(HttpSession session) {
        session.setAttribute("signedUser", null);
        return "redirect:/";
    }

    @RequestMapping(value = "/portfolio", method = RequestMethod.GET)
    public String getPortfolio(HttpSession session) {
        return "index";
    }

    @RequestMapping(value = "/kobook", method = RequestMethod.GET)
    public String getKobook(HttpSession session) {
        return "kobook/index";
    }
}
