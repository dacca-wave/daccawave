/*
  Warnings:

  - Added the required column `nextResendAt` to the `VerificationToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resendDay` to the `VerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `verificationtoken` ADD COLUMN `nextResendAt` DATETIME(3) NOT NULL,
    ADD COLUMN `resendCount` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `resendDay` DATETIME(3) NOT NULL;
