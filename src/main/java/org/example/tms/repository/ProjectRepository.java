package org.example.tms.repository;

import org.example.tms.entity.Project;
import org.example.tms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByName(String name);

    Boolean existsByOwnerAndName(User owner, String name);
}
