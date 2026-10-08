import type { Metadata } from "next";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  MessageCircle,
  Minus,
  QrCode,
  Scale,
  ShieldCheck,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SupraData Gym | El Software Operativo para Gimnasios y Salas de Entrenamiento",
  description:
    "El software que blinda la caja de tu gimnasio y rescata a los socios que dejan de entrenar. Arqueo ciego, pases de mostrador en 2 clics y alertas automáticas de inasistencia directo a WhatsApp.",
};

const NAV_LINKS = [
  { href: "#mostrador", label: "Mostrador del Gym" },
  { href: "#retencion", label: "Retención & WhatsApp" },
  { href: "#suprapass", label: "SupraPass QR" },
  { href: "#calculadora", label: "Calculadora Gym" },
];

const PAIN_POINTS = [
  {
    icon: ShoppingCart,
    tag: "Fuga #1: Descuadres de Caja",
    title: "Descuadres en la venta de hidratación y suplementos",
    pain:
      "Bebidas energéticas, botellas de agua o sobres de proteína entregados por el recepcionista sin registrar, o descuadres al cambiar de turno cuando el dinero no coincide con los cobros del día.",
    solution:
      "Tienda rápida con multiplicador (2x Agua Cristal a un toque) y arqueo ciego donde el recepcionista declara el dinero real en efectivo sin ver el saldo teórico del sistema.",
    color: "rose",
  },
  {
    icon: Flame,
    tag: "Fuga #2: Deserción Silenciosa",
    title: "El socio fantasma que abandona la rutina",
    pain:
      "Más del 40% de los clientes dejan de ir a entrenar dos semanas antes de que venza su mensualidad. Si nadie les escribe antes de que se enfríen las ganas, simplemente no renuevan.",
    solution:
      "Semáforo de retención inteligente (🟢 Saludable, 🟡 En Riesgo, 🔴 Crítico). SupraData te dice a quién contactar hoy y pre-redacta el mensaje en WhatsApp con un solo clic.",
    color: "amber",
  },
  {
    icon: QrCode,
    tag: "Fuga #3: Accesos Lentos y Costos",
    title: "Filas en la entrada y carnets plásticos costosos",
    pain:
      "Gastar presupuesto en carnets de PVC que los socios pierden, o forzarlos a descargar una aplicación pesada de 100 MB que nadie quiere tener instalada en su celular.",
    solution:
      "SupraPass: carnet web instantáneo con QR único por socio y semáforo de aforo en tiempo real para que sepan si las máquinas y la sala de musculación están llenas.",
    color: "blue",
  },
] as const;

const COMPARISON_ROWS = [
  {
    aspect: "Control de pases diarios y tiqueteras",
    legacy: "Anotado en papel o una celda de Excel sin control de caja ni turno responsable.",
    supra: "Pase diario en 2 toques: asigna método de pago y entra de inmediato a la auditoría del turno.",
  },
  {
    aspect: "Seguimiento de inasistencias en sala",
    legacy: "Te enteras de que el socio desertó 2 semanas después de vencido el plan, cuando ya no vuelve.",
    supra: "Semáforo predictivo: alerta automática al 5° día sin entrenar para reengancharlo a tiempo.",
  },
  {
    aspect: "Arqueos de mostrador y cambio de turno",
    legacy: "El cajero ve el total recaudado y 'acomoda' el efectivo para que cuadre a su conveniencia.",
    supra: "Arqueo ciego estricto: el recepcionista cuenta billetes sin ver el sistema; auditoría 100% transparente.",
  },
  {
    aspect: "Venta de suplementos e hidratación",
    legacy: "Descontrol de botellas de agua, pre-entrenos y batidos; fugas hormiga difíciles de rastrear.",
    supra: "Botonera exprés de mostrador con multiplicadores (1 toque = 2 aguas + 1 isotónico) en segundos.",
  },
  {
    aspect: "Carnet de acceso y monitoreo de aforo",
    legacy: "Tarjetas de PVC costosas que se extravían, o apps pesadas que los socios rechazan descargar.",
    supra: "SupraPass web con QR por token y semáforo de ocupación de sala en vivo, sin instalar nada.",
  },
  {
    aspect: "Contacto y recuperación del socio",
    legacy: "Llamadas manuales improvisadas o costosos servicios de mensajería masiva con costo por API.",
    supra: "Enlace directo a WhatsApp (wa.me) con mensaje personalizado y amigable, costo de API: $0.",
  },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="SupraData Gym inicio">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
        <Dumbbell className="h-5 w-5" strokeWidth={2.4} />
      </span>
      <div className="flex flex-col">
        <span className="text-lg font-black tracking-tight text-slate-900 leading-tight">
          SupraData <span className="text-blue-600">Gym</span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Fitness Operations OS
        </span>
      </div>
    </Link>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación Principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
          >
            Acceso Personal
          </Link>
          <Link
            href="/register"
            className="hidden rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow sm:inline-flex"
          >
            Registrar Mi Gimnasio
          </Link>

          <MobileMenu
            links={NAV_LINKS}
            registerLabel="Registrar Mi Gimnasio"
            loginLabel="Acceso Personal"
          />
        </div>
      </div>
    </header>
  );
}

