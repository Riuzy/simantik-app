-- AlterEnum
-- Remove PLANNING, TESTING, ARCHIVED from ProjectStatus; set default to ACTIVE
ALTER TABLE `projects` 
  MODIFY COLUMN `status` ENUM('ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE';
