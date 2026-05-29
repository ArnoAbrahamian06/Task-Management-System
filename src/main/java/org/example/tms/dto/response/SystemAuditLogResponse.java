package org.example.tms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SystemAuditLogResponse {
    private String id;
    private String timestamp;
    private String severity;
    private String component;
    private String message;
    private String operator;
}
