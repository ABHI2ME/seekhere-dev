/*
  Warnings:

  - You are about to drop the column `likeCount` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Comment" DROP COLUMN "likeCount";

-- CreateTable
CREATE TABLE "public"."PostLikesCount" (
    "id" SERIAL NOT NULL,
    "postId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLikesCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentLikeCount" (
    "id" SERIAL NOT NULL,
    "commentId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentLikeCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostLikesCount_postId_idx" ON "public"."PostLikesCount"("postId");

-- CreateIndex
CREATE INDEX "CommentLikeCount_commentId_idx" ON "public"."CommentLikeCount"("commentId");

-- AddForeignKey
ALTER TABLE "public"."CommentLikeCount" ADD CONSTRAINT "CommentLikeCount_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
