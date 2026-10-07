import type { Metadata } from "next";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import {
  Activity,
  ArrowRight,
  Banknote,
  Check,
  Clock,
  Dumbbell,
  Eye,
  HeartPulse,
  Lock,
  MessageCircle,
  Minus,
  QrCode,
  Receipt,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  TrendingDown,
  TriangleAlert,
  UserX,
  Users,
  X,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SupraData | Copiloto Financiero y de Retención para Gimnasios",
  description:
    "Controla el dinero de tu mostrador con arqueo ciego y recupera a los socios antes de que abandonen con alertas de inasistencia y contacto directo por WhatsApp.",
};

const NAV_LINKS = [
  { href: "#mostrador", label: "Mostrador & Caja" },
  { href: "#retencion", label: "Retención de Socios" },
  { href: "#suprapass", label: "SupraPass" },
  { href: "#beneficios", label: "Beneficios" },
];

const PAINS = [
  {
    icon: Banknote,
    tone: "rose",
    title: "La fuga de dinero en mostrador",
    pain: "Dinero que no cuadra al final del día, bebidas entregadas sin cobrar y gastos menores sin control.",
    solution:
      "Turnos cerrados con base inicial, arqueo ciego y registro inmediato de gastos.",
  },
  {
    icon: UserX,
    tone: "amber",
    title: "El 40% de socios que no vuelven",
    pain: "Clientes que dejan de asistir dos semanas antes de que venza su plan y nadie les escribe a tiempo.",
    solution:
      "Semáforo proactivo de inasistencia y cálculo de ingresos recuperables.",
  },
  {
    icon: Smartphone,
    tone: "blue",
    title: "Filas lentas en la entrada",
    pain: "Pagar licencias costosas de apps nativas que los clientes nunca descargan.",
    solution:
      "SupraPass, carnet web público con QR y aforo en vivo accesible desde cualquier celular.",
  },
] as const;

const TONES = {
  rose: "bg-rose-50 text-rose-500 ring-rose-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
} as const;

const COMPARISON: { feature: string; legacy: string; supra: string }[] = [
  {
    feature: "Enfoque del sistema",
    legacy: "Registro pasivo: guarda datos que nadie revisa.",
    supra: "Copiloto activo: te dice a quién llamar y qué dinero falta.",
  },
  {
    feature: "Cierre de caja",
    legacy: "Se digita el total y se asume que está bien.",
    supra: "Arqueo ciego con base inicial y alerta de descuadres.",
  },
  {
    feature: "Retención de socios",
    legacy: "Reportes de vencidos cuando el socio ya se fue.",
    supra: "Semáforo 🟢🟡🔴 y “Revenue en Riesgo” en pesos.",
  },
  {
    feature: "Contacto con el socio",
    legacy: "Integraciones de mensajería con costo por API.",
    supra: "Enlace directo a WhatsApp (wa.me) con mensaje listo, $0 de API.",
  },
  {
    feature: "Carnet / acceso",
    legacy: "App nativa que nadie descarga.",
    supra: "SupraPass web con QR y aforo en vivo, sin instalar nada.",
  },
  {
    feature: "Contratos",
    legacy: "Permanencia forzosa y costos de implementación.",
    supra: "Sin contratos forzosos. Listo para operar en 3 minutos.",
  },
];

