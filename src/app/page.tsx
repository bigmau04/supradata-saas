import type { Metadata } from 'next';
import Link from 'next/link';
import MobileMenu from './MobileMenu';

export const metadata: Metadata = {
  title: 'SupraData | Sistema Operativo Comercial y Control de Caja en Mostrador',
  description:
    'Plataforma de control contable, arqueo de caja y retención para comercios con cobro en mostrador. Conciliación estricta de turnos y recuperación de cartera sin fricción operativa.',
};

const NAV_LINKS = [
  { href: '#arquitectura', label: 'Arquitectura' },
  { href: '#verticales', label: 'Verticales' },
  { href: '#auditoria', label: 'Auditoría de Caja' },
  { href: '#especificaciones', label: 'Especificaciones' },
];

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-tight text-slate-900">
              SUPRADATA
            </span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              / OS
            </span>
          </Link>
          <span className="hidden sm:inline-block text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
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
            className="hidden text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors sm:inline-block px-3 py-1.5"
          >
            Acceso Personal
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-block bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium px-4 py-2 rounded-lg transition-colors shadow-2xs"
          >
            Iniciar Demostración
          </Link>

          <MobileMenu links={NAV_LINKS} registerLabel="Iniciar Demostración" loginLabel="Acceso Personal" />
        </div>
      </div>
    </header>
  );
}

