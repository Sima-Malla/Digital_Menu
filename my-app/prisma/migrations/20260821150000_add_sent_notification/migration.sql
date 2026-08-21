CREATE TABLE "SentNotification" (
    "id" BIGSERIAL NOT NULL,
    "templateKey" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Sent',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SentNotification_templateKey_idx"
    ON "SentNotification"("templateKey");

CREATE INDEX "SentNotification_createdAt_idx"
    ON "SentNotification"("createdAt");