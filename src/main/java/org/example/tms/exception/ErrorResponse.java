package org.example.tms.exception;


import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private int status;         // HTTP код (404, 403 и т.д.)
    private String message;     // Описание ошибки
    private LocalDateTime timestamp;
}
