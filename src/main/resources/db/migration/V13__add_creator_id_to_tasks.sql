ALTER TABLE tasks ADD COLUMN creator_id BIGINT;
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_creator FOREIGN KEY (creator_id) REFERENCES users (id);
