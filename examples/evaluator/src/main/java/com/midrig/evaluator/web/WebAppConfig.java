package com.midrig.evaluator.web;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@EnableWebMvc
@Configuration
@ComponentScan({"com.midrig.evaluator.web","com.midrig.baff.utility.usersecurity", "com.midrig.baff.utility.refdata"})
public class WebAppConfig extends WebMvcConfigurerAdapter {


}
