package org.example.tms.repository;

import org.example.tms.entity.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    Optional<Task> findByTitle(String title);

    // 1. Быстрый подсчет по ID и статусу
    // Используем assignee.id, чтобы не загружать сущность User целиком
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.status = :status")
    long countByAssigneeIdAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);

    // 2. Подсчет просроченных задач по ID
    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.assignee.id = :userId " +
            "AND t.deadline < :now " +
            "AND t.status != org.example.tms.entity.TaskStatus.DONE")
    long countOverdueTasksByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // 3. Топ-5 приоритетных задач по ID
    // Добавлен FETCH для оптимизации, чтобы не было N+1 при маппинге в DTO (проект и исполнитель)
    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.project p " +
            "LEFT JOIN FETCH t.assignee a " +
            "WHERE t.assignee.id = :userId " +
            "ORDER BY CASE t.priority " +
            "  WHEN org.example.tms.entity.TaskPriority.URGENT THEN 1 " +
            "  WHEN org.example.tms.entity.TaskPriority.HIGH THEN 2 " +
            "  WHEN org.example.tms.entity.TaskPriority.MEDIUM THEN 3 " +
            "  ELSE 4 END ASC, t.deadline ASC")
    List<Task> findTop5PriorityTasksByUserId(@Param("userId") Long userId, Pageable pageable);

    // 4. Поиск задач по приоритету (для метода getHighPriorityTasks, если решите передавать туда ID)
    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.project p " +
            "LEFT JOIN FETCH t.assignee a " +
            "WHERE t.assignee.id = :userId AND t.priority = :priority")
    List<Task> findAllByAssigneeIdAndPriority(@Param("userId") Long userId, @Param("priority") TaskPriority priority);

    // Существующие методы для проверки бизнес-логики
    Boolean existsByTitleAndProject(String title, Project project);

    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.project p " +
            "LEFT JOIN FETCH t.assignee a " +
            "LEFT JOIN FETCH t.subtasks s " +
            "WHERE t.id = :id")
    Optional<Task> findByIdWithDetails(@Param("id") Long id);

}