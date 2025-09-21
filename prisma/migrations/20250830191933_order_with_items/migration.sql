/*
  Warnings:

  - You are about to drop the column `notes` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `product` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Order` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "product" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "total" REAL NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "pickup" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Order" ("address", "createdAt", "customer", "id", "isHighlighted", "phone", "pickup", "status") SELECT "address", "createdAt", "customer", "id", "isHighlighted", "phone", "pickup", "status" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
