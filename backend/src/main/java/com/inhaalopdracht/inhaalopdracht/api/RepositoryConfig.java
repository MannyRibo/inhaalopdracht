package com.inhaalopdracht.inhaalopdracht.api;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurerAdapter;

import com.inhaalopdracht.inhaalopdracht.model.Note;

@SpringBootConfiguration
public class RepositoryConfig extends RepositoryRestConfigurerAdapter {
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config) {
        config.exposeIdsFor(Note.class);
    }
}