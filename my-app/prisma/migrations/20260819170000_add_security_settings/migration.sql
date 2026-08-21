-- CreateTable
CREATE TABLE "SecuritySettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "minLength" INTEGER NOT NULL DEFAULT 8,
    "requireUppercase" BOOLEAN NOT NULL DEFAULT true,
    "requireNumber" BOOLEAN NOT NULL DEFAULT true,
    "requireSpecialChar" BOOLEAN NOT NULL DEFAULT false,
    "enforce2FA" BOOLEAN NOT NULL DEFAULT true,
    "twoFAMethod" TEXT NOT NULL DEFAULT 'Authenticator App',
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 30,
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "autoBlockMinutes" INTEGER NOT NULL DEFAULT 15,
    "auditRetentionPeriod" TEXT NOT NULL DEFAULT '180 days',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecuritySettings_pkey" PRIMARY KEY ("id")
);