function LiveMockupGym() {
  return (
    <div className="relative mx-auto mt-12 w-full max-w-4xl sm:mt-16">
      {/* Resplandor atlético de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-4 -inset-y-6 -z-10 rounded-[2.5rem] bg-gradient-to-b from-blue-100/70 via-emerald-50/50 to-transparent blur-2xl"
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
        {/* Cabecera del Mostrador Gym */}
        <div className="flex flex-col gap-2.5 border-b border-slate-200 bg-slate-50/90 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-3 w-3 rounded-full bg-rose-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            </span>
            <div className="ml-1 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white">
                <Dumbbell className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-bold text-slate-900">
                Gimnasio Titán • Sede Central
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 sm:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            <span>Turno Mañana (Recepción) • En caja: $148.500</span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Métrica crítica del Gym: Revenue en Riesgo */}
          <div className="flex flex-col gap-4 rounded-xl border border-rose-200 bg-rose-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <TrendingDown className="h-3.5 w-3.5 stroke-[2.5]" />
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Alerta de Retención de Sala
                </p>
              </div>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                <span>$1.450.000</span>
                <span className="text-sm font-bold text-rose-600 sm:text-base">
                  en Mensualidades en Riesgo
                </span>
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-rose-300 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-700 shadow-sm sm:self-auto">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              14 socios sin pisar el gym hace más de 6 días
            </span>
          </div>

          {/* Lista de socios del gym con botones directos */}
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="hidden grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid">
              <span className="col-span-3">Socio &amp; Plan</span>
              <span className="col-span-2">Última Asistencia</span>
              <span className="col-span-2">Vencimiento</span>
              <span className="col-span-2">Estado</span>
              <span className="col-span-3 text-right">Contacto Rápido</span>
            </div>

            {/* Socio 1: Carlos Mendoza */}
            <div className="grid grid-cols-1 items-center gap-3 border-b border-slate-100 px-4 py-3.5 md:grid-cols-12 md:gap-3">
              <div className="flex items-center gap-3 md:col-span-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-700 border border-slate-200">
                  CM
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    Carlos Mendoza
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Mensualidad Musculación
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-700 md:col-span-2 md:block">
                <span className="text-xs font-semibold text-slate-400 md:hidden">Última visita:</span>
                <span className="font-semibold text-rose-600">Hace 8 días</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-700 md:col-span-2 md:block">
                <span className="text-xs font-semibold text-slate-400 md:hidden">Vencimiento:</span>
                <span className="font-medium text-slate-900">En 2 días</span>
              </div>
              <div className="flex items-center justify-between md:col-span-2 md:block">
                <span className="text-xs font-semibold text-slate-400 md:hidden">Estado:</span>
                <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                  🔴 Crítico
                </span>
              </div>
              <div className="pt-2 md:col-span-3 md:pt-0 md:text-right">
                <a
                  href="https://wa.me/?text=Hola%20Carlos%20te%20extrañamos%20en%20el%20gym"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 md:w-auto"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Escribir al WhatsApp
                </a>
              </div>
            </div>

            {/* Socio 2: Valentina Gómez */}
            <div className="grid grid-cols-1 items-center gap-3 px-4 py-3.5 md:grid-cols-12 md:gap-3">
              <div className="flex items-center gap-3 md:col-span-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-blue-700 border border-blue-200">
                  VG
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    Valentina Gómez
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Trimestre Funcional
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-700 md:col-span-2 md:block">
                <span className="text-xs font-semibold text-slate-400 md:hidden">Última visita:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Entrenó hoy
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-700 md:col-span-2 md:block">
                <span className="text-xs font-semibold text-slate-400 md:hidden">Vencimiento:</span>
                <span className="font-medium text-slate-900">En 4 días</span>
              </div>
              <div className="flex items-center justify-between md:col-span-2 md:block">
                <span className="text-xs font-semibold text-slate-400 md:hidden">Estado:</span>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  🟡 Renovar cupo
                </span>
              </div>
              <div className="pt-2 md:col-span-3 md:pt-0 md:text-right">
                <a
                  href="https://wa.me/?text=Hola%20Valentina%20tu%20plan%20vence%20en%204%20dias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 md:w-auto"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Recordar Pago
                </a>
              </div>
            </div>
          </div>

          {/* Resumen de sala en vivo */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <span className="text-xs font-semibold text-slate-600">Pases de un día (Hoy):</span>
              <span className="text-sm font-bold text-slate-900">12 cobrados ($180.000)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <span className="text-xs font-semibold text-slate-600">Tienda Mostrador:</span>
              <span className="text-sm font-bold text-slate-900">8 aguas + 3 pre-entrenos</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <span className="text-xs font-semibold text-slate-600">Aforo sala de pesas:</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> 28 / 60 atletas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pb-16 pt-10 sm:pb-24 sm:pt-16">
      {/* Malla de gradiente suave */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[480px] bg-[radial-gradient(50%_50%_at_50%_0%,rgba(37,99,235,0.08),transparent)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Pill Badge especializado */}
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm sm:text-sm">
            🏋️ Diseñado exclusivamente para Gimnasios y Salas de Entrenamiento
          </span>

          {/* Título H1 contundente */}
          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.12] lg:text-6xl">
            El software que blinda la caja de tu gimnasio y{" "}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              rescata a los socios
            </span>{" "}
            que dejan de entrenar.
          </h1>

          {/* Subtítulo de alto impacto */}
          <p className="mx-auto mt-6 max-w-2xl text-base font-normal leading-relaxed text-slate-600 sm:text-lg">
            Olvídate de las cajas descuadradas por venta de bebidas, las filas en la recepción y
            los socios que desaparecen de las máquinas sin avisar. Auditoría de turnos con arqueo
            ciego, pases de mostrador en 2 clics y alertas automáticas de inasistencia directo a WhatsApp.
          </p>

          {/* Botones CTA */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg sm:w-auto sm:text-base"
            >
              Comenzar Gratis — Activar Sede
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto sm:text-base"
            >
              Ver Demo de Recepción
            </Link>
          </div>

          {/* Micro-texto de prueba */}
          <p className="mt-5 text-xs font-semibold text-slate-500 sm:text-sm">
            ✓ Sin contratos de permanencia • Control de aforo en sala • Carnet digital sin descargar apps
          </p>
        </div>

        {/* Live Mockup Gym: centro de gravedad */}
        <LiveMockupGym />
      </div>
    </section>
  );
}

function MoneyLeaks() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-700">
            <AlertTriangle className="h-3.5 w-3.5" /> Diagnóstico Operativo
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Las 3 Fugas de Dinero Habituales en un Gimnasio
          </h2>
          <p className="mt-3 text-base text-slate-600">
            La mayoría de gimnasios no quiebran por falta de personas interesadas, sino por desorden
            en la caja de recepción y por no escribirle a los socios antes de que se enfríen.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PAIN_POINTS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      card.color === "rose"
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : card.color === "amber"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-blue-50 text-blue-600 border border-blue-200"
                    }`}
                  >
                    <Icon className="h-6 w-6 stroke-[2.2]" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {card.tag}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold leading-snug text-slate-900">
                  {card.title}
                </h3>

                {/* El dolor */}
                <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
                    El Dolor Real
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                    {card.pain}
                  </p>
                </div>

                {/* La solución */}
                <div className="mt-3.5 flex-1 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    La Solución SupraData
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
                    {card.solution}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-slate-700">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Check className="h-3.5 w-3.5 stroke-[3]" />
      </span>
      <span className="text-sm font-medium leading-relaxed sm:text-base">{children}</span>
    </li>
  );
}

function OperativeModules() {
  return (
    <div className="divide-y divide-slate-200">
      {/* Bloque A: Recepción Rápida & Control de Caja */}
      <section id="mostrador" className="scroll-mt-20 bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700">
              <Wallet className="h-3.5 w-3.5" /> Módulo Operativo 01
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Recepción Rápida &amp; Control de Caja
            </h2>
            <p className="mt-3 text-base text-slate-600">
              El personal de mostrador cobra pases diarios en segundos, registra venta de bebidas y
              justifica gastos menores sin que un solo peso quede flotando en el aire.
            </p>
            <ul className="mt-7 space-y-3.5">
              <CheckItem>
                <strong className="text-slate-900">Pases diarios y tiqueteras en 2 clics:</strong> cobra
                efectivo, transferencias o datáfono sin trabar la entrada al gym.
              </CheckItem>
              <CheckItem>
                <strong className="text-slate-900">Arqueo ciego en cambio de turno:</strong> cada
                recepcionista declara su dinero físico sin ver el saldo acumulado en pantalla.
              </CheckItem>
              <CheckItem>
                <strong className="text-slate-900">Tienda de suplementos exprés:</strong> multiplicadores
                táctiles para vender aguas, barras de proteína y sobres de pre-entreno.
              </CheckItem>
              <CheckItem>
                <strong className="text-slate-900">Gastos menores justificados:</strong> registra compras de
                bolsas de aseo, botellones o hielo al instante directo en el turno activo.
              </CheckItem>
            </ul>
          </div>

          {/* Mockup visual mostrador */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <ShoppingCart className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Venta Rápida de Mostrador</p>
                    <p className="text-xs text-slate-500">Cobro a un toque en recepción</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  Turno Abierto
                </span>
              </div>

              {/* Producto rápido */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                <div>
                  <p className="text-sm font-bold text-slate-900">Agua Mineral 600ml</p>
                  <p className="text-xs text-slate-500">$2.500 COP c/u</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                    <Minus className="h-3.5 w-3.5" />
                  </span>
                  <span className="w-6 text-center text-sm font-black text-slate-900">2</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                    +
                  </span>
                </div>
              </div>

              {/* Pase rápido */}
              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                <div>
                  <p className="text-sm font-bold text-slate-900">Pase Libre Día (Sala Musculación)</p>
                  <p className="text-xs text-slate-500">Acceso único sin suscripción mensual</p>
                </div>
                <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                  $15.000
                </span>
              </div>

              {/* Total y cobro */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50/70 p-3.5 border border-blue-100">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Total a cobrar
                </span>
                <span className="text-lg font-black text-blue-700">$20.000 COP</span>
              </div>
            </div>

            {/* Historial inmediato de caja */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Auditoría del Turno (En Vivo)
              </p>
              <ul className="mt-2.5 divide-y divide-slate-100 text-xs">
                <li className="flex items-center justify-between py-2">
                  <span>Pase del Día • Atleta Carlos R. (Efectivo)</span>
                  <span className="font-bold text-emerald-600">+$15.000</span>
                </li>
                <li className="flex items-center justify-between py-2">
                  <span>2x Agua Mineral + 1 Gatorade (Transferencia)</span>
                  <span className="font-bold text-emerald-600">+$11.000</span>
                </li>
                <li className="flex items-center justify-between py-2">
                  <span>Gasto Menor: 2 bolsas de hielo para barra (Caja)</span>
                  <span className="font-bold text-rose-600">-$6.000</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bloque B: Copiloto de Retención por WhatsApp */}
      <section id="retencion" className="scroll-mt-20 bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          {/* Mockup visual WhatsApp */}
          <div className="order-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:order-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Semáforo de Asistencia de Sala
              </p>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                320 Socios Activos
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-center">
                <span className="text-xl">🟢</span>
                <p className="mt-1 text-2xl font-black text-emerald-800">248</p>
                <p className="text-xs font-bold text-emerald-700">Saludables</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Entrenan semanal</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-center">
                <span className="text-xl">🟡</span>
                <p className="mt-1 text-2xl font-black text-amber-800">42</p>
                <p className="text-xs font-bold text-amber-700">En Riesgo</p>
                <p className="text-[10px] text-slate-500 mt-0.5">3-5 días ausentes</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-center">
                <span className="text-xl">🔴</span>
                <p className="mt-1 text-2xl font-black text-rose-800">14</p>
                <p className="text-xs font-bold text-rose-700">Críticos</p>
                <p className="text-[10px] text-slate-500 mt-0.5">+6 días sin ir</p>
              </div>
            </div>

            {/* Mensaje pre-redactado sin costo de API */}
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <MessageCircle className="h-3.5 w-3.5" /> Mensaje Pre-redactado Listo
                </span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Costo API: $0
                </span>
              </div>
              <div className="mt-2.5 rounded-lg border border-emerald-200/80 bg-white p-3 text-sm leading-relaxed text-slate-800 shadow-sm">
                “¡Hola Carlos! 💪 Notamos que llevas unos días sin pisar el gimnasio.
                Tu mensualidad vence en 2 días, ¿te guardamos tu cupo para tu rutina de musculación?”
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Abre directo en la app de WhatsApp del socio
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm">
                  <MessageCircle className="h-3.5 w-3.5" /> Contactar al Socio
                </span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700">
              <MessageCircle className="h-3.5 w-3.5" /> Módulo Operativo 02
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Copiloto de Retención por WhatsApp
            </h2>
            <p className="mt-3 text-base text-slate-600">
              El 70% de las bajas en un gimnasio ocurren porque el cliente pierde el hábito y nadie
              se toma 30 segundos para escribirle. SupraData automatiza la detección y te deja el
              mensaje listo para enviar.
            </p>
            <ul className="mt-7 space-y-3.5">
              <CheckItem>
                <strong className="text-slate-900">Detección de socios inactivos:</strong> alertas claras
                en pantalla con los días exactos que llevan sin pisar las instalaciones.
              </CheckItem>
              <CheckItem>
                <strong className="text-slate-900">Mensajes sin costo de API:</strong> enlaces wa.me que
                abren la conversación con el nombre y contexto del plan ya cargados.
              </CheckItem>
              <CheckItem>
                <strong className="text-slate-900">Revenue en Riesgo en pesos:</strong> conoce con exactitud
                cuánto dinero se perderá si los socios en semáforo rojo no renuevan.
              </CheckItem>
              <CheckItem>
                <strong className="text-slate-900">Filtro de llamadas prioritarias:</strong> tu equipo de
                recepción sabe exactamente a quién escribir en las horas valle de la tarde.
              </CheckItem>
            </ul>
          </div>
        </div>
      </section>

      {/* Bloque C: SupraPass & Monitoreo de Aforo */}
      <section id="suprapass" className="scroll-mt-20 bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700">
              <QrCode className="h-3.5 w-3.5" /> Módulo Operativo 03
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              SupraPass &amp; Monitoreo de Aforo
            </h2>
            <p className="mt-3 text-base text-slate-600">
              El socio escanea su QR personal al entrar y puede revisar desde su casa u oficina si
              el gimnasio está despejado o en hora pico antes de preparar su maletín.
            </p>
            <ul className="mt-7 space-y-3.5">
              <CheckItem>
                <strong className="text-slate-900">Carnet web sin descargar apps:</strong> enlace seguro
                accesible desde Safari o Chrome con el QR personal del socio.
              </CheckItem>
              <CheckItem>
                <strong className="text-slate-900">Semáforo de aforo en vivo:</strong> muestra si la sala
                está en nivel Bajo, Medio o Lleno para descongestionar horas pico.
              </CheckItem>
              <CheckItem>
                <strong className="text-slate-900">Validación de ingreso al instante:</strong> tu recepción
                o scanner verifica en milisegundos si la mensualidad está al día.
              </CheckItem>
              <CheckItem>
                <strong className="text-slate-900">Cero gasto en plástico:</strong> olvídate de cotizar,
                imprimir y reponer carnets físicos de PVC que terminan botados.
              </CheckItem>
            </ul>
          </div>

          {/* Infografía Smartphone SupraPass */}
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-10">
            <div className="w-full max-w-[290px] rounded-[2.2rem] border-4 border-slate-300 bg-white p-5 shadow-xl shadow-slate-900/10">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-black tracking-tight text-slate-900">
                  <Activity className="h-4 w-4 text-blue-600" /> SupraPass Web
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  Activo
                </span>
              </div>

              <div className="mt-3 text-center">
                <p className="text-[11px] font-semibold uppercase text-slate-400">Atleta Titán</p>
                <p className="text-base font-extrabold text-slate-900">Valentina Gómez</p>
                <p className="text-xs font-semibold text-blue-600">Plan Trimestral Funcional</p>
              </div>

              {/* QR decorativo ultra nítido */}
              <div className="mt-3 flex justify-center rounded-xl border border-slate-200 bg-white p-3">
                <div
                  aria-hidden
                  className="grid h-32 w-32 grid-cols-8 gap-[3px]"
                >
                  {Array.from({ length: 64 }).map((_, i) => {
                    const corner =
                      (i % 8 < 3 && Math.floor(i / 8) < 3) ||
                      (i % 8 > 4 && Math.floor(i / 8) < 3) ||
                      (i % 8 < 3 && Math.floor(i / 8) > 4);
                    const on = corner || (i * 7 + (i % 5)) % 3 !== 0;
                    return (
                      <span
                        key={i}
                        className={`rounded-[2px] ${on ? "bg-slate-900" : "bg-slate-100"}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Medidor de aforo de sala */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-500" /> Aforo Sala
                  </span>
                  <span className="text-emerald-700">46% de capacidad</span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <span className="h-2 flex-1 rounded-full bg-emerald-500" />
                  <span className="h-2 flex-1 rounded-full bg-slate-200" />
                  <span className="h-2 flex-1 rounded-full bg-slate-200" />
                </div>
                <p className="mt-2 text-center text-[11px] font-bold text-emerald-700">
                  🟢 Sala con máquinas disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function GymCalculator() {
  return (
    <section id="calculadora" className="scroll-mt-20 border-t border-slate-200 bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800">
            <TrendingUp className="h-3.5 w-3.5" /> Retorno de Inversión Inmediato
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Calculadora Gym: ¿Cuánto dinero pierde tu gimnasio cada mes?
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Mira el impacto financiero de recuperar a los socios antes de que dejen de venir a sala.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2 md:gap-8">
            {/* Escenario Típico */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5">
              <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                ❌ Sin Software Especializado (Excel / Memoria)
              </span>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Socios activos promedio:</span>
                  <span className="font-bold text-slate-900">250 socios</span>
                </div>
                <div className="flex justify-between">
                  <span>Mensualidad promedio del gym:</span>
                  <span className="font-bold text-slate-900">$90.000 COP</span>
                </div>
                <div className="flex justify-between">
                  <span>Deserción mensual sin seguimiento (30%):</span>
                  <span className="font-bold text-rose-600">75 socios desertan</span>
                </div>
              </div>
              <div className="mt-5 border-t border-rose-200 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Dinero que se fuga cada mes
                </p>
                <p className="mt-1 text-2xl font-black text-rose-600 sm:text-3xl">
                  -$6.750.000 COP
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Socios que se van sin que nadie les pregunte por qué dejaron de ir.
                </p>
              </div>
            </div>

            {/* Escenario con SupraData Gym */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                ✅ Con SupraData Gym (Retención Inteligente)
              </span>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Alertas tempranas de inasistencia:</span>
                  <span className="font-bold text-emerald-700">Día 5 de ausencia</span>
                </div>
                <div className="flex justify-between">
                  <span>Contacto oportuno por WhatsApp:</span>
                  <span className="font-bold text-emerald-700">1 clic por socio</span>
                </div>
                <div className="flex justify-between">
                  <span>Socios recuperados antes de vencer (40%):</span>
                  <span className="font-bold text-emerald-700">30 socios salvados</span>
                </div>
              </div>
              <div className="mt-5 border-t border-emerald-200 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ingreso mensual recuperado en caja
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-600 sm:text-3xl">
                  +$2.700.000 COP / mes
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Dinero directo a la cuenta de tu gimnasio que antes se perdía en silencio.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 text-center text-xs text-slate-500">
            * Cálculo estimado basado en la tasa promedio de deserción en gimnasios de barrio y centros de musculación.
          </div>
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700">
            <Scale className="h-3.5 w-3.5" /> Frente a Frente
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Excel o Software Genérico vs. SupraData Gym
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Los programas genéricos de punto de venta no entienden qué es una mensualidad vencida ni cómo
            evitar que un alumno deje de entrenar.
          </p>
        </div>

        {/* Móvil: tarjetas apiladas */}
        <div className="mt-10 space-y-4 md:hidden">
          {COMPARISON_ROWS.map((row) => (
            <div
              key={row.aspect}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <p className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900">
                {row.aspect}
              </p>
              <div className="space-y-3 p-4">
                <div className="flex items-start gap-2.5">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500 stroke-[3]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Excel / Software Genérico
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600">{row.legacy}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/70 p-3">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 stroke-[3]"
                  />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      SupraData Gym
                    </p>
                    <p className="text-sm font-bold leading-relaxed text-slate-900">
                      {row.supra}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tablet / Escritorio: tabla */}
        <div className="mt-12 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider">
                <th className="px-5 py-4 text-slate-500">Métrica del Gimnasio</th>
                <th className="px-5 py-4 text-slate-500">Excel / Genérico</th>
                <th className="bg-blue-50/80 px-5 py-4 text-blue-700">
                  <span className="inline-flex items-center gap-1.5 font-black">
                    <Dumbbell className="h-4 w-4" /> SupraData Gym
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.aspect} className="hover:bg-slate-50/40">
                  <td className="px-5 py-4 font-bold text-slate-900">{row.aspect}</td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="flex items-start gap-2">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500 stroke-[2.5]" />
                      <span>{row.legacy}</span>
                    </span>
                  </td>
                  <td className="bg-blue-50/30 px-5 py-4 text-slate-900">
                    <span className="flex items-start gap-2 font-medium">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 stroke-[3]" />
                      <span>{row.supra}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-6 py-12 text-center shadow-lg shadow-slate-900/5 sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-300/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-300/25 blur-3xl"
        />

        <div className="relative">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
            <Dumbbell className="h-6 w-6 stroke-[2.3]" />
          </span>

          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Convierte la recepción de tu gimnasio en una máquina de orden y retención.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
            Activa tu sede en 3 minutos. Abre tu primer turno con arqueo ciego, empieza a cobrar
            pases de sala y reactiva a los socios antes de que sea tarde.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg sm:w-auto"
            >
              Comenzar Gratis — Activar Mi Gimnasio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto"
            >
              Acceso Personal
            </Link>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 sm:text-sm">
            <Clock className="h-4 w-4 text-slate-400" /> Sin tarjeta de crédito requerida • Sin contratos de permanencia • Soporte dedicado en español
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Plataforma de gestión operativa, control de caja y retención de deportistas para
              gimnasios, salas de musculación y centros de entrenamiento funcional.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              <span>Multi-tenant seguro por NIT / Cédula</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Operación Gym
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#mostrador" className="hover:text-slate-900 transition-colors">
                    Mostrador &amp; Caja
                  </a>
                </li>
                <li>
                  <a href="#mostrador" className="hover:text-slate-900 transition-colors">
                    Arqueo Ciego
                  </a>
                </li>
                <li>
                  <a href="#mostrador" className="hover:text-slate-900 transition-colors">
                    Tienda de Bebidas
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Retención de Socios
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#retencion" className="hover:text-slate-900 transition-colors">
                    Alertas WhatsApp
                  </a>
                </li>
                <li>
                  <a href="#suprapass" className="hover:text-slate-900 transition-colors">
                    SupraPass QR Web
                  </a>
                </li>
                <li>
                  <a href="#calculadora" className="hover:text-slate-900 transition-colors">
                    Calculadora Gym
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Acceso Rápido
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/login" className="hover:text-slate-900 transition-colors">
                    Acceso Personal
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-slate-900 transition-colors">
                    Registrar Mi Gimnasio
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SupraData Gym SaaS. Especializado en centros deportivos y gimnasios.</p>
          <p>Operación segura • Auditoría inmutable de pagos • Sin costo de API de mensajería</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900 [color-scheme:light]">
      <Navbar />
      <main>
        <Hero />
        <MoneyLeaks />
        <OperativeModules />
        <GymCalculator />
        <Comparison />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