function CashAuditMockup() {
  return (
    <div className="mx-auto mt-12 w-full max-w-3xl">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Cabecera Técnica */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/75 px-5 py-3.5">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-slate-500 block">
              COMPONENTE FINANCIERO — CONCILIACIÓN EN TIEMPO REAL
            </span>
            <h3 className="text-xs font-bold tracking-tight text-slate-900 font-mono mt-0.5">
              AUDITORÍA DE CAJA — TURNO TARDE
            </h3>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
              TERMINAL: T-01
            </span>
            <span className="text-[10px] font-mono text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded">
              [ ESTADO: CERRADO ]
            </span>
          </div>
        </div>

        {/* Tabla Contable de Alta Densidad */}
        <div className="p-5">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="pb-2 font-medium">Concepto Operativo</th>
                <th className="pb-2 font-medium">Origen / Validación</th>
                <th className="pb-2 text-right font-medium">Valor Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-2.5 font-medium text-slate-900">Recaudo Efectivo</td>
                <td className="py-2.5 text-slate-500">Fuente: Sistema (Cajero presencial)</td>
                <td className="py-2.5 text-right font-semibold text-slate-900 tabular-nums">
                  $ 244.000 COP
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-900">Recaudo Transferencia</td>
                <td className="py-2.5 text-slate-500">Fuente: Pasarela / Bancos (Comprobante)</td>
                <td className="py-2.5 text-right font-semibold text-slate-900 tabular-nums">
                  $ 246.750 COP
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-900">Salidas / Gastos Menores</td>
                <td className="py-2.5 text-slate-500">Concepto: Insumos de mostrador</td>
                <td className="py-2.5 text-right font-semibold text-slate-600 tabular-nums">
                  - $ 15.000 COP
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 font-mono">
                <td colSpan={2} className="pt-3 font-bold text-slate-900 uppercase tracking-tight text-xs">
                  Balance Neto Esperado (Auditoría)
                </td>
                <td className="pt-3 text-right font-bold text-sm text-slate-900 tabular-nums">
                  $ 475.750 COP
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Metadata Footer */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
            <span>REGISTRO INMUTABLE: 0x7E49A • SHA-256</span>
            <span>VENTANA: 14:00:00 — 22:00:00 COT</span>
            <span className="text-slate-600 font-medium">DISCREPANCIA DECLARADA: $ 0 COP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="border-b border-slate-200 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Micro-etiqueta superior */}
          <div className="inline-block">
            <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-500 border border-slate-200 bg-slate-50 px-3 py-1 rounded-full">
              SISTEMA OPERATIVO COMERCIAL • VERSIÓN 2.0
            </span>
          </div>

          {/* Titular principal H1 */}
          <h1 className="mt-6 text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Control de caja, gestión de ingresos y cobranza directa en mostrador.
          </h1>

          {/* Subtítulo */}
          <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Diseñado para erradicar las fugas de efectivo, conciliar turnos y automatizar la
            recuperación de cartera sin fricción operativa ni manuales.
          </p>

          {/* Acciones */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium px-5 py-2.5 rounded-lg transition-colors text-center shadow-2xs"
            >
              Iniciar Demostración
            </Link>
            <a
              href="#especificaciones"
              className="w-full sm:w-auto border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium px-5 py-2.5 rounded-lg transition-colors text-center"
            >
              Ver Especificaciones Técnicas
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <span>[ ARQUEO CIEGO ]</span>
            <span>•</span>
            <span>[ CONCILIACIÓN POR TURNO ]</span>
            <span>•</span>
            <span>[ MULTI-VERTICAL ]</span>
          </div>
        </div>

        {/* Mockup de datos financieros */}
        <CashAuditMockup />
      </div>
    </section>
  );
}

function TechnicalVerticals() {
  return (
    <section id="verticales" className="scroll-mt-16 border-b border-slate-200 bg-slate-50/50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-500 font-mono block">
            ARQUITECTURA DE DOMINIO Y APLICABILIDAD
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Selector Técnico de Verticales
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Un motor contable unificado adaptado a las dinámicas operativas de cada mostrador.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vertical 1 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-500">
                  SECTOR 01
                </span>
                <span className="bg-slate-100 text-slate-800 text-[10px] font-mono px-2 py-0.5 rounded font-medium">
                  [ DISPONIBLE ]
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold tracking-tight text-slate-900 font-mono">
                VERTICAL 01: CENTROS DEPORTIVOS Y GIMNASIOS
              </h3>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Plataforma de recepción y acceso diseñada para controlar flujo diario de atletas,
                evitar ingresos no autorizados y erradicar descuadres en venta de mostrador.
              </p>

              <div className="mt-5 space-y-2 pt-4 border-t border-slate-100 text-xs">
                <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                  Capacidades del Sistema:
                </p>
                <div className="space-y-1.5 text-slate-700">
                  <p>• Registro biométrico facial y carnet QR digital</p>
                  <p>• Control de pases por turno sin registro previo</p>
                  <p>• Liquidación diaria con arqueo ciego</p>
                  <p>• Seguimiento de membresías vencidas y reenganche</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/register"
                className="block text-center bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium py-2 px-3 rounded-lg transition-colors"
              >
                Implementar en Gimnasio
              </Link>
            </div>
          </div>

          {/* Vertical 2 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-500">
                  SECTOR 02
                </span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded font-medium">
                  [ PRÓXIMAMENTE ]
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold tracking-tight text-slate-900 font-mono">
                VERTICAL 02: TALLERES Y CENTROS DE SERVICIO
              </h3>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Control de mostrador orientado a servicios mecánicos, centros de diagnóstico y
                mantenimiento automotriz con cobros parciales y liquidación por técnico.
              </p>

              <div className="mt-5 space-y-2 pt-4 border-t border-slate-100 text-xs">
                <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                  Capacidades del Sistema:
                </p>
                <div className="space-y-1.5 text-slate-700">
                  <p>• Órdenes de trabajo por placa vehicular</p>
                  <p>• Control de anticipos y abonos a cuenta</p>
                  <p>• Recordatorios de mantenimiento preventivo</p>
                  <p>• Facturación de mano de obra y repuestos de taller</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="block text-center text-xs font-mono text-slate-400 py-2 border border-dashed border-slate-200 rounded-lg">
                Fase de Pruebas Privadas
              </span>
            </div>
          </div>

          {/* Vertical 3 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-500">
                  SECTOR 03
                </span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded font-medium">
                  [ PRÓXIMAMENTE ]
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold tracking-tight text-slate-900 font-mono">
                VERTICAL 03: BARES Y ESTABLECIMIENTOS GASTRO
              </h3>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Módulo para puntos de venta con alto volumen de operaciones en efectivo, propinas y
                rotación rápida de productos por barra o mostrador.
              </p>

              <div className="mt-5 space-y-2 pt-4 border-t border-slate-100 text-xs">
                <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                  Capacidades del Sistema:
                </p>
                <div className="space-y-1.5 text-slate-700">
                  <p>• Arqueos ciegos de caja registradora</p>
                  <p>• Liquidación de turno por cajero y barra</p>
                  <p>• Control de inventario de mostrador en tiempo real</p>
                  <p>• Conciliación estricta de propinas y datáfono</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="block text-center text-xs font-mono text-slate-400 py-2 border border-dashed border-slate-200 rounded-lg">
                Fase de Pruebas Privadas
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SystemArchitecture() {
  return (
    <section id="arquitectura" className="scroll-mt-16 border-b border-slate-200 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-500 font-mono block">
            PRINCIPIOS DE INGENIERÍA
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Arquitectura de Conciliación Inmutable
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Diseñado bajo el principio de caja estricta: ninguna operación se borra, ninguna
            discrepancia queda oculta.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-2">
              01 • ARQUEO CIEGO OBLIGATORIO
            </span>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Declaración sin visibilidad del saldo teórico
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              El operador cuenta el efectivo físico real en caja sin saber cuánto dinero calcula el
              software. Esto evita acomodos artificiales de dinero y detecta pérdidas en el momento
              exacto del relevo.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-2">
              02 • TRAZABILIDAD Y ANULACIÓN AUDITADA
            </span>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Motivo obligatorio y registro de usuario
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cada transacción anulada requiere justificación explícita y almacena la identidad del
              usuario responsable. El registro queda marcado como auditado sin eliminar el registro
              contable original.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-2">
              03 • PROTOCOLO DE RETENCIÓN PREVENTIVA
            </span>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Detección de deserción antes del vencimiento
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Algoritmo de cálculo de ausencia que clasifica clientes en estados de riesgo antes de
              que expire su ciclo de pago. Generación de contacto directo sin costo de pasarelas de
              mensajería.
            </p>
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
    <section id="especificaciones" className="scroll-mt-16 border-b border-slate-200 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-500 font-mono block">
            ESPECIFICACIONES TÉCNICAS DE PRODUCCIÓN
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Ficha de Infraestructura y Estándares
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Parámetros de diseño del software para despliegue en producción.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-1/3">Parámetro Técnico</th>
                <th className="py-3 px-4">Implementación en Producción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {specs.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40">
                  <td className="py-3 px-4 font-semibold text-slate-900">{s.param}</td>
                  <td className="py-3 px-4 text-slate-600">{s.detail}</td>
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
    <section className="bg-slate-50/70 py-16 sm:py-24 border-b border-slate-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-500 font-mono block">
          DESPLIEGUE INMEDIATO
        </span>
        <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Inicia la auditoría de mostrador en tu establecimiento.
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Configuración en 3 minutos. Abre tu primer turno de caja, valida cobros en tiempo real y
          asegura cada peso que ingresa a tu negocio.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium px-6 py-3 rounded-lg transition-colors shadow-2xs"
          >
            Crear Cuenta de Establecimiento
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto border border-slate-300 text-slate-700 hover:bg-white text-xs font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Acceder al Sistema
          </Link>
        </div>

        <p className="mt-5 text-[11px] font-mono text-slate-400">
          SIN TARJETA DE CRÉDITO • ARQUEO INMUTABLE • MULTI-DISPOSITIVO
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white py-12 text-slate-600 text-xs">
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
            <p className="mt-4 font-mono text-[10px] text-slate-400">
              BUILD: 2026.10-PROD • PROTOCOLO SHA-256
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] font-semibold text-slate-900 uppercase tracking-wider">
              Navegación
            </p>
            <ul className="mt-3 space-y-2 text-slate-500">
              <li>
                <a href="#arquitectura" className="hover:text-slate-900 transition-colors">
                  Arquitectura
                </a>
              </li>
              <li>
                <a href="#verticales" className="hover:text-slate-900 transition-colors">
                  Verticales
                </a>
              </li>
              <li>
                <a href="#especificaciones" className="hover:text-slate-900 transition-colors">
                  Especificaciones
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] font-semibold text-slate-900 uppercase tracking-wider">
              Acceso a Terminales
            </p>
            <ul className="mt-3 space-y-2 text-slate-500">
              <li>
                <Link href="/login" className="hover:text-slate-900 transition-colors">
                  Acceso Personal
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-slate-900 transition-colors">
                  Registro de Sede
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                  Panel de Control
                </Link>
              </li>
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
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      <Header />
      <main>
        <Hero />
        <TechnicalVerticals />
        <SystemArchitecture />
        <TechnicalSpecs />
        <FinalCallToAction />
      </main>
      <Footer />
    </div>
  );
}
