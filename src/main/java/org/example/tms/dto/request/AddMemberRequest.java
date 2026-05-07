package org.example.tms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddMemberRequest {
    @NotNull
    private Long userId;
    private String position;
}