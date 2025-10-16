-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "business";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "campaign";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "common";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "events";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "reporting";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "user";

-- CreateEnum
CREATE TYPE "common"."BusinessStatus" AS ENUM ('PENDING', 'CONNECTED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "common"."SocialPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'WHATSAPP', 'GOOGLE', 'YELP', 'OTHER');

-- CreateEnum
CREATE TYPE "common"."ReviewSentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "common"."EventStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "common"."EventSource" AS ENUM ('SYSTEM', 'MANUAL', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "common"."CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "common"."CampaignObjective" AS ENUM ('AWARENESS', 'TRAFFIC', 'LEADS', 'SALES');

-- CreateTable
CREATE TABLE "business"."Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metaBusinessId" TEXT,
    "configurationId" TEXT,
    "redirectUri" TEXT,
    "status" "common"."BusinessStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business"."BusinessMetaDetail" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "legalName" TEXT,
    "primaryPageId" TEXT,
    "timezone" TEXT,
    "currency" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "phoneNumber" TEXT,
    "supportEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessMetaDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business"."BusinessCompetitor" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facebookPageId" TEXT,
    "instagramHandle" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "addedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessCompetitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business"."BusinessCredential" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "systemUserToken" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL DEFAULT 'SYSTEM_USER',
    "expiresAt" TIMESTAMP(3),
    "grantedScopes" TEXT[],
    "connectedAssets" JSONB,
    "metaBusinessId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business"."BusinessSocialReview" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "platform" "common"."SocialPlatform" NOT NULL,
    "reviewId" TEXT,
    "reviewerName" TEXT,
    "rating" INTEGER,
    "comment" TEXT,
    "permalink" TEXT,
    "postedAt" TIMESTAMP(3),
    "sentiment" "common"."ReviewSentiment",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSocialReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign"."Campaign" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "common"."SocialPlatform" NOT NULL,
    "objective" "common"."CampaignObjective" NOT NULL,
    "status" "common"."CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "budgetCents" INTEGER,
    "currency" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events"."Event" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "common"."EventStatus" NOT NULL DEFAULT 'PLANNED',
    "source" "common"."EventSource" NOT NULL DEFAULT 'MANUAL',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdById" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reporting"."DailyBusinessMetric" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "platform" "common"."SocialPlatform",
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "spendCents" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenueCents" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "DailyBusinessMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "hashedPassword" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripeCustomerId" TEXT,
    "tokens" INTEGER,
    "paypalTransactionId" TEXT,
    "isDisclaimerAccpeted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "stripeCurrentPeriodEnd" TIMESTAMP(3),
    "aiLiveMinutesLeft" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiMockMinutesLeft" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiLiveMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiMockMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."FeatureFlag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"."UserFeatureFlag" (
    "userId" TEXT NOT NULL,
    "featureFlagId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserFeatureFlag_pkey" PRIMARY KEY ("userId","featureFlagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_metaBusinessId_key" ON "business"."Business"("metaBusinessId");

-- CreateIndex
CREATE UNIQUE INDEX "Business_configurationId_key" ON "business"."Business"("configurationId");

-- CreateIndex
CREATE INDEX "Business_status_idx" ON "business"."Business"("status");

-- CreateIndex
CREATE INDEX "Business_name_idx" ON "business"."Business"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMetaDetail_businessId_key" ON "business"."BusinessMetaDetail"("businessId");

-- CreateIndex
CREATE INDEX "BusinessCompetitor_businessId_idx" ON "business"."BusinessCompetitor"("businessId");

-- CreateIndex
CREATE INDEX "BusinessCompetitor_name_idx" ON "business"."BusinessCompetitor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessCredential_businessId_key" ON "business"."BusinessCredential"("businessId");

-- CreateIndex
CREATE INDEX "BusinessSocialReview_businessId_idx" ON "business"."BusinessSocialReview"("businessId");

-- CreateIndex
CREATE INDEX "BusinessSocialReview_platform_idx" ON "business"."BusinessSocialReview"("platform");

-- CreateIndex
CREATE INDEX "BusinessSocialReview_sentiment_idx" ON "business"."BusinessSocialReview"("sentiment");

-- CreateIndex
CREATE INDEX "BusinessSocialReview_postedAt_idx" ON "business"."BusinessSocialReview"("postedAt");

-- CreateIndex
CREATE INDEX "Campaign_businessId_idx" ON "campaign"."Campaign"("businessId");

-- CreateIndex
CREATE INDEX "Campaign_platform_status_idx" ON "campaign"."Campaign"("platform", "status");

-- CreateIndex
CREATE INDEX "Campaign_startAt_idx" ON "campaign"."Campaign"("startAt");

-- CreateIndex
CREATE INDEX "Event_businessId_startAt_idx" ON "events"."Event"("businessId", "startAt");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "events"."Event"("status");

-- CreateIndex
CREATE INDEX "DailyBusinessMetric_date_idx" ON "reporting"."DailyBusinessMetric"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyBusinessMetric_businessId_date_platform_key" ON "reporting"."DailyBusinessMetric"("businessId", "date", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "user"."User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "user"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_key" ON "user"."UserSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_name_key" ON "user"."FeatureFlag"("name");

-- CreateIndex
CREATE INDEX "UserFeatureFlag_featureFlagId_idx" ON "user"."UserFeatureFlag"("featureFlagId");

-- AddForeignKey
ALTER TABLE "business"."BusinessMetaDetail" ADD CONSTRAINT "BusinessMetaDetail_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business"."BusinessCompetitor" ADD CONSTRAINT "BusinessCompetitor_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business"."BusinessCredential" ADD CONSTRAINT "BusinessCredential_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business"."BusinessSocialReview" ADD CONSTRAINT "BusinessSocialReview_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign"."Campaign" ADD CONSTRAINT "Campaign_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."Event" ADD CONSTRAINT "Event_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporting"."DailyBusinessMetric" ADD CONSTRAINT "DailyBusinessMetric_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserFeatureFlag" ADD CONSTRAINT "UserFeatureFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"."UserFeatureFlag" ADD CONSTRAINT "UserFeatureFlag_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "user"."FeatureFlag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