const BENEFITS = [
  {
    icon: Lock,
    title: "Multi-tenant seguro",
    text: "Cada gimnasio queda aislado por su NIT o Cédula. Tus datos nunca se mezclan con los de otros.",
  },
  {
    icon: Users,
    title: "Roles Admin y Recepción",
    text: "El personal de mostrador opera; solo el administrador ve finanzas, anula pagos y gestiona el equipo.",
  },
  {
    icon: ShieldCheck,
    title: "Pagos inmutables",
    text: "Nada se borra: las anulaciones quedan registradas con motivo, responsable y fecha.",
  },
  {
    icon: Zap,
    title: "Operativo en 3 minutos",
    text: "Registra tu gimnasio, crea tus planes y empieza a cobrar. Sin instalaciones ni capacitación larga.",
  },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="SupraData inicio">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
        <Dumbbell className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        Supra<span className="text-blue-600">Data</span>
      </span>
    </Link>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-md sm:inline-flex"
          >
            Crear Gimnasio Gratis
          </Link>

          <MobileMenu links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto mt-14 w-full max-w-4xl sm:mt-16">
      {/* Resplandor sutil */}
      <div
        aria-hidden
        className="absolute -inset-x-6 -inset-y-6 -z-10 rounded-[2rem] bg-gradient-to-b from-blue-100/60 via-slate-100/60 to-transparent blur-2xl"
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
        {/* Barra superior de estado */}
        <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            </span>
            <span className="ml-2 text-sm font-semibold text-slate-800">
              Sede Principal
            </span>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold leading-snug text-emerald-700 sm:self-auto sm:text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Turno de Caja Activo: $148.500 esperado
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Métrica destacada */}
          <div className="flex flex-col gap-4 rounded-xl border border-rose-100 bg-rose-50/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Revenue proyectado
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                <TrendingDown className="h-6 w-6 shrink-0 text-rose-500 sm:h-7 sm:w-7" />
                $1.450.000
                <span className="text-sm font-semibold text-rose-500 sm:text-base">
                  en Riesgo
                </span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-rose-200 bg-rose-100/70 px-3 py-1.5 text-xs font-semibold text-rose-600 sm:self-auto">
              <TriangleAlert className="h-3.5 w-3.5" />
              14 socios sin asistir hace más de 5 días
            </span>
          </div>

          {/* Mini tabla de retención */}
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
            <div className="hidden grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid">
              <span className="col-span-3">Socio</span>
              <span className="col-span-2">Vencimiento</span>
              <span className="col-span-2">Asistencia</span>
              <span className="col-span-2">Estado</span>
              <span className="col-span-3 text-right">Acción</span>
            </div>

            {[
              {
                name: "Carlos Mendoza",
                due: "Vence en 2 días",
                att: "Sin asistir hace 8 días",
                badge: "🔴 Crítico",
                badgeCls: "border-rose-200 bg-rose-50 text-rose-600",
                cta: "Recuperar por WhatsApp",
              },
              {
                name: "Valentina Gómez",
                due: "Vence en 5 días",
                att: "Asistencia regular",
                badge: "🟡 En Riesgo",
                badgeCls: "border-amber-200 bg-amber-50 text-amber-700",
                cta: "Recordar Renovación",
              },
            ].map((r, i) => (
              <div
                key={r.name}
                className={`grid grid-cols-1 items-center gap-2 px-4 py-3.5 md:grid-cols-12 md:gap-3 ${
                  i === 0 ? "" : "border-t border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3 md:col-span-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {r.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {r.name}
                  </span>
                </div>
                <span className="text-sm text-slate-600 md:col-span-2">
                  {r.due}
                </span>
                <span className="text-sm text-slate-600 md:col-span-2">
                  {r.att}
                </span>
                <span className="md:col-span-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${r.badgeCls}`}
                  >
                    {r.badge}
                  </span>
                </span>
                <span className="md:col-span-3 md:text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {r.cta}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-slate-50 pb-14 pt-12 sm:pb-28 sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(37,99,235,0.08),transparent)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 sm:text-sm">
            ⚡ Copiloto Operativo &amp; Financiero para Gimnasios
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Controla el dinero de tu mostrador y{" "}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              recupera a los socios
            </span>{" "}
            antes de que abandonen.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Auditoría de caja con arqueo ciego, venta de mostrador en 2 clics y
            alertas inteligentes de inasistencia con contacto directo por
            WhatsApp. Sin apps pesadas ni contratos forzosos.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg sm:w-auto sm:text-base"
            >
              Comenzar Gratis — Registrar Gimnasio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto sm:text-base"
            >
              Ver Acceso al Sistema
            </Link>
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            ✓ Listo para operar en 3 minutos • Multi-sede • Seguro
          </p>
        </div>

        <DashboardMockup />
      </div>
    </section>
  );
}

function Pains() {
  return (
    <section className="bg-slate-50 py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Los problemas reales del dueño
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tres fugas que te cuestan dinero cada mes
          </h2>
          <p className="mt-4 text-slate-600">
            No necesitas más reportes. Necesitas un sistema que te avise a
            tiempo y cierre cada hueco.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PAINS.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${TONES[p.tone]}`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {p.title}
                </h3>

                <div className="mt-4 rounded-lg bg-rose-50/60 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                    El dolor
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {p.pain}
                  </p>
                </div>

                <div className="mt-3 rounded-lg bg-emerald-50/70 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    La solución
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {p.solution}
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

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-slate-700">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
      <span className="text-sm leading-relaxed sm:text-base">{children}</span>
    </li>
  );
}

function FeatureCash() {
  return (
    <section id="mostrador" className="scroll-mt-20 bg-white py-14 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Receipt className="h-3.5 w-3.5" /> Mostrador &amp; Caja
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Blindaje total de tu caja y tu mostrador
          </h2>
          <p className="mt-4 text-slate-600">
            Cada peso queda registrado desde la apertura hasta el cierre. Tu
            recepción vende rápido y tú ves un flujo de caja transparente.
          </p>
          <ul className="mt-7 space-y-3.5">
            <Bullet>
              <strong className="text-slate-900">Apertura con base inicial</strong>{" "}
              y turnos cerrados por recepcionista.
            </Bullet>
            <Bullet>
              <strong className="text-slate-900">Arqueo ciego:</strong> el
              cajero cuenta sin ver el esperado y el sistema detecta descuadres.
            </Bullet>
            <Bullet>
              <strong className="text-slate-900">Tienda rápida</strong> con
              multiplicador: “2x Agua Cristal” en dos clics.
            </Bullet>
            <Bullet>
              <strong className="text-slate-900">Gastos menores</strong>{" "}
              registrados al instante, sin dinero que “desaparece”.
            </Bullet>
          </ul>
        </div>

        {/* Infografía caja */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                Tienda Rápida
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Turno activo
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Agua Cristal</p>
                <p className="text-xs text-slate-500">$2.500 c/u</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
                  <Minus className="h-4 w-4" />
                </span>
                <span className="w-6 text-center text-sm font-bold text-slate-900">
                  2
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Zap className="h-4 w-4" />
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-900/[0.03] px-3 py-2.5 text-sm">
              <span className="text-slate-600">Total venta</span>
              <span className="font-bold text-slate-900">$5.000</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Movimientos del turno
            </p>
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {[
                { t: "05:30 PM", c: "Pase Exprés", m: "Efectivo", v: "+$15.000", pos: true },
                { t: "05:12 PM", c: "Venta: 2x Agua Cristal", m: "Transferencia", v: "+$5.000", pos: true },
                { t: "04:48 PM", c: "Gasto: Bolsas de aseo", m: "Efectivo", v: "-$8.000", pos: false },
              ].map((r) => (
                <li key={r.t} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{r.c}</p>
                    <p className="text-xs text-slate-500">
                      {r.t} ·{" "}
                      <span
                        className={
                          r.m === "Efectivo" ? "text-emerald-600" : "text-blue-600"
                        }
                      >
                        {r.m}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-bold ${
                      r.pos ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {r.v}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureRetention() {
  return (
    <section id="retencion" className="scroll-mt-20 bg-slate-50 py-14 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Infografía retención */}
        <div className="order-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Semáforo de retención
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { l: "Saludables", n: "182", i: "🟢", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
              { l: "En Riesgo", n: "31", i: "🟡", cls: "border-amber-200 bg-amber-50 text-amber-700" },
              { l: "Críticos", n: "14", i: "🔴", cls: "border-rose-200 bg-rose-50 text-rose-600" },
            ].map((s) => (
              <div key={s.l} className={`rounded-xl border p-3 text-center sm:p-4 ${s.cls}`}>
                <p className="text-xl">{s.i}</p>
                <p className="mt-1 text-2xl font-extrabold">{s.n}</p>
                <p className="text-xs font-semibold">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Ingreso recuperable</span>
            <span className="text-lg font-extrabold text-emerald-600">
              $1.450.000
            </span>
          </div>

          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <MessageCircle className="h-3.5 w-3.5" /> Mensaje pre-redactado
            </p>
            <p className="mt-2 rounded-lg border border-emerald-100 bg-white p-3 text-sm leading-relaxed text-slate-700">
              “Hola Carlos 👋 te extrañamos en el gym. Tu plan vence en 2 días,
              ¿quieres que te guardemos tu cupo? 💪”
            </p>
            <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
            </span>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <HeartPulse className="h-3.5 w-3.5" /> Retención de Socios
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Un motor de retención que escribe por ti, a un clic
          </h2>
          <p className="mt-4 text-slate-600">
            SupraData detecta quién está dejando de venir y te entrega el
            mensaje listo para enviar por WhatsApp. Sin pagar APIs ni
            integraciones.
          </p>
          <ul className="mt-7 space-y-3.5">
            <Bullet>
              <strong className="text-slate-900">Detección automática</strong>{" "}
              🟢 Saludable, 🟡 En Riesgo y 🔴 Crítico según asistencia y
              vencimiento.
            </Bullet>
            <Bullet>
              <strong className="text-slate-900">Revenue en Riesgo:</strong>{" "}
              cuántos pesos puedes perder si nadie actúa.
            </Bullet>
            <Bullet>
              <strong className="text-slate-900">Enlaces wa.me directos</strong>{" "}
              con mensaje personalizado: costo de API $0.
            </Bullet>
            <Bullet>
              <strong className="text-slate-900">Filtros por estado</strong>{" "}
              para atacar primero a los socios críticos.
            </Bullet>
          </ul>
        </div>
      </div>
    </section>
  );
}

function FeaturePass() {
  const gate = [
    { label: "Aforo bajo", cls: "bg-emerald-500" },
    { label: "Aforo medio", cls: "bg-amber-400" },
    { label: "Aforo lleno", cls: "bg-rose-500" },
  ];
  return (
    <section id="suprapass" className="scroll-mt-20 bg-white py-14 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <QrCode className="h-3.5 w-3.5" /> SupraPass
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Carnet digital con QR, sin instalar ninguna app
          </h2>
          <p className="mt-4 text-slate-600">
            Cada socio recibe un enlace público y único. Lo abre desde
            cualquier celular, muestra su QR y consulta el aforo antes de
            salir de casa.
          </p>
          <ul className="mt-7 space-y-3.5">
            <Bullet>
              <strong className="text-slate-900">Enlace por token</strong> en{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-800">
                /pass/[token]
              </code>
              , sin registro ni descargas.
            </Bullet>
            <Bullet>
              <strong className="text-slate-900">Código QR</strong> para
              validar el ingreso en segundos.
            </Bullet>
            <Bullet>
              <strong className="text-slate-900">Semáforo de aforo en vivo</strong>{" "}
              para que tus socios elijan la mejor hora.
            </Bullet>
            <Bullet>
              <strong className="text-slate-900">Cero licencias</strong> de
              apps nativas que nadie usa.
            </Bullet>
          </ul>
        </div>

        {/* Infografía SupraPass */}
        <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-10">
          <div className="w-full max-w-[280px] rounded-[2rem] border-4 border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/10">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Activity className="h-4 w-4 text-blue-600" /> SupraPass
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                Activo
              </span>
            </div>
            <p className="mt-4 text-xs text-slate-500">Socio</p>
            <p className="text-base font-bold text-slate-900">Valentina Gómez</p>

            <div className="mt-4 flex justify-center rounded-xl border border-slate-200 bg-white p-4">
              {/* QR decorativo con CSS (sin dependencias) */}
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

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Users className="h-3.5 w-3.5" /> Aforo en vivo
              </p>
              <div className="mt-2 flex items-center gap-2">
                {gate.map((g, i) => (
                  <span
                    key={g.label}
                    className={`h-2.5 flex-1 rounded-full ${g.cls} ${
                      i === 0 ? "" : "opacity-25"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs font-semibold text-emerald-600">
                🟢 Aforo bajo — ideal para entrenar
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  return (
    <section className="bg-slate-50 py-14 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Comparativa
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Software Tradicional vs. SupraData
          </h2>
          <p className="mt-4 text-slate-600">
            La diferencia entre guardar datos y proteger tu negocio.
          </p>
        </div>

        {/* Móvil: tarjetas apiladas */}
        <div className="mt-10 space-y-4 md:hidden">
          {COMPARISON.map((r) => (
            <div
              key={r.feature}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <p className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900">
                {r.feature}
              </p>
              <div className="space-y-3 p-4">
                <div className="flex items-start gap-2.5">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Tradicional
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600">{r.legacy}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/60 p-3">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    strokeWidth={3}
                  />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                      SupraData
                    </p>
                    <p className="text-sm font-medium leading-relaxed text-slate-800">
                      {r.supra}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tablet/escritorio: tabla */}
        <div className="mt-12 hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm">
                <th className="px-5 py-4 font-semibold text-slate-500">
                  Aspecto
                </th>
                <th className="px-5 py-4 font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-400" /> Software
                    tradicional
                  </span>
                </th>
                <th className="bg-blue-50/60 px-5 py-4 font-semibold text-blue-700">
                  <span className="inline-flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" /> SupraData
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {COMPARISON.map((r, i) => (
                <tr
                  key={r.feature}
                  className={i === COMPARISON.length - 1 ? "" : "border-b border-slate-100"}
                >
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {r.feature}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="flex items-start gap-2">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                      {r.legacy}
                    </span>
                  </td>
                  <td className="bg-blue-50/30 px-5 py-4 text-slate-800">
                    <span className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                        strokeWidth={3}
                      />
                      {r.supra}
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

function Benefits() {
  return (
    <section id="beneficios" className="scroll-mt-20 bg-white py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Beneficios
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Hecho para que el dueño duerma tranquilo
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {b.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-white px-4 pb-14 sm:px-6 sm:pb-24 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-5 py-12 text-center shadow-md shadow-slate-900/5 sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl"
        />
        <div className="relative">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
            <Scale className="h-6 w-6" />
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Pon tu gimnasio en orden financiero hoy mismo.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Registra tu gimnasio en minutos, abre tu primer turno de caja y
            empieza a recuperar socios esta misma semana.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg sm:w-auto"
            >
              Crear Gimnasio Gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto"
            >
              Ya tengo cuenta
            </Link>
          </div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-sm text-slate-500">
            <Clock className="h-4 w-4" /> Sin tarjeta de crédito • Sin contratos
            forzosos
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              El copiloto financiero y de retención para gimnasios.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Producto</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><a href="#mostrador" className="hover:text-slate-900">Mostrador &amp; Caja</a></li>
                <li><a href="#retencion" className="hover:text-slate-900">Retención</a></li>
                <li><a href="#suprapass" className="hover:text-slate-900">SupraPass</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Cuenta</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link href="/login" className="hover:text-slate-900">Iniciar Sesión</Link></li>
                <li><Link href="/register" className="hover:text-slate-900">Crear Gimnasio</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Legal</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><a href="#beneficios" className="hover:text-slate-900">Aviso de Privacidad</a></li>
                <li><a href="#beneficios" className="hover:text-slate-900">Beneficios</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SupraData. Todos los derechos reservados.</p>
          <p>
            Tus datos se tratan de forma confidencial y aislada por gimnasio
            (NIT/Cédula).
          </p>
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
        <Pains />
        <FeatureCash />
        <FeatureRetention />
        <FeaturePass />
        <Comparison />
        <Benefits />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
