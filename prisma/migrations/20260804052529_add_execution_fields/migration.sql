-- AlterTable
ALTER TABLE `executions` ADD COLUMN `last_duration_ms` INTEGER NULL,
    ADD COLUMN `last_result` ENUM('QUEUED', 'RUNNING', 'PASSED', 'FAILED', 'ERROR', 'CANCELLED', 'SKIPPED') NULL,
    ADD COLUMN `last_run_at` DATETIME(3) NULL,
    ADD COLUMN `run_count` INTEGER NOT NULL DEFAULT 1;
