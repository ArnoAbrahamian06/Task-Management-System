CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       role user_role NOT NULL,
                       created_at TIMESTAMP NOT NULL DEFAULT now(),
                       updated_at TIMESTAMP
);


CREATE TABLE projects (
                          id BIGSERIAL PRIMARY KEY,
                          name VARCHAR(150) NOT NULL,
                          description TEXT,
                          owner_id BIGINT NOT NULL,
                          created_at TIMESTAMP NOT NULL DEFAULT now(),
                          updated_at TIMESTAMP,

                          CONSTRAINT fk_projects_owner
                              FOREIGN KEY (owner_id)
                                  REFERENCES users(id)
);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);


CREATE TABLE project_users (
                               project_id BIGINT NOT NULL,
                               user_id BIGINT NOT NULL,

                               PRIMARY KEY (project_id, user_id),

                               CONSTRAINT fk_project_users_project
                                   FOREIGN KEY (project_id)
                                       REFERENCES projects(id)
                                       ON DELETE CASCADE,

                               CONSTRAINT fk_project_users_user
                                   FOREIGN KEY (user_id)
                                       REFERENCES users(id)
                                       ON DELETE CASCADE
);


CREATE TABLE tasks (
                       id BIGSERIAL PRIMARY KEY,
                       title VARCHAR(150) NOT NULL,
                       description TEXT,
                       status task_status NOT NULL,
                       priority task_priority NOT NULL,
                       deadline TIMESTAMP,
                       project_id BIGINT NOT NULL,
                       assignee_id BIGINT,
                       version BIGINT NOT NULL DEFAULT 0,
                       created_at TIMESTAMP NOT NULL DEFAULT now(),
                       updated_at TIMESTAMP,

                       CONSTRAINT fk_tasks_project
                           FOREIGN KEY (project_id)
                               REFERENCES projects(id),

                       CONSTRAINT fk_tasks_assignee
                           FOREIGN KEY (assignee_id)
                               REFERENCES users(id)
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
