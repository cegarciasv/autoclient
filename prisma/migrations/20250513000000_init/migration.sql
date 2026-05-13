◇ injected env (10) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'OPERADOR') NOT NULL DEFAULT 'OPERADOR',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tercero` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` ENUM('CLIENTE', 'PROVEEDOR') NOT NULL,
    `razonSocial` VARCHAR(191) NOT NULL,
    `tipoDocumento` ENUM('NIT', 'DUI', 'PASAPORTE') NOT NULL,
    `numeroDocumento` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `tokenExpira` DATETIME(3) NOT NULL,
    `estado` ENUM('PENDIENTE', 'EN_PROCESO', 'COMPLETADO') NOT NULL DEFAULT 'PENDIENTE',
    `creadoPor` VARCHAR(191) NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Tercero_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OtpToken` (
    `id` VARCHAR(191) NOT NULL,
    `terceroId` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `expira` DATETIME(3) NOT NULL,
    `usado` BOOLEAN NOT NULL DEFAULT false,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OtpToken_terceroId_idx`(`terceroId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Formulario` (
    `id` VARCHAR(191) NOT NULL,
    `terceroId` VARCHAR(191) NOT NULL,
    `pasoActual` INTEGER NOT NULL DEFAULT 1,
    `progreso` INTEGER NOT NULL DEFAULT 0,
    `estado` ENUM('PENDIENTE', 'EN_PROCESO', 'COMPLETADO') NOT NULL DEFAULT 'EN_PROCESO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Formulario_terceroId_key`(`terceroId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InfoGeneral` (
    `id` VARCHAR(191) NOT NULL,
    `formularioId` VARCHAR(191) NOT NULL,
    `razonSocial` VARCHAR(191) NOT NULL,
    `nombreComercial` VARCHAR(191) NOT NULL,
    `nit` VARCHAR(191) NOT NULL,
    `iva` VARCHAR(191) NOT NULL,
    `actividadReal` VARCHAR(191) NOT NULL,
    `tipoEmpresa` VARCHAR(191) NOT NULL,
    `tipoActividadEconomica` VARCHAR(191) NOT NULL,
    `obligacionesTributarias` BOOLEAN NOT NULL DEFAULT false,
    `sistemaLAFT` BOOLEAN NOT NULL DEFAULT false,
    `productoServicio` VARCHAR(191) NOT NULL,
    `direccionPrincipal` VARCHAR(191) NOT NULL,
    `departamento` VARCHAR(191) NOT NULL,
    `ciudad` VARCHAR(191) NOT NULL,
    `correoElectronico` VARCHAR(191) NOT NULL,
    `telefonoFijo` VARCHAR(191) NULL,
    `telefonoCelular` VARCHAR(191) NULL,
    `rlPrimerApellido` VARCHAR(191) NOT NULL,
    `rlSegundoApellido` VARCHAR(191) NOT NULL,
    `rlNombres` VARCHAR(191) NOT NULL,
    `rlTipoIdentificacion` VARCHAR(191) NOT NULL,
    `rlNumeroDocumento` VARCHAR(191) NOT NULL,
    `rlFechaExpedicion` DATETIME(3) NOT NULL,
    `rlLugarExpedicion` VARCHAR(191) NOT NULL,
    `rlFechaVencimiento` DATETIME(3) NULL,
    `rlGenero` VARCHAR(191) NOT NULL,
    `rlEstadoCivil` VARCHAR(191) NOT NULL,
    `rlFechaNacimiento` DATETIME(3) NOT NULL,
    `rlLugarNacimiento` VARCHAR(191) NOT NULL,
    `pepRecursosPublicos` BOOLEAN NOT NULL DEFAULT false,
    `pepFamiliaresPublicos` BOOLEAN NOT NULL DEFAULT false,
    `pepCargosPublicos` BOOLEAN NOT NULL DEFAULT false,
    `pepSistemaLAFT` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `InfoGeneral_formularioId_key`(`formularioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientePrincipal` (
    `id` VARCHAR(191) NOT NULL,
    `formularioId` VARCHAR(191) NOT NULL,
    `nombreRazonSocial` VARCHAR(191) NOT NULL,
    `porcentajeParticipacion` VARCHAR(191) NOT NULL DEFAULT '0',

    INDEX `ClientePrincipal_formularioId_idx`(`formularioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Accionista` (
    `id` VARCHAR(191) NOT NULL,
    `formularioId` VARCHAR(191) NOT NULL,
    `tipoIdentificacion` VARCHAR(191) NOT NULL,
    `numeroDocumento` VARCHAR(191) NOT NULL,
    `nombreRazonSocial` VARCHAR(191) NOT NULL,
    `recursosPublicos` BOOLEAN NOT NULL DEFAULT false,
    `cargoPoder` BOOLEAN NOT NULL DEFAULT false,
    `reconocidoPublicamente` BOOLEAN NOT NULL DEFAULT false,
    `declaracionPais` VARCHAR(191) NOT NULL,
    `porcentajeParticipacion` DECIMAL(5, 2) NOT NULL,

    INDEX `Accionista_formularioId_idx`(`formularioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InfoFinanciera` (
    `id` VARCHAR(191) NOT NULL,
    `formularioId` VARCHAR(191) NOT NULL,
    `totalActivo` DECIMAL(15, 2) NOT NULL,
    `totalPasivo` DECIMAL(15, 2) NOT NULL,
    `totalPatrimonio` DECIMAL(15, 2) NOT NULL,
    `ingresosMensuales` DECIMAL(15, 2) NOT NULL,
    `egresosMensuales` DECIMAL(15, 2) NOT NULL,
    `fuenteOtrosIngresos` VARCHAR(191) NULL,
    `otrosIngresosMensuales` DECIMAL(15, 2) NULL,
    `operacionesInternacionales` BOOLEAN NOT NULL DEFAULT false,
    `detalleOperaciones` TEXT NULL,

    UNIQUE INDEX `InfoFinanciera_formularioId_key`(`formularioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReferenciaComercial` (
    `id` VARCHAR(191) NOT NULL,
    `formularioId` VARCHAR(191) NOT NULL,
    `nombreRazonSocial` VARCHAR(191) NOT NULL,
    `telefonoFijo` VARCHAR(191) NOT NULL,
    `telefonoCelular` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NOT NULL,

    INDEX `ReferenciaComercial_formularioId_idx`(`formularioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EncuestaProveedor` (
    `id` VARCHAR(191) NOT NULL,
    `formularioId` VARCHAR(191) NOT NULL,
    `trayectoriaExperiencia` VARCHAR(191) NOT NULL,
    `cantidadProyectos` VARCHAR(191) NOT NULL,
    `montosProyectos` VARCHAR(191) NOT NULL,
    `marketShareLocal` VARCHAR(191) NOT NULL,
    `certificacionesInternacionales` BOOLEAN NOT NULL,
    `detallesCertificaciones` VARCHAR(191) NULL,
    `polizasSeguros` BOOLEAN NOT NULL,
    `detallesPolizas` VARCHAR(191) NULL,
    `prestacionesLey` BOOLEAN NOT NULL,
    `programaSeguridadSalud` BOOLEAN NOT NULL,
    `creditoOtorga` VARCHAR(191) NOT NULL,
    `garantiasFianzas` BOOLEAN NOT NULL,
    `presenciaRegional` VARCHAR(191) NOT NULL,
    `marketShareRegional` VARCHAR(191) NOT NULL,
    `campanasReciclaje` BOOLEAN NOT NULL,
    `detallesReciclaje` VARCHAR(191) NULL,

    UNIQUE INDEX `EncuestaProveedor_formularioId_key`(`formularioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Documento` (
    `id` VARCHAR(191) NOT NULL,
    `formularioId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `nombreArchivo` VARCHAR(191) NOT NULL,
    `rutaNAS` VARCHAR(191) NOT NULL,
    `tamanoBytes` INTEGER NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Documento_formularioId_idx`(`formularioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OtpToken` ADD CONSTRAINT `OtpToken_terceroId_fkey` FOREIGN KEY (`terceroId`) REFERENCES `Tercero`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Formulario` ADD CONSTRAINT `Formulario_terceroId_fkey` FOREIGN KEY (`terceroId`) REFERENCES `Tercero`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InfoGeneral` ADD CONSTRAINT `InfoGeneral_formularioId_fkey` FOREIGN KEY (`formularioId`) REFERENCES `Formulario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientePrincipal` ADD CONSTRAINT `ClientePrincipal_formularioId_fkey` FOREIGN KEY (`formularioId`) REFERENCES `Formulario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accionista` ADD CONSTRAINT `Accionista_formularioId_fkey` FOREIGN KEY (`formularioId`) REFERENCES `Formulario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InfoFinanciera` ADD CONSTRAINT `InfoFinanciera_formularioId_fkey` FOREIGN KEY (`formularioId`) REFERENCES `Formulario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferenciaComercial` ADD CONSTRAINT `ReferenciaComercial_formularioId_fkey` FOREIGN KEY (`formularioId`) REFERENCES `Formulario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EncuestaProveedor` ADD CONSTRAINT `EncuestaProveedor_formularioId_fkey` FOREIGN KEY (`formularioId`) REFERENCES `Formulario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_formularioId_fkey` FOREIGN KEY (`formularioId`) REFERENCES `Formulario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

