/*
  Warnings:

  - A unique constraint covering the columns `[name,cardId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cardId` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Category_name_key` ON `Category`;

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `cardId` CHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX `Category_cardId_fkey` ON `Category`(`cardId`);

-- CreateIndex
CREATE UNIQUE INDEX `Category_name_cardId_key` ON `Category`(`name`, `cardId`);

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `BankCard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
