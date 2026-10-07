# SupraData Gym SaaS — Estado del Proyecto & Hoja de Ruta

## 1. Visión & Propuesta de Valor Central
- **De ERP Administrativo a Copiloto Financiero:** SupraData no es solo un registro de asistencia y cobros; es un motor de retención y recuperación de ingresos para gimnasios medianos y pequeños.
- **Premisa de Producto:** "No te mostramos solo cómo está tu gimnasio: te decimos qué dinero estás dejando escapar hoy y a quién debes contactar para recuperarlo."
- **Stack Tecnológico:** Next.js 15+ (App Router), Tailwind CSS, Lucide React, PostgreSQL (Supabase) + Drizzle ORM, JWT en Cookies HTTP-Only, bcryptjs, Server Actions nativas.

## 2. Arquitectura de Base de Datos y Modelos
Aislamiento Multi-tenant estricto mediante `gym_id` en todas las consultas de lectura y mutación.

**Tablas Activas (`src/db/schema.ts`):**
- **gyms**: Datos fiscales (`tax_id` / NIT), slug y configuración.
- **branches**: Sedes asociadas a los gimnasios.
- **app_users**: Personal del gimnasio (roles: `admin`, `reception`).
- **membership_plans**: Planes comerciales creados por el administrador (`name`, `duration_days`, `price`, `description`).
- **members**: Socios registrados con `qr_access_token` único.
- **member_subscriptions**: Histórico de membresías (`start_date`, `end_date`, `status`).
- **attendances**: Entradas y salidas para cálculo de ocupación y frecuencia de entrenamiento.
- **payments**: Libro mayor de cobros (membresías, tienda, pases exprés).
- **cash_shifts**: Turnos de caja (base inicial, ingresos en efectivo, gastos, arqueo final y descuadres).
- **products**: Catálogo de mostrador (aguas, snacks, suplementos).
- **expenses**: Egresos menores pagados desde la caja física del turno activo.

## 3. Flujos Implementados y Validados
- **Onboarding Multi-tenant (`/register`, `/login`):** Registro transaccional de gimnasio con NIT/Cédula, sede, admin y plan base "Pase Diario Exprés".
- **Gestión de Planes (`/dashboard/plans`):** Catálogo comercial configurable por el administrador.
- **Recepción & Mostrador (`/dashboard/reception`):**
  - Control de caja por turnos (apertura obligatoria para recepcionista, opcional para admin).
  - Tienda rápida con multiplicador reactivo de cantidades y cobro directo a caja.
  - Check-in por escáner QR o cédula, y pase exprés de 1 clic.
- **Carnet Digital Público (`/pass/[token]`):** QR de acceso y tarjeta de aforo en vivo semafórica (últimas 2 horas) sin requerir app nativa.

## 4. Hoja de Ruta Priorizada (Roadmap por Fases)

### Fase 1: Integridad Operativa & Blindaje Financiero (Inmediato)
- **Inmutabilidad de Pagos:** Prohibir borrado físico (`DELETE`). Manejar estado `voided` con motivo y auditoría (`void_reason`, `voided_by`, `voided_at`).
- **Idempotencia:** Prevenir cobros dobles por doble clic o latencia en cobros de membresía y ventas de mostrador.
- **Audit Logs (`audit_logs`):** Trazabilidad de acciones sensibles (anulaciones de cobro, cambios de precio en planes, cierres de caja con descuadre).

### Fase 2: Motor de Retención & Dashboard Accionable (Diferenciador SaaS)
- **Cálculo de "Socio en Riesgo" (Churn Score Simple):**
  - 🟢 Saludable: Asistencia regular + membresía vigente > 7 días.
  - 🟡 Riesgo: Asistencia cayendo o vence en ≤ 7 días.
  - 🔴 Crítico: Sin asistencia > 7 días y vencimiento inmediato o vencido.
- **Botón de Contacto Rápido:** Enlace directo a WhatsApp (`https://wa.me/...`) con plantilla dinámica de reactivación/renovación sin costos de API.
- **Tarjeta de "Revenue en Riesgo":** Total en dinero acumulado por socios en riesgo de no renovar vs. recuperables hoy.
- **Histórico de Arqueos:** Vista gerencial para que el administrador audite turnos y descuadres de caja por recepcionista.

### Fase 3: SupraPass & Mini-Portal del Socio
- Expansión de `/pass/[token]` a mini-app web: consulta de histórico de asistencia, vencimiento de plan y botón de solicitud de renovación por WhatsApp.
- Gestión básica de horarios y reservas de clases grupales para controlar aforo y métrica de *no-show*.

### Fase 4: Inteligencia y Automatización (Futuro)
- *Gym Health Score* unificado (Retención, Finanzas, Asistencia).
- Automatización programada desatendida de recordatorios de cobro vía WhatsApp API.
