-- AlterTable
ALTER TABLE `automation_configs` ADD COLUMN `debug_mode` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `auth_email` VARCHAR(255) NULL,
    ADD COLUMN `auth_password` VARCHAR(500) NULL,
    ADD COLUMN `debug_mode` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `login_url` VARCHAR(500) NULL;
