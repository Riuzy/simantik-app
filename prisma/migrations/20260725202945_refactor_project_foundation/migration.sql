/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `projects` ADD COLUMN `code` VARCHAR(50) NOT NULL,
    ADD COLUMN `end_date` DATETIME(3) NULL,
    ADD COLUMN `start_date` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('PLANNING', 'ACTIVE', 'TESTING', 'COMPLETED', 'ARCHIVED') NOT NULL DEFAULT 'PLANNING';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `avatar` VARCHAR(500) NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `job_title` VARCHAR(100) NULL,
    ADD COLUMN `last_login_at` DATETIME(3) NULL,
    ADD COLUMN `phone_number` VARCHAR(20) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `projects_code_key` ON `projects`(`code`);

-- CreateIndex
CREATE INDEX `projects_code_idx` ON `projects`(`code`);

-- CreateIndex
CREATE INDEX `projects_status_idx` ON `projects`(`status`);

-- CreateIndex
CREATE INDEX `projects_start_date_idx` ON `projects`(`start_date`);
