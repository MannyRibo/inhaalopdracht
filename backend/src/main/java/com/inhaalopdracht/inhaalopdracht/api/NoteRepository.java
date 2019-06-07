package com.inhaalopdracht.inhaalopdracht.api;

import com.inhaalopdracht.inhaalopdracht.model.Note;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;

public interface NoteRepository extends CrudRepository<Note, Long> {
    @RestResource(path = "name", rel="name")
    @Query("from Note h where lower(h.name) like CONCAT('%', lower(:contains), '%')")
    public Iterable<Note> findByName(@Param("contains") String name);
}