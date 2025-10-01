/*
  Warnings:

  - The values [ARCADE] on the enum `Mode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Mode_new" AS ENUM ('arcade');
ALTER TABLE "public"."Session" ALTER COLUMN "mode" TYPE "public"."Mode_new" USING ("mode"::text::"public"."Mode_new");
ALTER TYPE "public"."Mode" RENAME TO "Mode_old";
ALTER TYPE "public"."Mode_new" RENAME TO "Mode";
DROP TYPE "public"."Mode_old";
COMMIT;
