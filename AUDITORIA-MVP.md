# Auditoría MVP — cnm-frontend → datos reales (2026-09-30) — ✅ EJECUTADA 2026-10-01

> Estado: completa. Informe de cierre con evidencia en
> `docs/entregables/informe-real-data-2026-10-01.md`. Gate: build ✓, tsc ✓ 0 errores,
> smoke 23/23 ✓, revisor APRUEBA (0 bloqueantes; 5 menores corregidos, 4 documentados).
> Cambios de backend y frontend SIN commit, para revisión del usuario.

Auditoría del frontend contra el backend real (`cnm-backend`, corriendo en `localhost:8080`,
PostgreSQL local en puerto 5432, BD `cnm`, Flyway `V1__create_schema.sql`). Incluye el plan
de corrección que se ejecuta a continuación de este documento.

## Contexto real verificado

| Pieza | Estado real |
|---|---|
| Backend | Vivo en `localhost:8080` (java -cp target/classes, `cnm-backend` branch `feature/repository-develop`). Lee `.env` con dotenv-java. |
| Base de datos | PostgreSQL en `localhost:5432`, BD `cnm`, usuario `postgres`, socket `/tmp`. **Vacía: 0 filas en las 8 tablas.** |
| Contratos backend | `PageResponseDto` = `{content, pageNumber, pageSize, totalElements, totalPages}` (⚠ el front usa `page/size`). Login = `{token, tipoToken, idUsuario, correo, nombreCompleto, rol, notificacionesHabilitadas}`. Rol = `cliente` \| `administrador`. |
| Seguridad | Públicos: `POST /auth/*`, `GET /viajes`, `GET /viajes/{id}`, `GET /viajes/{id}/campos-formulario`. El resto requiere JWT `Authorization: Bearer`. JWT expira en 1h, sin refresh. |

## A. Bloqueadores encontrados (backend, impiden el MVP tal cual)

1. **`GET /viajes` devuelve 500 con filtros vacíos** (reproducido con curl). La query JPQL
   `buscarConFiltros` usa `:param IS NULL`, que Hibernate 6 + PostgreSQL no sabe tipar
   ("could not determine data type of parameter"). El catálogo público **no funciona hoy**.
   → Fix: `JpaSpecificationExecutor` + Specification dinámica en `ViajeService`.
2. **`Viaje` no tiene imagen ni equipo.** El catálogo es visual (10 viajes con foto en
   `public/Presentaciones/viajes/*`) y el detalle muestra "Equipo requerido". Sin esos campos
   en BD, el frontend tendría que hardcodear el mapeo id→imagen (prohibido por requisitos).
   → Fix: migración `V2` agregando `viaje.imagen_url TEXT` y `viaje.equipo TEXT` + entity/DTOs/service.
3. **Login con credenciales inválidas responde 500** en vez de 401 (message `Credenciales inválidas`).
   No bloquea (el front puede leer el message), se registra como deuda del backend.
4. **Sin endpoint de upload de comprobante.** `POST /reservas` exige `capturaComprobanteUrl`
   `@NotBlank`, pero no hay forma de subir un archivo. → Decisión MVP: el front comprime la
   foto en el cliente (canvas → JPEG) y envía un **data-URI** en `capturaComprobanteUrl`; la
   bandeja admin lo renderiza directo. Deuda: endpoint de upload + storage.

## B. Mock/hardcode en el frontend (hallazgos con ubicación)

### B1. Servicios 100% mock (ninguno llama a la API)
- `src/services/viajes.service.ts` — catálogo desde `@/data/viajes` (mock), inventa
  `fechaHoraVuelta` (ids 5 y 9) e `INCLUSIONES_BASE`.
- `src/services/reserva.service.ts` — Map en memoria, ids incrementales (1044+), semilla
  "Carlos González", valida expiración con reloj del cliente.
- `src/services/user.service.ts` — perfil "Carlos González" fijo, notificaciones de 1 ítem fijo.
- `src/services/admin.service.ts` — estadísticas, usuarios, reservas (500/501/502), campos y
  comprobante SVG dibujado en un string.
- `src/lib/api-client.ts` existe pero **no lo importa ningún servicio**; no envía JWT.
- **Doble fuente de verdad**: `inscripcion/[idViaje]/page.tsx:7` importa `@/data/viajes`
  directo, sin pasar por el servicio.

