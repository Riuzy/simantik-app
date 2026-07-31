/*
  Warnings:

  - You are about to drop the column `testType` on the `test_cases` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `executions` ADD COLUMN `error_message` TEXT NULL;

-- AlterTable
ALTER TABLE `test_cases` DROP COLUMN `testType`,
    ADD COLUMN `status` ENUM('DRAFT', 'READY', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX `test_cases_status_idx` ON `test_cases`(`status`);
