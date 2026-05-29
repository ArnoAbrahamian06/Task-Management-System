package org.example.tms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_audit_logs")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(nullable = false)
    private String severity; // INFO, SUCCESS, WARNING, ERROR

    @Column(nullable = false)
    private String component; // e.g. AuthService, ProjectService, etc.

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String operator; // e.g. system, user email, etc.
}