### B2. Auth demo (no hay sesión real)
- `iniciar-sesion/page.tsx` y `registro/page.tsx`: cualquier submit escribe
  `localStorage["cnm_demo_rol"]="client"` y redirige. **Nunca llaman a `/auth/*`.**
- `types/auth.ts` define el contrato de login/registro **pero nadie lo usa** (muerto).
- `/admin` protegido por `cnm_demo_rol` sembrado a mano desde devtools
  (`admin/layout.tsx:15-17` re-declara la clave localStorage); **no existe UI de login admin**.
- **`/user/*` sin guard**: cualquier anónimo ve perfil/reservas/notificaciones mock.
- `/logout` solo borra el rol demo.
- Link a `/recuperar-password` (iniciar-sesion:45): **ruta que no existe**.

### B3. Datos de negocio hardcodeados
- `src/data/viajes.ts` (274 líneas): 10 viajes completos — montos, fechas, cupos, itinerario,
  equipo, punto de encuentro. **Debe venir de la BD.**
- `src/data/experiencias.ts`: carrusel del home (contenido editorial de viajes pasados;
  el backend no tiene entidad "experiencia pasada" → queda como contenido estático).
- Transferencia bancaria en `PasoPago.tsx:99-109`: banco BanPro, cuenta `100-022-000123-4`,
  titular. El backend no expone datos de pago del club → se mueve a **config del front**
  (`src/config/pago.ts`) como config institucional, no dato de BD.
- Comprobante: `URL.createObjectURL` (blob:) — al crearse la reserva se guarda una URL blob
  inválida. → compresión + data-URI (ver A4).
- `user/layout.tsx:56` "Bienvenido, Carlos" y `Header.tsx:169` "HikerGuy": usuario fijo
  en el chrome → debe salir de la sesión real.
- Umbrales "últimos cupos" inconsistentes: `<=2` en `PasoCupos.tsx:33` y
  `viajes/[id]/page.tsx:26`, pero `<=5` en `ViajeCard.tsx:34` (y ViajeCard es código muerto).
  RNF6 dice `<=2` → unificar a 2.
- Textos de estado duplicados: `demo.ts:14-24` vs `ui/Chip.tsx:6` (`etiquetasEstadoReserva`).
- Estadísticas del home (`SobreNosotros.tsx:4-8`: "150+ miembros" etc.): copy de marketing,
  se mantiene estático.

### B4. Handlers fantasma (botones que no hacen nada)
- `admin/viajes/page.tsx:165`: modal crear/editar viaje sin `onSubmit`; eliminar sin handler; estado "Activo" fijo.
- `admin/viajes/[id]/campos/page.tsx:40-45,148-152`: guardar/eliminar de campos no persiste.
- `admin/usuarios/page.tsx:91,136-147`: Buscar / Ver historial / Eliminar sin handler.
- `user/notificaciones/page.tsx:67,104`: marcar leídas sin handler.
- `Contacto.tsx:92-97`: formulario sin submit (ni backend). → reemplazar por deep-link a WhatsApp.
- `Footer.tsx:26-29`: botón "Messenger" sin destino.
- `user/settings` toggle no persiste (hay `PATCH /usuarios/me/notificaciones` real).
- `TarjetaCuenta.tsx`: componente muerto ("Continuar con Google" decorativo).
- `ViajeCard.tsx`: componente muerto que importa demo.ts.

### B5. Contratos front↔backend desalineados (tipos a corregir)
| Front (hoy) | Backend (real) |
|---|---|
| `PageResponse{page,size}` | `PageResponseDto{pageNumber,pageSize}` |
| `Reserva.montoTotal/confirmada/fechaCreacion/fechaActualizacion` | `montoReserva`, `fechaReserva`, `fechaRevision`, `editable`, `idAdministradorRevisor` |
| `ReservaDetalle` del cliente via servicio admin | `GET /reservas/{id}` (dueño o admin, ya validado en el servicio) |
| Historial sin viaje | `HistorialReservaResumenDto` trae `viaje{idViaje,titulo,dificultad,fechaHoraIda}` |
| Estadísticas `{inscritos,porcentajeOcupacion,rutasPopulares,resumenCupos{totalCupos,...}}` | `{inscritosPorViaje{idViaje,titulo,totalInscritos,cuposMaximos}, rutasMasPopulares{...,totalReservasAprobadas}, cuposReservados{totalCuposOfrecidos,totalCuposReservados,totalCuposDisponibles}}` |
| `ReservaAdminResumenDto` sin comprobante en el listado | El listado no trae `capturaComprobanteUrl`; el modal debe hacer `GET /reservas/{id}` |
| `CampoFormulario.opciones: string[]` | `opcionesRespuesta: string` (JSON string, parsear) |
| `usuario.notificacionesHabilitadas` en tipo `UsuarioPerfil` | existe igual ✔ (solo faltan `segundo*` y `fechaRegistro`) |
| Respuestas de formulario con `persona` (titular/acompañante) | `RespuestaFormularioDto` solo `{idCampo, valorRespuesta}` — sin dimensión persona → el formulario se responde una vez por reserva |
| `Notificacion.fecha` | `NotificacionResponseDto.fechaEnvio` |

