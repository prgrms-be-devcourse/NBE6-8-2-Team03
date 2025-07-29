package com.tododuk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication

@EnableJpaAuditing
public class TododokApplication {

    public static void main(String[] args) {
        SpringApplication.run(TododokApplication.class, args);
    }

}
