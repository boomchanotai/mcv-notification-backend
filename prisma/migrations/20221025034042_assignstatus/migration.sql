/*
  Warnings:

  - The primary key for the `UserAssignmentStatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserAssignmentStatus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserAssignmentStatus" DROP CONSTRAINT "UserAssignmentStatus_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "UserAssignmentStatus_pkey" PRIMARY KEY ("userId", "assignmentId");
