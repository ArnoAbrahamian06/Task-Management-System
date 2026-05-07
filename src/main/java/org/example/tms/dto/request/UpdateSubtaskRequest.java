package org.example.tms.dto.request;

import lombok.Data;
import org.example.tms.entity.TaskStatus;

@Data
public class UpdateSubtaskRequest {
    private String title;
    private TaskStatus status;
}