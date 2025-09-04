/*
  Warnings:

  - Added the required column `liked` to the `CommentLike` table without a default value. This is not possible if the table is not empty.
  - Added the required column `liked` to the `PostLikes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CommentLike" ADD COLUMN     "liked" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "public"."PostLikes" ADD COLUMN     "liked" BOOLEAN NOT NULL;
