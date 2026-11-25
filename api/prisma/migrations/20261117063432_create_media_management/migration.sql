-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(150) NOT NULL,
    "extension" VARCHAR(20) NOT NULL,
    "size" BIGINT NOT NULL,
    "storageDisk" VARCHAR(30) NOT NULL DEFAULT 'local',
    "storagePath" VARCHAR(500) NOT NULL,
    "altText" VARCHAR(255),
    "caption" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_media" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "role" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_uuid_key" ON "media"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "media_fileName_key" ON "media"("fileName");

-- CreateIndex
CREATE UNIQUE INDEX "media_storagePath_key" ON "media"("storagePath");

-- CreateIndex
CREATE INDEX "media_mimeType_idx" ON "media"("mimeType");

-- CreateIndex
CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");

-- CreateIndex
CREATE INDEX "page_media_pageId_sortOrder_idx" ON "page_media"("pageId", "sortOrder");

-- CreateIndex
CREATE INDEX "page_media_mediaId_idx" ON "page_media"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "page_media_pageId_mediaId_key" ON "page_media"("pageId", "mediaId");

-- AddForeignKey
ALTER TABLE "page_media" ADD CONSTRAINT "page_media_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_media" ADD CONSTRAINT "page_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
