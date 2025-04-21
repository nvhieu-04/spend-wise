-- CreateTable
CREATE TABLE `User` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `passwordHash` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `emailVerified` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` VARCHAR(191) NULL,
    `access_token` VARCHAR(191) NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` VARCHAR(191) NULL,
    `session_state` VARCHAR(191) NULL,

    INDEX `Account_userId_fkey`(`userId`),
    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` CHAR(36) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    INDEX `Session_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BankCard` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `cardName` VARCHAR(191) NOT NULL,
    `cardNumberLast4` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `cardType` VARCHAR(191) NOT NULL,
    `creditLimit` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BankCard_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` CHAR(36) NOT NULL,
    `cardId` CHAR(36) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `transactionDate` DATETIME(3) NOT NULL,
    `merchantName` VARCHAR(191) NULL,
    `categoryId` CHAR(36) NULL,
    `cashbackEarned` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isExpense` BOOLEAN NOT NULL DEFAULT true,

    INDEX `Transaction_cardId_fkey`(`cardId`),
    INDEX `Transaction_categoryId_fkey`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CashbackPolicy` (
    `id` CHAR(36) NOT NULL,
    `cardId` CHAR(36) NOT NULL,
    `categoryId` CHAR(36) NOT NULL,
    `cashbackPercentage` DOUBLE NOT NULL,
    `maxCashback` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CashbackPolicy_cardId_fkey`(`cardId`),
    INDEX `CashbackPolicy_categoryId_fkey`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankCard` ADD CONSTRAINT `BankCard_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `BankCard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CashbackPolicy` ADD CONSTRAINT `CashbackPolicy_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `BankCard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CashbackPolicy` ADD CONSTRAINT `CashbackPolicy_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
