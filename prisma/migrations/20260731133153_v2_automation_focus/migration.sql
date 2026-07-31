/*
  Warnings:

  - You are about to drop the column `end_date` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `precondition` on the `test_cases` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `test_cases` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `job_title` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `project_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `project_members` DROP FOREIGN KEY `project_members_project_id_fkey`;

-- DropForeignKey
ALTER TABLE `project_members` DROP FOREIGN KEY `project_members_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_role_id_fkey`;

-- DropIndex
DROP INDEX `projects_start_date_idx` ON `projects`;

-- DropIndex
DROP INDEX `test_cases_status_idx` ON `test_cases`;

-- DropIndex
DROP INDEX `users_role_id_idx` ON `users`;

-- AlterTable
ALTER TABLE `projects` DROP COLUMN `end_date`,
    DROP COLUMN `start_date`,
    ADD COLUMN `base_url` VARCHAR(500) NULL,
    ADD COLUMN `environment` VARCHAR(100) NULL,
    ADD COLUMN `framework` ENUM('PLAYWRIGHT', 'SELENIUM', 'CYPRESS') NOT NULL DEFAULT 'PLAYWRIGHT';

-- AlterTable
ALTER TABLE `test_cases` DROP COLUMN `precondition`,
    DROP COLUMN `status`,
    ADD COLUMN `module` VARCHAR(255) NULL,
    ADD COLUMN `tags` JSON NULL,
    ADD COLUMN `testType` ENUM('MANUAL', 'AUTOMATION') NOT NULL DEFAULT 'AUTOMATION';

-- AlterTable
ALTER TABLE `test_steps` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `input_value` TEXT NULL,
    ADD COLUMN `locator_strategy` VARCHAR(50) NULL,
    ADD COLUMN `locator_value` TEXT NULL,
    ADD COLUMN `target` TEXT NULL,
    MODIFY `action` VARCHAR(100) NOT NULL,
    MODIFY `expected_result` TEXT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `bio`,
    DROP COLUMN `job_title`,
    DROP COLUMN `phone_number`,
    DROP COLUMN `role_id`,
    ADD COLUMN `must_change_password` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `token_version` INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `project_members`;

-- DropTable
DROP TABLE `roles`;

-- CreateTable
CREATE TABLE `automation_configs` (
    `id` CHAR(36) NOT NULL,
    `project_id` CHAR(36) NOT NULL,
    `framework` ENUM('PLAYWRIGHT', 'SELENIUM', 'CYPRESS') NOT NULL DEFAULT 'PLAYWRIGHT',
    `browser` ENUM('CHROMIUM', 'FIREFOX', 'WEBKIT') NOT NULL DEFAULT 'CHROMIUM',
    `base_url` VARCHAR(500) NULL,
    `headless` BOOLEAN NOT NULL DEFAULT true,
    `viewport_width` INTEGER NOT NULL DEFAULT 1280,
    `viewport_height` INTEGER NOT NULL DEFAULT 720,
    `timeout` INTEGER NOT NULL DEFAULT 30000,
    `retry` INTEGER NOT NULL DEFAULT 0,
    `parallel` INTEGER NOT NULL DEFAULT 1,
    `slow_motion` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `automation_configs_project_id_key`(`project_id`),
    INDEX `automation_configs_project_id_idx`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `executions` (
    `id` CHAR(36) NOT NULL,
    `number` VARCHAR(50) NOT NULL,
    `project_id` CHAR(36) NOT NULL,
    `test_case_id` CHAR(36) NOT NULL,
    `status` ENUM('RUNNING', 'PASSED', 'FAILED', 'SKIPPED', 'ERROR') NOT NULL DEFAULT 'RUNNING',
    `duration_ms` INTEGER NULL,
    `started_at` DATETIME(3) NULL,
    `finished_at` DATETIME(3) NULL,
    `browser` VARCHAR(50) NULL,
    `environment` VARCHAR(100) NULL,
    `screenshot_path` VARCHAR(500) NULL,
    `video_path` VARCHAR(500) NULL,
    `trace_path` VARCHAR(500) NULL,
    `consoleLog` JSON NULL,
    `generated_script` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `executions_number_key`(`number`),
    INDEX `executions_project_id_idx`(`project_id`),
    INDEX `executions_test_case_id_idx`(`test_case_id`),
    INDEX `executions_status_idx`(`status`),
    INDEX `executions_created_at_idx`(`created_at`),
    INDEX `executions_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `execution_logs` (
    `id` CHAR(36) NOT NULL,
    `execution_id` CHAR(36) NOT NULL,
    `step_number` INTEGER NULL,
    `action` VARCHAR(100) NULL,
    `level` VARCHAR(20) NOT NULL DEFAULT 'INFO',
    `message` TEXT NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `execution_logs_execution_id_idx`(`execution_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attachments` (
    `id` CHAR(36) NOT NULL,
    `test_case_id` CHAR(36) NOT NULL,
    `uploaded_by_id` CHAR(36) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(500) NOT NULL,
    `file_type` VARCHAR(100) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `attachments_test_case_id_idx`(`test_case_id`),
    INDEX `attachments_uploaded_by_id_idx`(`uploaded_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `key` VARCHAR(100) NOT NULL,
    `value` JSON NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `automation_configs` ADD CONSTRAINT `automation_configs_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `executions` ADD CONSTRAINT `executions_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `executions` ADD CONSTRAINT `executions_test_case_id_fkey` FOREIGN KEY (`test_case_id`) REFERENCES `test_cases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `execution_logs` ADD CONSTRAINT `execution_logs_execution_id_fkey` FOREIGN KEY (`execution_id`) REFERENCES `executions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_test_case_id_fkey` FOREIGN KEY (`test_case_id`) REFERENCES `test_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_uploaded_by_id_fkey` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
