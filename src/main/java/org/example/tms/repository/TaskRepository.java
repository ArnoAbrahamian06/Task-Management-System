package org.example.tms.repository;

import org.example.tms.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.awt.print.Pageable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Optional<Task> findByTitle(String title);

    long countByAssignee_User(User user);

    Boolean existsByTitleAndProject(String title, Project project);

    @Query("SELECT COUNT(t) FROM Task t " +
            "JOIN t.project p " +
            "JOIN p.team team " +
            "JOIN TeamMember tm ON tm.team = team " +
            "WHERE t.status = :status AND tm.user = :user")
    long countAllMyTasksByStatus(@Param("user") User user, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(DISTINCT t) FROM Task t " +
            "WHERE t.project.team IN (" +
            "  SELECT tm.team FROM TeamMember tm WHERE tm.user = :user" +
            ") " +
            "AND t.deadline < :now " +
            "AND t.status != :excludeStatus " +
            "AND t.deadline IS NOT NULL")
    long countOverdueTasksInMyProjects(
            @Param("user") User user,
            @Param("now") LocalDateTime now,
            @Param("excludeStatus") TaskStatus excludeStatus
    );

    @Query("SELECT DISTINCT t FROM Task t " +
            "LEFT JOIN FETCH t.project p " +
            "LEFT JOIN FETCH t.assignee a " +
            "WHERE p.team IN (" +
            "  SELECT tm.team FROM TeamMember tm WHERE tm.user = :user" +
            ") " +
            "AND t.priority = :priority")
    List<Task> findAllTasksByPriorityInMyProjects(
            @Param("user") User user,
            @Param("priority") TaskPriority priority
    );

    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.project p " +
            "LEFT JOIN FETCH t.assignee a " +
            "LEFT JOIN FETCH t.subtasks s " +
            "WHERE t.id = :id")
    Optional<Task> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.project p " +
            "LEFT JOIN FETCH t.assignee a " +
            "WHERE p.team IN (" +
            "  SELECT tm.team FROM TeamMember tm WHERE tm.user = :user" +
            ") " +
            "ORDER BY CASE t.priority " +
            "  WHEN org.example.tms.entity.TaskPriority.URGENT THEN 1 " +
            "  WHEN org.example.tms.entity.TaskPriority.HIGH THEN 2 " +
            "  WHEN org.example.tms.entity.TaskPriority.MEDIUM THEN 3 " +
            "  WHEN org.example.tms.entity.TaskPriority.LOW THEN 4 " +
            "  ELSE 5 END ASC")
    List<Task> findTop5PriorityTasks(@Param("user") User user, Pageable pageable);

}
