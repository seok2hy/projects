package com.hjs.meltube.configs;

import com.hjs.meltube.interceptors.DevInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
//        registry.addInterceptor(this.devInterceptor())
//                .excludePathPatterns("/assets/**");
    }

    @Bean
    public DevInterceptor devInterceptor() {
        return new DevInterceptor();
    }
}