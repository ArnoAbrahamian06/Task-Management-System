package org.example.tms.repository;

import org.example.tms.entity.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, Long> {

    // Получить все пункты подзадач для конкретной задачи
    List<Subtask> findAllByTaskId(Long taskId);

    // Удалить все подзадачи одной задачи
    void deleteAllByTaskId(Long taskId);
}