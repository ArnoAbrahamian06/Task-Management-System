package org.example.tms.entity;

import lombok.Getter;

import java.util.Set;

@Getter
public enum Role {

    USER(Set.of(
            Permission.PROJECT_CREATE,
            Permission.TASK_UPDATE
    )),

    ADMIN(Set.of(
            Permission.USER_CREATE,
            Permission.USER_UPDATE,
            Permission.USER_DELETE,
            Permission.PROJECT_CREATE,
            Permission.PROJECT_UPDATE,
            Permission.PROJECT_DELETE,
            Permission.TASK_ASSIGN,
            Permission.TASK_UPDATE,
            Permission.TASK_DELETE
    ));

    private final Set<Permission> permissions;

    Role(Set<Permission> permissions) {
        this.permissions = permissions;
    }
}
