package ec.fin.coacandes.socios;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SociosApplication {

    private static ConfigurableApplicationContext context;

	public static void main(String[] args) {
        context = SpringApplication.run(SociosApplication.class, args);
	}

    static void close() {
        if (context != null) {
            context.close();
            context = null;
        }
    }

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
