package org.example.tms.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tms.dto.request.SubtaskRequest;
import org.example.tms.dto.request.UpdateSubtaskRequest;
import org.example.tms.dto.response.SubtaskResponse;
import org.example.tms.service.SubtaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Subtask", description = "Управление подзадачами")
public class SubtaskController {

    private final SubtaskService subtaskService;

    // Добавление нового пункта в чеклист конкретной задачи
    @PreAuthorize("@securityService.canManageSubtasks(#taskId)")
    @PostMapping("/tasks/{taskId}/subtasks")
    public ResponseEntity<SubtaskResponse> create(@PathVariable Long taskId,
                                                  @Valid @RequestBody SubtaskRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subtaskService.createSubtask(taskId, dto));
    }

    // Переключение галочки (выполнено/не выполнено)
    @PreAuthorize("@securityService.canToggleSubtask(#id)")
    @PatchMapping("/subtasks/{id}/toggle")
    public ResponseEntity<SubtaskResponse> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(subtaskService.toggleStatus(id));
    }

    @PatchMapping("/subtasks/{id}")
    @PreAuthorize("@securityService.canEditSubtask(#id)")
    public ResponseEntity<SubtaskResponse> updateSubtask(
            @PathVariable Long id,
            @RequestBody UpdateSubtaskRequest dto) {
        return ResponseEntity.ok(subtaskService.updateSubtask(id, dto));
    }

    // Удаление подзадачи
    @PreAuthorize("@securityService.canDeleteSubtask(#id)")
    @DeleteMapping("/subtasks/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subtaskService.deleteSubtask(id);
        return ResponseEntity.noContent().build();
    }
}