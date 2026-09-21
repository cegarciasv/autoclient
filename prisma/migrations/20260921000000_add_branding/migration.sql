CREATE TABLE `Branding` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `colorPrimary` VARCHAR(7) NOT NULL DEFAULT '#1A7A30',
    `colorDark` VARCHAR(7) NOT NULL DEFAULT '#1B3C22',
    `colorAccent` VARCHAR(7) NOT NULL DEFAULT '#4ADE80',
    `logoMime` VARCHAR(20) NULL,
    `logoData` LONGBLOB NULL,
    `actualizado` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
