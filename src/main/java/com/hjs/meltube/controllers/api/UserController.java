package com.hjs.meltube.controllers.api;

import com.hjs.meltube.entities.UserEntity;
import com.hjs.meltube.results.CommonResult;
import com.hjs.meltube.results.Result;
import com.hjs.meltube.results.ResultTuple;
import com.hjs.meltube.services.UserService;
import jakarta.servlet.http.HttpSession;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController(value = "com.yhp.meltube.controllers.api.UserController")
@RequestMapping(value = "/api/user")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/check-email", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public String postCheckEmail(@RequestParam(value = "email", required = false) String email) {
        Result result = this.userService.isEmailAvailable(email);
        JSONObject response = new JSONObject();
        response.put("result", result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/check-nickname", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public String postCheckNickname(@RequestParam(value = "nickname", required = false) String nickname) {
        Result result = this.userService.isNicknameAvailable(nickname);
        JSONObject response = new JSONObject();
        response.put("result", result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/login", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public String postLogin(@RequestParam(value = "email", required = false) String email,
                            @RequestParam(value = "password", required = false) String password,
                            HttpSession session) {
        ResultTuple<UserEntity> resultTuple = this.userService.login(email, password);
        if (resultTuple.getResult() == CommonResult.SUCCESS) {
            session.setAttribute("signedUser", resultTuple.getPayload());
        }
        JSONObject response = new JSONObject();
        response.put("result", resultTuple.getResult().nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public String postRegister(UserEntity user) {
        Result result = this.userService.register(user);
        JSONObject response = new JSONObject();
        response.put("result", result.nameToLower());
        return response.toString();
    }
}