### B6. Inconsistencias internas de mocks (desaparecen al conectar, registradas)
- `admin.service.ts` dice idViaje 1 = "Volcán Telica"; `data/viajes.ts` id 1 = "Volcán Mombacho".
- Reserva semilla 1043 sin `capturaComprobanteUrl` (el contrato la exige).
- Dos sistemas de notificaciones divergentes (página vs drawer del header).

## C. Decisiones para la implementación

1. **Sesión**: login/registro reales (`POST /auth/login|registro`); sesión en
   `localStorage["cnm_auth"]` `{token, idUsuario, correo, nombreCompleto, rol, notificacionesHabilitadas}`;
   `ApiClient` agrega `Authorization: Bearer`; en 401 se limpia sesión. Guards cliente en
   layouts: `/user/*` requiere sesión, `/admin/*` requiere `rol === "administrador"`.
   (middleware.ts no puede leer localStorage; anotado como mejora futura con cookie.)
2. **Comprobante**: compresión en cliente (máx ~1200px, JPEG q0.72) → data-URI en
   `capturaComprobanteUrl`. Deuda: endpoint de upload real.
3. **Datos bancarios**: `src/config/pago.ts` (config institucional del club; sin endpoint en backend).
4. **Itinerario/equipo/inclusiones**: strings multilinea (`\n`) desde la BD; el front separa.
   "Incluye" = base estática del club + `inclusionesAdicionales` de la BD.
5. **Semilla de datos** (`cnm-backend/seed-dev.sql`): 1 admin + 4 clientes (BCrypt), 10 viajes
   (los del mock, con `imagen_url` y `equipo`), campos de formulario para 3 viajes, 9 reservas
   en los 4 estados con acompañantes/respuestas/comprobante, notificaciones coherentes con
   las reglas del backend (aprobación con enlace, rechazo con motivo).
   Credenciales de demo: `admin@cnmontanismo.com` / `Admin1234`,
   `carlos.gonzalez@example.com` / `Cliente1234`.
6. **Deuda registrada, fuera de alcance MVP**: upload real de comprobantes, refresh token,
   401 en login fallido, push notifications (VAPID), recuperación de contraseña, middleware
   con cookie, formulario de contacto persistido.

## D. Plan de ejecución (criterios de aceptación)

| # | Etapa | Criterio de aceptación |
|---|---|---|
| 1 | Fix backend `/viajes` + columnas imagen/equipo + rebuild + restart | `curl /viajes` devuelve 200 con y sin filtros; `GET /viajes/{id}` trae `imagenUrl` y `equipo` |
| 2 | Semilla en PostgreSQL | Conteos: 5 usuarios, 10 viajes, ≥9 reservas, ≥3 conjuntos de campos, notificaciones; login admin y cliente devuelven token |
| 3 | Núcleo front: api-client JWT + auth real + tipos/servicios reales | `npx tsc --noEmit` pasa sin consumir `@/data/viajes` ni `@/lib/demo` |
| 4 | Páginas públicas/user y admin conectadas (2 agentes en paralelo) | Todos los handlers fantasma de B4 wired o eliminados; `npm run build` pasa |
| 5 | Gate de revisión con evidencia | greps limpios (sin mock/demo/data), build OK, smoke curl de los 6 flujos, counts psql |

> Los cambios del backend quedan **sin commit** en el working tree de `cnm-backend`
> (rama `feature/repository-develop`) para revisión; la BD se modifica con migración Flyway V2
> + seed manual reproducible.
