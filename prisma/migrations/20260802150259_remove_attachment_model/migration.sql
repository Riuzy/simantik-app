/*
  Warnings:

  - You are about to drop the `attachments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `attachments` DROP FOREIGN KEY `attachments_test_case_id_fkey`;

-- DropForeignKey
ALTER TABLE `attachments` DROP FOREIGN KEY `attachments_uploaded_by_id_fkey`;

-- AlterTable
ALTER TABLE `executions` MODIFY `status` ENUM('QUEUED', 'RUNNING', 'PASSED', 'FAILED', 'ERROR', 'CANCELLED', 'SKIPPED') NOT NULL DEFAULT 'RUNNING';

-- DropTable
DROP TABLE `attachments`;
