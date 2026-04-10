-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContainerOwnership" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "containerId" TEXT NOT NULL,

    CONSTRAINT "ContainerOwnership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ContainerOwnership_userId_containerId_key" ON "ContainerOwnership"("userId", "containerId");

-- AddForeignKey
ALTER TABLE "ContainerOwnership" ADD CONSTRAINT "ContainerOwnership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
