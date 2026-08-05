-- CreateTable
CREATE TABLE `ai_settings` (
    `id` CHAR(36) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `provider` VARCHAR(50) NOT NULL,
    `apiKey` TEXT NULL,
    `base_url` TEXT NULL,
    `model` VARCHAR(100) NULL,
    `host` VARCHAR(100) NULL,
    `api_key_encrypted` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `automation_scripts` (
    `id` CHAR(36) NOT NULL,
    `test_case_id` CHAR(36) NOT NULL,
    `generator_type` VARCHAR(20) NOT NULL,
    `provider` VARCHAR(50) NULL,
    `model` VARCHAR(100) NULL,
    `script` TEXT NOT NULL,
    `language` VARCHAR(50) NOT NULL DEFAULT 'TypeScript',
    `framework` VARCHAR(50) NOT NULL DEFAULT 'Playwright',
    `version` VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    `last_run_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `automation_scripts_test_case_id_idx`(`test_case_id`),
    INDEX `automation_scripts_generator_type_idx`(`generator_type`),
    UNIQUE INDEX `automation_scripts_test_case_id_key`(`test_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `automation_scripts` ADD CONSTRAINT `automation_scripts_test_case_id_fkey` FOREIGN KEY (`test_case_id`) REFERENCES `test_cases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
