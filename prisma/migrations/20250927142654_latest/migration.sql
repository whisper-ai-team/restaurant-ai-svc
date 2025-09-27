-- CreateEnum
CREATE TYPE "BusinessAccountStatus" AS ENUM ('PENDING', 'CONNECTED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'WHATSAPP', 'GOOGLE', 'YELP', 'OTHER');

-- CreateEnum
CREATE TYPE "ReviewSentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateTable
CREATE TABLE "BusinessAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metaBusinessId" TEXT,
    "configurationId" TEXT,
    "redirectUri" TEXT,
    "status" "BusinessAccountStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessMetaDetail" (
    "id" TEXT NOT NULL,
    "businessAccountId" TEXT NOT NULL,
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
CREATE TABLE "BusinessCompetitor" (
    "id" TEXT NOT NULL,
    "businessAccountId" TEXT NOT NULL,
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
CREATE TABLE "BusinessCredential" (
    "id" TEXT NOT NULL,
    "businessAccountId" TEXT NOT NULL,
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
CREATE TABLE "BusinessSocialReview" (
    "id" TEXT NOT NULL,
    "businessAccountId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "reviewId" TEXT,
    "reviewerName" TEXT,
    "rating" INTEGER,
    "comment" TEXT,
    "permalink" TEXT,
    "postedAt" TIMESTAMP(3),
    "sentiment" "ReviewSentiment",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSocialReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAccount_metaBusinessId_key" ON "BusinessAccount"("metaBusinessId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAccount_configurationId_key" ON "BusinessAccount"("configurationId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMetaDetail_businessAccountId_key" ON "BusinessMetaDetail"("businessAccountId");

-- CreateIndex
CREATE INDEX "BusinessCompetitor_businessAccountId_idx" ON "BusinessCompetitor"("businessAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessCredential_businessAccountId_key" ON "BusinessCredential"("businessAccountId");

-- CreateIndex
CREATE INDEX "BusinessSocialReview_businessAccountId_idx" ON "BusinessSocialReview"("businessAccountId");

-- CreateIndex
CREATE INDEX "BusinessSocialReview_platform_idx" ON "BusinessSocialReview"("platform");

-- AddForeignKey
ALTER TABLE "BusinessMetaDetail" ADD CONSTRAINT "BusinessMetaDetail_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "BusinessAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCompetitor" ADD CONSTRAINT "BusinessCompetitor_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "BusinessAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCredential" ADD CONSTRAINT "BusinessCredential_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "BusinessAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessSocialReview" ADD CONSTRAINT "BusinessSocialReview_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "BusinessAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
