package org.example.tms.repository;

import org.example.tms.entity.Project;
import org.example.tms.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Optional<Task> findByName(String name);

    Boolean existsByTitleAndProject(String title, Project project);
}
