-- Agrega campos exclusivos para Proveedores requeridos para integración SAP
ALTER TABLE `InfoGeneral`
  ADD COLUMN `nrc`                      VARCHAR(191) NULL,
  ADD COLUMN `codigoActividadEconomica` VARCHAR(191) NULL,
  ADD COLUMN `categoriaContribuyente`   VARCHAR(191) NULL,
  ADD COLUMN `nombreContacto`           VARCHAR(191) NULL,
  ADD COLUMN `correoVendedor`           VARCHAR(191) NULL,
  ADD COLUMN `correoComprobantes`       VARCHAR(191) NULL,
  ADD COLUMN `numeroCuentaBancaria`     VARCHAR(191) NULL,
  ADD COLUMN `titularCuenta`            VARCHAR(191) NULL,
  ADD COLUMN `tipoCuenta`               VARCHAR(191) NULL,
  ADD COLUMN `banco`                    VARCHAR(191) NULL;
