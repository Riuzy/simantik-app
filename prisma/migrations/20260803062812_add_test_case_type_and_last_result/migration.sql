-- AlterTable
ALTER TABLE `test_cases` ADD COLUMN `last_executed_at` DATETIME(3) NULL,
    ADD COLUMN `last_execution_status` ENUM('NOT_RUN', 'RUNNING', 'PASSED', 'FAILED') NOT NULL DEFAULT 'NOT_RUN',
    ADD COLUMN `type` ENUM('MANUAL', 'AUTOMATION') NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX `test_cases_type_idx` ON `test_cases`(`type`);

-- CreateIndex
CREATE INDEX `test_cases_last_execution_status_idx` ON `test_cases`(`last_execution_status`);
