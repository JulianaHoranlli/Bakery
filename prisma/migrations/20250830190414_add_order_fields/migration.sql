-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT,
    "product" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" REAL NOT NULL DEFAULT 0.0,
    "total" REAL NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "pickup" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Order" ("createdAt", "customer", "id", "isHighlighted", "product") SELECT "createdAt", "customer", "id", "isHighlighted", "product" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
