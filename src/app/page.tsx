import type { Metadata } from 'next';
import Link from 'next/link';
import MobileMenu from './MobileMenu';

export const metadata: Metadata = {
  title: 'SupraData | Control de Caja, Arqueo y Retención para Comercios en Mostrador',
  description:
    'Elimina el Excel y los cuadernos. Blinda tus ingresos en efectivo y transferencias, liquida turnos al centavo y recupera clientes por WhatsApp. Motor contable de mostrador para gimnasios, talleres y negocios.',
};

const NAV_LINKS = [
  { href: '#auditoria', label: 'Auditoría de Caja' },
  { href: '#arquitectura', label: 'Arquitectura' },
  { href: '#verticales', label: 'Verticales' },
  { href: '#especificaciones', label: 'Especificaciones' },
];

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-tight text-slate-900">
              SUPRADATA
            </span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              / OS
            </span>
          </Link>
          <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded">
            [ EN PRODUCCIÓN ]
          </span>
        </div>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors sm:inline-block px-3 py-1.5"
          >
            Acceso Personal
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-block bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm shadow-emerald-200/60"
          >
            Comenzar Gratis
          </Link>

          <MobileMenu links={NAV_LINKS} registerLabel="Comenzar Gratis" loginLabel="Acceso Personal" />
        </div>
      </div>
    </header>
  );
}

