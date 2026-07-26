-- CreateTable
CREATE TABLE `test_cases` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `precondition` TEXT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('DRAFT', 'READY', 'OBSOLETE') NOT NULL DEFAULT 'DRAFT',
    `project_id` CHAR(36) NOT NULL,
    `created_by_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `test_cases_code_key`(`code`),
    INDEX `test_cases_project_id_idx`(`project_id`),
    INDEX `test_cases_created_by_id_idx`(`created_by_id`),
    INDEX `test_cases_status_idx`(`status`),
    INDEX `test_cases_priority_idx`(`priority`),
    INDEX `test_cases_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_steps` (
    `id` CHAR(36) NOT NULL,
    `test_case_id` CHAR(36) NOT NULL,
    `step_number` INTEGER NOT NULL,
    `action` TEXT NOT NULL,
    `expected_result` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `test_steps_test_case_id_idx`(`test_case_id`),
    INDEX `test_steps_deleted_at_idx`(`deleted_at`),
    UNIQUE INDEX `test_steps_test_case_id_step_number_key`(`test_case_id`, `step_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `test_cases` ADD CONSTRAINT `test_cases_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_cases` ADD CONSTRAINT `test_cases_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_steps` ADD CONSTRAINT `test_steps_test_case_id_fkey` FOREIGN KEY (`test_case_id`) REFERENCES `test_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
