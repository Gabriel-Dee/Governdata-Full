package com.governdata.governdata;

import com.governdata.governdata.config.DotEnvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GoverndataApplication {

	public static void main(String[] args) {
		DotEnvLoader.loadIfPresent();
		SpringApplication.run(GoverndataApplication.class, args);
	}

}
