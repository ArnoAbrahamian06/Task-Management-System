package org.example.tms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MemberDetailsDto {
    private Long userId;
    private String userName;
    private String position; // Должность конкретного человека
}