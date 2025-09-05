/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `PostLikesCount` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."PostLikesCount" ALTER COLUMN "count" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "PostLikesCount_postId_key" ON "public"."PostLikesCount"("postId");
