package org.example.tms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SystemMetricsResponse {
    private double cpuUsage;
    private double memoryUsage;
    private int activeDbConnections;
    private int maxDbConnections;
    private long uptime;
}
