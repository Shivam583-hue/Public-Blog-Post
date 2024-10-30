-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLogin" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "resetPasswordExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" VARCHAR(255),
ADD COLUMN     "verificationToken" VARCHAR(255),
ADD COLUMN     "verificationTokenExpiresAt" TIMESTAMP(3);
