# Plan: Sistema de 2 Roles + Autenticación Microsoft Entra ID

## Estado: APROBADO — PENDIENTE DE IMPLEMENTACIÓN

---

## Contexto
El sistema actualmente tiene login email/contraseña con un solo rol. Se va a migrar a:
1. Login EXCLUSIVAMENTE vía Microsoft 365 / Entra ID (eliminar email/contraseña)
2. Dos roles: ADMIN (acceso total) y EJECUTIVO (todo excepto gestión de usuarios)
3. Gestión de usuarios del sistema: Admin crea usuarios vinculados a su cuenta O365, se envía email de notificación al crearlos
4. Middleware de protección de rutas con control por rol

---

## Proyecto
- Ruta: C:\CLAUDE_CODE\AutoClien\autoclient
- Repo: https://github.com/cegarciasv/autoclient.git
- Rama: master
- Producción: https://internos-formulario-app.ktyero.easypanel.host

---

## Flujo de autenticación
1. Admin crea usuario en /admin/usuarios/nuevo (nombre, email O365, rol)
2. Sistema guarda AdminUser en BD y envía email de notificación
3. Usuario va a /admin/login → clic "Iniciar sesión con Microsoft"
4. Redirect a Microsoft Entra OAuth
5. Microsoft autentica → callback con code
6. Sistema busca AdminUser por email en BD
7. Si existe y activo → crea JWT → redirige /admin/dashboard
8. Si no existe → error "No tiene acceso autorizado"

---

## Cambios en Base de Datos (prisma/schema.prisma)

```prisma
enum Rol {
  ADMIN
  EJECUTIVO    // renombrado de OPERADOR
}

model AdminUser {
  id          String   @id @default(cuid())
  nombre      String
  email       String   @unique
  microsoftId String?  // Object ID de Entra para lookup rápido
  rol         Rol      @default(EJECUTIVO)
  activo      Boolean  @default(true)
  creadoEn    DateTime @default(now())
  // password eliminado — auth solo vía Microsoft
}
```

**Migración SQL:** renombrar enum OPERADOR→EJECUTIVO, eliminar columna `password`, agregar `microsoftId` nullable.

---

## Nuevas Variables de Entorno

```env
MICROSOFT_CLIENT_ID=<app-registration-client-id>
MICROSOFT_CLIENT_SECRET=<client-secret>
MICROSOFT_TENANT_ID=<tenant-id-de-gruporemor>
```

---

## Configuración Microsoft Entra (pendiente hacer en Azure Portal)

1. **App registrations → New registration**
   - Supported account types: `Accounts in this org only` (single tenant)
   - Redirect URI prod: `https://internos-formulario-app.ktyero.easypanel.host/api/auth/microsoft/callback`
   - Redirect URI dev: `http://localhost:3000/api/auth/microsoft/callback`

2. **API Permissions → Microsoft Graph → Delegated:**
   `openid`, `profile`, `email`, `User.Read` (no requieren admin consent)

3. **Certificates & secrets → New client secret** → copiar valor

4. **Overview** → copiar `Application (client) ID` y `Directory (tenant) ID`

---

## Archivos a Crear

- `middleware.ts` (raíz del proyecto) — JWT + control de roles
- `app/api/auth/microsoft/login/route.ts` — inicia OAuth con state anti-CSRF
- `app/api/auth/microsoft/callback/route.ts` — maneja retorno de Microsoft
- `app/api/admin/usuarios/route.ts` — GET listar, POST crear
- `app/api/admin/usuarios/[id]/route.ts` — GET, PATCH, DELETE
- `app/admin/usuarios/page.tsx` — tabla de usuarios del sistema
- `app/admin/usuarios/nuevo/page.tsx` — formulario crear usuario
- `app/admin/usuarios/[id]/page.tsx` — editar/desactivar usuario

---

## Archivos a Modificar

- `prisma/schema.prisma` — enum Rol + modelo AdminUser
- `lib/auth-admin.ts` — agregar campo nombre al JWT payload
- `app/admin/login/page.tsx` — solo botón Microsoft (eliminar formulario)
- `app/admin/layout.tsx` — link Usuarios condicional por rol ADMIN

---

## Permisos por Rol

| Sección | ADMIN | EJECUTIVO |
|---|---|---|
| Dashboard, Clientes, Proveedores | ✓ | ✓ |
| Ver y gestionar expedientes | ✓ | ✓ |
| Gestión de Usuarios del sistema | ✓ | ✗ (redirige al dashboard) |

---

## Orden de Implementación

1. Schema + migración Prisma
2. middleware.ts (JWT + roles)
3. OAuth routes (microsoft/login + microsoft/callback)
4. lib/auth-admin.ts (agregar nombre al JWT)
5. Login page (solo botón Microsoft)
6. Admin layout (link Usuarios condicional)
7. API CRUD usuarios + email notificación acceso
8. Páginas UI gestión usuarios

---

## Verificación

- `/admin/login` → solo botón Microsoft, sin formulario
- Login con cuenta O365 en BD → accede al dashboard
- Login con cuenta O365 NO en BD → error "Sin acceso autorizado"
- ADMIN crea Ejecutivo → llega email de notificación
- Ejecutivo entra con Microsoft → ve dashboard/clientes/proveedores pero NO Usuarios en sidebar
- Ejecutivo intenta navegar a `/admin/usuarios` → redirige al dashboard
- Sin cookie → cualquier ruta `/admin/*` redirige al login
