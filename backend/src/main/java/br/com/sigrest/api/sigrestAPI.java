package br.com.sigrest.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class sigrestAPI {

    public static void main(String[] args) {
        SpringApplication.run(sigrestAPI.class, args);
    }
}