function LiveConsole() {
  return (
    <div id="auditoria" className="scroll-mt-16 relative max-w-4xl mx-auto mt-8 p-5 sm:p-7 bg-white/85 backdrop-blur-xl border border-emerald-100/90 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.08)]">
      {/* Header de consola */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
            SUPRADATA — CAJA PRINCIPAL
          </p>
          <h3 className="text-xs font-bold tracking-tight text-slate-900 font-mono mt-0.5">
            CONSOLA EN VIVO — TURNO ACTIVO
          </h3>
        </div>
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-mono px-2.5 py-0.5 rounded-full w-fit">
          [ EN LÍNEA • AUDITORÍA ACTIVA ]
        </span>
      </div>

      {/* Tarjetas de métricas */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card Recaudo */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Recaudo Total
          </p>
          <p className="text-xl font-black tabular-nums tracking-tight text-slate-900">
            $ 1.250.000
          </p>
          <p className="text-[10px] font-mono text-slate-500 mt-1">COP</p>
          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-mono text-slate-500">
            <span className="text-emerald-700">Efectivo: $ 750k</span>
            <span className="mx-1.5 text-slate-300">|</span>
            <span>Transf.: $ 500k</span>
          </div>
          {/* Línea de tendencia simulada */}
          <div className="mt-2 flex items-end gap-0.5 h-5">
            {[2, 3, 2.5, 4, 3.5, 5, 4.5, 6].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-emerald-400/60 rounded-sm"
                style={{ height: `${h * 14}%` }}
              />
            ))}
          </div>
        </div>

        {/* Card Descuadre */}
        <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/40 p-4">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Descuadre Detectado
          </p>
          <p className="text-xl font-black tabular-nums tracking-tight text-emerald-700">
            $ 0
          </p>
          <p className="text-[10px] font-mono text-slate-500 mt-1">COP</p>
          <div className="mt-3">
            <span className="bg-emerald-50 text-emerald-700 font-mono text-[11px] px-2 py-0.5 rounded border border-emerald-200/50">
              [ SIN DISCREPANCIA ]
            </span>
          </div>
          <p className="mt-2 text-[10px] font-mono text-emerald-600">
            Arqueo ciego validado
          </p>
        </div>

        {/* Card Cobranza */}
        <div className="rounded-2xl border border-blue-100/80 bg-blue-50/30 p-4">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Alerta de Cobranza
          </p>
          <p className="text-xl font-black tabular-nums tracking-tight text-slate-900">
            6
          </p>
          <p className="text-[10px] font-mono text-slate-500 mt-1">socios por vencer</p>
          <div className="mt-3">
            <span className="bg-blue-50 text-blue-700 border border-blue-200/50 font-mono text-[10px] px-2 py-0.5 rounded cursor-default">
              [ GESTIÓN WHATSAPP ]
            </span>
          </div>
          <p className="mt-2 text-[10px] font-mono text-blue-600">
            Detectados en los últimos 3 días
          </p>
        </div>
      </div>

      {/* Footer de consola */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
        <span>REGISTRO INMUTABLE: 0x7E49A • SHA-256</span>
        <span>VENTANA: 14:00:00 — 22:00:00 COT</span>
        <span className="text-emerald-600 font-semibold">DISCREPANCIA DECLARADA: $ 0 COP</span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Orbes glassmorphic de iluminación ambiental */}
      <div className="absolute top-[-100px] left-[-80px] w-[550px] h-[550px] bg-blue-300/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[5%] right-[-100px] w-[650px] h-[650px] bg-emerald-300/15 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-50/50 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Micro-badge superior */}
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[10px] font-mono tracking-widest px-3 py-1 rounded-full uppercase mx-auto block w-fit mb-4">
            [ MOTOR CONTABLE DE MOSTRADOR • VERSIÓN 2.0 ]
          </span>

          {/* H1 */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto text-center">
            El control total de tu negocio en la palma de tu mano. Dile adiós al Excel.
          </h1>

          {/* Subtítulo */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-5 mb-8 leading-relaxed text-center">
            Elimina el desorden del cuaderno y las planillas. Blinda tus ingresos en efectivo y
            transferencias, liquida turnos al centavo y recupera clientes por WhatsApp.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-2xl shadow-lg shadow-emerald-200/60 hover:shadow-xl hover:shadow-emerald-200/80 transition-all active:scale-[0.98] text-center"
            >
              Comenzar Prueba Gratis
            </Link>
            <a
              href="#auditoria"
              className="w-full sm:w-auto bg-white/90 hover:bg-white text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xs transition-all text-center"
            >
              Ver Auditoría en Vivo
            </a>
          </div>

          {/* Badges técnicos de credibilidad */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <span className="border border-slate-200 bg-slate-50 px-2.5 py-1 rounded">[ ARQUEO CIEGO ]</span>
            <span className="text-slate-300">•</span>
            <span className="border border-slate-200 bg-slate-50 px-2.5 py-1 rounded">[ CONCILIACIÓN POR TURNO ]</span>
            <span className="text-slate-300">•</span>
            <span className="border border-slate-200 bg-slate-50 px-2.5 py-1 rounded">[ MULTI-VERTICAL ]</span>
          </div>
        </div>

        {/* Consola de auditoría mockup */}
        <LiveConsole />
      </div>
    </section>
  );
}

function BentoGrid() {
  const features = [
    {
      badge: '[ VELOCIDAD ]',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/50',
      title: 'Respuesta en menos de 200 ms',
      desc: 'Cada operación de mostrador confirmada en tiempo real. Lectores de código de barras USB HID y cámaras web estándar sin latencia perceptible.',
      accent: 'border-blue-100/80',
    },
    {
      badge: '[ ARQUEO CIEGO ]',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
      title: 'Declaración sin visibilidad del saldo teórico',
      desc: 'El operador cuenta el efectivo físico antes de ver el cálculo del sistema. Elimina acomodos artificiales y detecta pérdidas en el momento exacto del relevo.',
      accent: 'border-emerald-100/80',
    },
    {
      badge: '[ HARDWARE UNIVERSAL ]',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
      title: 'Funciona en cualquier pantalla',
      desc: 'Tablet de mostrador, PC de escritorio o celular. Sin instalar aplicaciones nativas. Diseñado para hardware básico sin mantenimiento especializado.',
      accent: 'border-indigo-100/80',
    },
    {
      badge: '[ REGISTRO INMUTABLE ]',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
      title: 'Trazabilidad total de anulaciones',
      desc: 'Cada transacción anulada requiere motivo explícito y almacena la identidad del responsable. El registro contable original no se elimina.',
      accent: 'border-emerald-100/80',
    },
    {
      badge: '[ RETENCIÓN PREVENTIVA ]',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/50',
      title: 'Detección de deserción antes del vencimiento',
      desc: 'Algoritmo de ausencia que clasifica clientes en riesgo antes de que expire su ciclo. Contacto directo sin costo de pasarelas de mensajería.',
      accent: 'border-blue-100/80',
    },
    {
      badge: '[ 99.9% SLA ]',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200/50',
      title: 'Disponibilidad garantizada para operación continua',
      desc: 'Infraestructura con PostgreSQL administrado, transacciones ACID y sesiones cifradas JWT HS256. Desplegado en producción con uptime de meses.',
      accent: 'border-slate-200/60',
    },
  ];

  return (
    <section id="arquitectura" className="scroll-mt-16 py-16 sm:py-24 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 font-mono block mb-2">
            VENTAJAS OPERATIVAS
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Arquitectura de Conciliación Inmutable
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Diseñado bajo el principio de caja estricta: ninguna operación se borra, ninguna discrepancia queda oculta.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className={`rounded-2xl border ${f.accent} bg-white p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow`}
            >
              <span className={`${f.badgeColor} border font-mono text-[10px] px-2 py-0.5 rounded w-fit`}>
                {f.badge}
              </span>
              <h3 className="text-sm font-bold tracking-tight text-slate-900">{f.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechnicalVerticals() {
  return (
    <section id="verticales" className="scroll-mt-16 border-t border-slate-100 bg-slate-50/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 font-mono block mb-2">
            ARQUITECTURA DE DOMINIO Y APLICABILIDAD
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Selector Técnico de Verticales
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Un motor contable unificado adaptado a las dinámicas operativas de cada mostrador.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Vertical 1 — Activo */}
          <div className="bg-white rounded-2xl border border-emerald-100/90 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-400">
                  SECTOR 01
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] font-mono px-2 py-0.5 rounded">
                  [ ACTIVO ]
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold tracking-tight text-slate-900 font-mono">
                CENTROS DEPORTIVOS Y GIMNASIOS
              </h3>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Recepción y acceso para controlar flujo de atletas, evitar ingresos no autorizados
                y erradicar descuadres en venta de mostrador.
              </p>
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
                <p>• Registro por carnet QR digital</p>
                <p>• Control de pases por turno sin registro previo</p>
                <p>• Liquidación diaria con arqueo ciego</p>
                <p>• Seguimiento de membresías vencidas y reenganche</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/register"
                className="block text-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-all shadow-sm shadow-emerald-200/50"
              >
                Implementar en mi Establecimiento
              </Link>
            </div>
          </div>

          {/* Vertical 2 — Pipeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between opacity-80">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-400">
                  SECTOR 02
                </span>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-mono px-2 py-0.5 rounded">
                  [ PRÓXIMAMENTE ]
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold tracking-tight text-slate-900 font-mono">
                TALLERES Y CENTROS DE SERVICIO
              </h3>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Control para servicios mecánicos, centros de diagnóstico y mantenimiento automotriz
                con cobros parciales y liquidación por técnico.
              </p>
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
                <p>• Órdenes de trabajo por placa vehicular</p>
                <p>• Control de anticipos y abonos a cuenta</p>
                <p>• Recordatorios de mantenimiento preventivo</p>
                <p>• Facturación de mano de obra y repuestos</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="block text-center text-xs font-mono text-slate-400 py-2.5 border border-dashed border-slate-200 rounded-xl">
                Fase de Pruebas Privadas
              </span>
            </div>
          </div>

          {/* Vertical 3 — Pipeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between opacity-80">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-400">
                  SECTOR 03
                </span>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-mono px-2 py-0.5 rounded">
                  [ PRÓXIMAMENTE ]
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold tracking-tight text-slate-900 font-mono">
                BARES Y ESTABLECIMIENTOS GASTRO
              </h3>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Puntos de venta con alto volumen de operaciones en efectivo, propinas y rotación
                rápida de productos por barra o mostrador.
              </p>
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
                <p>• Arqueos ciegos de caja registradora</p>
                <p>• Liquidación de turno por cajero y barra</p>
                <p>• Control de inventario de mostrador en tiempo real</p>
                <p>• Conciliación estricta de propinas y datáfono</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="block text-center text-xs font-mono text-slate-400 py-2.5 border border-dashed border-slate-200 rounded-xl">
                Fase de Pruebas Privadas
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TechnicalSpecs() {
  const specs = [
    { param: 'Arquitectura de Sistema', detail: 'Next.js App Router (Server-First), React 19, TypeScript estricto' },
    { param: 'Persistencia de Datos', detail: 'PostgreSQL administrado con Drizzle ORM, índices btree y transacciones ACID' },
    { param: 'Mecanismo de Autenticación', detail: 'Sesiones stateless cifradas mediante JOSE (JWT HS256) con cookies httpOnly' },
    { param: 'Auditoría de Turnos', detail: 'Apertura con base forzosa, registro de egresos menores y arqueo ciego final' },
    { param: 'Identificación Digital', detail: 'Token criptográfico único con renderizado QR SVG sin dependencias de app nativa' },
    { param: 'Soporte de Conectividad', detail: 'Optimizado para lectores de código de barras USB HID y cámaras web estándar' },
    { param: 'Tasa de Disponibilidad (SLA)', detail: '99.9% de uptime garantizado para operaciones continuas de mostrador' },
  ];

  return (
    <section id="especificaciones" className="scroll-mt-16 border-t border-slate-100 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 font-mono block mb-2">
            ESPECIFICACIONES TÉCNICAS DE PRODUCCIÓN
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Ficha de Infraestructura y Estándares
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Parámetros de diseño del software para despliegue en producción.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5 w-1/3">Parámetro Técnico</th>
                <th className="py-3 px-5">Implementación en Producción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {specs.map((s, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-3 px-5 font-semibold text-slate-900">{s.param}</td>
                  <td className="py-3 px-5 text-slate-600">{s.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="relative overflow-hidden border-t border-slate-100 py-20 sm:py-28">
      {/* Orbe de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/40 via-white to-blue-50/20 -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <p className="text-[10px] tracking-widest uppercase font-semibold text-emerald-700 font-mono block mb-3">
          DESPLIEGUE INMEDIATO
        </p>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Inicia la auditoría de mostrador en tu establecimiento.
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Configuración en 3 minutos. Abre tu primer turno de caja, valida cobros en tiempo real y
          asegura cada peso que ingresa a tu negocio.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-200/60 hover:shadow-xl hover:shadow-emerald-200/80 transition-all active:scale-[0.98]"
          >
            Crear Cuenta de Establecimiento
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto bg-white/90 hover:bg-white text-slate-700 border border-slate-200 font-semibold text-sm px-6 py-3.5 rounded-2xl shadow-xs transition-all"
          >
            Acceder al Sistema
          </Link>
        </div>

        <p className="mt-6 text-[11px] font-mono text-slate-400">
          SIN TARJETA DE CRÉDITO • ARQUEO INMUTABLE • MULTI-DISPOSITIVO
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-12 text-slate-600 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          <div className="md:col-span-2">
            <span className="font-mono text-sm font-bold tracking-tight text-slate-900 block">
              SUPRADATA
            </span>
            <p className="mt-2 text-xs text-slate-500 max-w-sm leading-relaxed">
              Plataforma de control contable, arqueo de caja y retención para comercios con cobro en
              mostrador. Arquitectura técnica de alta densidad.
            </p>
            <p className="mt-4 font-mono text-[10px] text-emerald-600">
              BUILD: 2026.10-PROD • PROTOCOLO SHA-256
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] font-semibold text-slate-900 uppercase tracking-wider">
              Navegación
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-slate-500">
              <li><a href="#auditoria" className="hover:text-slate-900 transition-colors">Auditoría de Caja</a></li>
              <li><a href="#arquitectura" className="hover:text-slate-900 transition-colors">Arquitectura</a></li>
              <li><a href="#verticales" className="hover:text-slate-900 transition-colors">Verticales</a></li>
              <li><a href="#especificaciones" className="hover:text-slate-900 transition-colors">Especificaciones</a></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] font-semibold text-slate-900 uppercase tracking-wider">
              Acceso a Terminales
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-slate-500">
              <li><Link href="/login" className="hover:text-slate-900 transition-colors">Acceso Personal</Link></li>
              <li><Link href="/register" className="hover:text-slate-900 transition-colors">Registro de Sede</Link></li>
              <li><Link href="/dashboard" className="hover:text-slate-900 transition-colors">Panel de Control</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <p>© 2026 SUPRADATA. TODOS LOS DERECHOS RESERVADOS.</p>
          <p>SISTEMA OPERATIVO COMERCIAL • CONTROL DE CAJA Y ARQUEO</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#fcfdff] text-slate-800 overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Header />
      <main>
        <Hero />
        <BentoGrid />
        <TechnicalVerticals />
        <TechnicalSpecs />
        <FinalCallToAction />
      </main>
      <Footer />
    </div>
  );
}
