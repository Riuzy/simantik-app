/*
  Warnings:

  - You are about to drop the column `auth_email` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `auth_password` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the `automation_configs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `automation_configs` DROP FOREIGN KEY `automation_configs_project_id_fkey`;

-- AlterTable
ALTER TABLE `projects` DROP COLUMN `auth_email`,
    DROP COLUMN `auth_password`,
    ADD COLUMN `authentication_enabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `browser` ENUM('CHROMIUM', 'FIREFOX', 'WEBKIT') NOT NULL DEFAULT 'CHROMIUM',
    ADD COLUMN `headless` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `login_email` VARCHAR(255) NULL,
    ADD COLUMN `login_method` ENUM('BROWSER', 'API') NOT NULL DEFAULT 'BROWSER',
    ADD COLUMN `login_password` VARCHAR(500) NULL,
    ADD COLUMN `session_strategy` ENUM('REUSE_CONTEXT', 'NEW_SESSION') NOT NULL DEFAULT 'REUSE_CONTEXT',
    ADD COLUMN `slow_mo` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `timeout` INTEGER NOT NULL DEFAULT 30000,
    ADD COLUMN `viewport_height` INTEGER NOT NULL DEFAULT 720,
    ADD COLUMN `viewport_width` INTEGER NOT NULL DEFAULT 1280;

-- DropTable
DROP TABLE `automation_configs`;
