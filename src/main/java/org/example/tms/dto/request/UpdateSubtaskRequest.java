package org.example.tms.dto.request;

import lombok.Data;

@Data
public class UpdateSubtaskRequest {
    private String title;
    private Boolean completed;
}