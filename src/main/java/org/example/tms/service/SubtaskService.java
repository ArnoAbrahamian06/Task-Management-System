package org.example.tms.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.SubtaskRequest;
import org.example.tms.dto.request.UpdateSubtaskRequest;
import org.example.tms.dto.response.SubtaskResponse;
import org.example.tms.entity.Subtask;
import org.example.tms.entity.Task;
import org.example.tms.entity.User;
import org.example.tms.mapper.SubtaskMapper;
import org.example.tms.repository.SubtaskRepository;
import org.example.tms.repository.TaskRepository;
import org.example.tms.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubtaskService {

    private final SubtaskRepository subtaskRepository;
    private final TaskRepository taskRepository;
    private final SubtaskMapper subtaskMapper;
    private final UserRepository userRepository;


    @Transactional
    public SubtaskResponse createSubtask(Long taskId, SubtaskRequest dto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Задача не найдена"));

        Subtask subtask = subtaskMapper.toEntity(dto);
        subtask.setTask(task); // Устанавливаем связь с родителем

        return subtaskMapper.toResponse(subtaskRepository.save(subtask));
    }

    @Transactional
    public SubtaskResponse toggleStatus(Long id) {
        Subtask subtask = subtaskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Подзадача не найдена"));

        subtask.setDone(!subtask.isDone()); // Меняем true на false и наоборот
        return subtaskMapper.toResponse(subtask); // Hibernate сам сохранит изменения в конце транзакции
    }

    @Transactional
    public void deleteSubtask(Long subtaskId) {
        // 1. Находим подзадачу и связанную с ней основную задачу
        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new EntityNotFoundException("Subtask not found with id: " + subtaskId));

        // Предполагаем, что в сущности Subtask есть связь с основной задачей Task
        Task parentTask = subtask.getTask();
        User currentUser = getCurrentUser();


        // 3. Удаление
        subtaskRepository.delete(subtask);
    }

    @Transactional
    public void updateSubtask(Long subtaskId, UpdateSubtaskRequest dto) {
        // 1. Ищем подзадачу
        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new EntityNotFoundException("Subtask not found"));

        // 2. Проверяем права через родительскую задачу
        Task parentTask = subtask.getTask();
        User currentUser = getCurrentUser();
        

        // 3. Обновляем поля
        subtaskMapper.updateSubtaskFromDto(dto, subtask);

        // 4. (Опционально) Логика: если все подзадачи DONE, можно слать уведомление 
        // или предлагать закрыть основную задачу.

        subtaskRepository.save(subtask);
    }
    
    private User getCurrentUser() {
        return userRepository.findByEmail(
                SecurityContextHolder.getContext().getAuthentication().getName()
        ).orElseThrow(() -> new EntityNotFoundException("Current user not found"));
    }
}
