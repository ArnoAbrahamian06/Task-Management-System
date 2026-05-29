-- 1. Create system audit logs table
CREATE TABLE system_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    severity VARCHAR(20) NOT NULL,
    component VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    operator VARCHAR(255) NOT NULL
);

-- 2. Seed some initial audit entries
INSERT INTO system_audit_logs (timestamp, severity, component, message, operator) VALUES
(CURRENT_TIMESTAMP - INTERVAL '4 hours', 'SUCCESS', 'AuthService', 'User administrator@taskflow.com successfully authenticated via JWT', 'administrator@taskflow.com'),
(CURRENT_TIMESTAMP - INTERVAL '3 hours', 'INFO', 'TeamService', 'Global membership synchronization executed. 14 team relationships validated.', 'System'),
(CURRENT_TIMESTAMP - INTERVAL '2 hours', 'WARNING', 'SecurityService', 'Method security intercept on ProjectService.deleteProject - authorization bypassed by ADMIN privilege', 'administrator@taskflow.com'),
(CURRENT_TIMESTAMP - INTERVAL '1 hour', 'SUCCESS', 'ProjectService', 'New project ''Marketing Campaign 2026'' created successfully', 'admin@taskflow.com'),
(CURRENT_TIMESTAMP - INTERVAL '45 minutes', 'INFO', 'UserService', 'User role change request: User ID 3 updated from USER to ADMIN', 'administrator@taskflow.com'),
(CURRENT_TIMESTAMP - INTERVAL '15 minutes', 'SUCCESS', 'NotificationService', 'Global broadcast notification dispatched: ''Системное техническое обслуживание''', 'administrator@taskflow.com');
