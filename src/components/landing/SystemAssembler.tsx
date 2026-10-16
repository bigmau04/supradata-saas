'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Minus,
  LayoutDashboard,
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  ChevronRight,
  Wifi,
  ShieldCheck,
  Activity,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ── Sub-piezas de la UI (Tema Claro / Stripe Style) ────────────────────────

function SidebarPiece() {
  return (
    <div
      id="sd-sidebar"
      className="w-12 sm:w-40 shrink-0 rounded-xl border border-slate-200/80 bg-white p-2 sm:p-2.5 flex flex-col gap-1.5 shadow-xs"
      style={{ opacity: 0, transform: 'translateX(-40px)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-1 mb-1">
        <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0">
          <span className="text-[9px] font-black text-emerald-600">SD</span>
        </div>
        <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-900">
          SupraData
        </span>
      </div>

      {/* Nav items */}
      {[
        { icon: LayoutDashboard, label: 'Resumen', active: false },
        { icon: Activity, label: 'Recepción', active: true },
        { icon: Users, label: 'Miembros', active: false },
        { icon: DollarSign, label: 'Finanzas', active: false },
        { icon: Building2, label: 'Sedes', active: false },
        { icon: ShieldCheck, label: 'Accesos', active: false },
      ].map(({ icon: Icon, label, active }) => (
        <div
          key={label}
          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${
            active
              ? 'bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline-block text-[10px] font-medium">{label}</span>
          {active && <ChevronRight className="hidden sm:inline-block h-3 w-3 ml-auto text-emerald-600" />}
        </div>
      ))}

      {/* Sede status badge at bottom */}
      <div className="mt-auto pt-2 border-t border-slate-100">
        <div className="hidden sm:flex items-center gap-1.5 px-1">
          <Wifi className="h-2.5 w-2.5 text-emerald-600" />
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md px-1.5 py-0.5 text-[9px] font-semibold tracking-wider font-mono">
            [ EN LÍNEA ]
          </span>
        </div>
        <div className="sm:hidden flex justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SelectorSedesPiece() {
  return (
    <div
      id="sd-sedes"
      className="rounded-xl border border-slate-200/80 bg-white p-2.5 sm:px-3.5 sm:py-2 flex items-center justify-between gap-2 shadow-xs"
      style={{ opacity: 0, transform: 'translateY(-30px)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
          <Building2 className="h-3.5 w-3.5 text-emerald-600" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider truncate">
            Sede activa
          </span>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-900 truncate">
            Sede Centro — Turno A
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <div className="hidden sm:flex gap-1">
          {['Centro', 'Norte', 'Sur'].map((s, i) => (
            <span
              key={s}
              className={`text-[9px] font-mono px-2 py-0.5 rounded-md border cursor-pointer ${
                i === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
              }`}
            >
              {s}
            </span>
          ))}
        </div>
        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md px-2 py-1 text-[10px] font-semibold tracking-wider font-mono">
          [ SIN DISCREPANCIA ]
        </span>
      </div>
    </div>
  );
}

function FinanceCardsPiece() {
  const cards = [
    {
      id: 'sd-finance-0',
      label: 'Recaudo Hoy',
      value: '$ 4.820.000',
      badge: '[ SIN DISCREPANCIA ]',
      badgeType: 'emerald',
      icon: DollarSign,
    },
    {
      id: 'sd-finance-1',
      label: 'Aforo Actual',
      value: '47 / 80',
      badge: '[ EN LÍNEA ]',
      badgeType: 'emerald',
      icon: Activity,
    },
    {
      id: 'sd-finance-2',
      label: 'Retención Clientes',
      value: '$ 0',
      badge: '[ GESTIÓN WHATSAPP ]',
      badgeType: 'blue',
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
      {cards.map((card) => (
        <div
          key={card.id}
          id={card.id}
          className="bg-white border border-slate-100 shadow-sm rounded-xl p-2.5 sm:p-3 flex flex-col gap-1"
          style={{ opacity: 0, transform: 'translateY(30px) scale(0.96)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
              {card.label}
            </span>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center ${
                card.badgeType === 'emerald'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-blue-50 text-blue-500'
              }`}
            >
              <card.icon className="h-3 w-3" />
            </div>
          </div>
          <span className="text-sm sm:text-base font-bold text-emerald-600">
            {card.value}
          </span>
          <div>
            <span
              className={
                card.badgeType === 'emerald'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md px-2 py-1 text-[10px] font-semibold tracking-wider inline-block font-mono'
                  : 'bg-blue-50 text-blue-500 border border-blue-100 rounded-md px-2 py-1 text-[10px] font-semibold tracking-wider inline-block font-mono'
              }
            >
              {card.badge}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberTablePiece() {
  const rows = [
    {
      name: 'Camila Restrepo',
      plan: 'Elite',
      status: '[ SIN DISCREPANCIA ]',
      badgeType: 'emerald',
      access: '07:34',
    },
    {
      name: 'Andrés Muñoz',
      plan: 'Básico',
      status: '[ EN LÍNEA ]',
      badgeType: 'emerald',
      access: '08:15',
    },
    {
      name: 'Daniel Cárdenas',
      plan: 'Mensual',
      status: '[ GESTIÓN WHATSAPP ]',
      badgeType: 'blue',
      access: '08:50',
    },
  ];

  return (
    <div
      id="sd-table"
      className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col"
      style={{ opacity: 0, transform: 'scale(0.98)' }}
    >
      {/* Table header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-[10px] font-mono font-semibold text-slate-800 uppercase tracking-wider">
            Miembros en Mostrador
          </span>
        </div>
        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md px-2 py-1 text-[10px] font-semibold tracking-wider font-mono">
          [ EN LÍNEA ]
        </span>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-4 px-3 sm:px-4 py-1.5 border-b border-slate-100 bg-slate-50/30 text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-slate-400">
        <span>Miembro</span>
        <span>Plan</span>
        <span>Estado</span>
        <span className="text-right">Acceso</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-4 items-center px-3 sm:px-4 py-2 hover:bg-slate-50/60 transition-colors"
          >
            <span className="text-[10px] font-medium text-slate-800 truncate">{row.name}</span>
            <span className="text-[9px] font-mono text-slate-500">{row.plan}</span>
            <div>
              <span
                className={
                  row.badgeType === 'emerald'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md px-1.5 py-0.5 text-[8px] sm:text-[9px] font-semibold tracking-wider font-mono inline-block'
                    : 'bg-blue-50 text-blue-500 border border-blue-100 rounded-md px-1.5 py-0.5 text-[8px] sm:text-[9px] font-semibold tracking-wider font-mono inline-block'
                }
              >
                {row.status}
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 text-right">{row.access}</span>
          </div>
        ))}
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-slate-50/40 border-t border-slate-100 text-[8px] sm:text-[9px] font-mono text-slate-400">
        <span>Total: 247 miembros registrados</span>
        <div className="flex items-center gap-1 text-emerald-600 font-semibold">
          <TrendingUp className="h-2.5 w-2.5" />
          <span>99.8% conciliado</span>
        </div>
      </div>
    </div>
  );
}

// ── Texto lateral sincronizado ────────────────────────────────────────────

const TEXT_PHASES = [
  {
    id: 'txt-0',
    eyebrow: 'INTERFAZ UNIFICADA',
    title: 'Gestión\nCentralizada',
    desc: 'Navega entre sedes, módulos y turnos desde un único panel sin recargar la página.',
  },
  {
    id: 'txt-1',
    eyebrow: 'DATOS EN TIEMPO REAL',
    title: 'Finanzas en\nTiempo Real',
    desc: 'Recaudo, aforo y gastos del turno actualizados al instante. Sin F5, sin esperas.',
  },
  {
    id: 'txt-2',
    eyebrow: 'ACCESO BIOMÉTRICO',
    title: 'Control de\nAcceso Total',
    desc: 'Registro de entrada y miembros activos con estado de membresía al segundo.',
  },
];

// ── Componente Principal ──────────────────────────────────────────────────

export function SystemAssembler() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !pinRef.current) return;

    const ctx = gsap.context(() => {
      // ── Timeline principal atada al scroll ────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: pinRef.current,
          start: 'top top',
          end: '+=280%',
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // ─── Texto: Fase 1 visible desde el inicio ─────────────────────
      gsap.set(['#txt-1', '#txt-2'], { opacity: 0, y: 16 });

      // ─── FASE 2 (1er tercio): sidebar + selector de sedes ─────────
      tl
        // Barra lateral entra desde la izquierda
        .to(
          '#sd-sidebar',
          { opacity: 1, x: 0, duration: 1, ease: 'expo.out' },
          0
        )
        // Selector de sedes entra desde arriba
        .to(
          '#sd-sedes',
          { opacity: 1, y: 0, duration: 1, ease: 'expo.out' },
          0.3
        )
        // Texto 0 → 1
        .to('#txt-0', { opacity: 0, y: -16, duration: 0.6 }, 0.8)
        .to('#txt-1', { opacity: 1, y: 0, duration: 0.6 }, 0.9)

        // ─── FASE 3 (2do tercio): tarjetas de finanzas ───────────────
        .to(
          ['#sd-finance-0', '#sd-finance-1', '#sd-finance-2'],
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.4)',
          },
          1.6
        )
        // Texto 1 → 2
        .to('#txt-1', { opacity: 0, y: -16, duration: 0.6 }, 2.4)
        .to('#txt-2', { opacity: 1, y: 0, duration: 0.6 }, 2.5)

        // ─── FASE 4 (Final): tabla de miembros ───────────────────────
        .to(
          '#sd-table',
          { opacity: 1, scale: 1, duration: 1, ease: 'power2.inOut' },
          3.0
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="assembler"
      className="scroll-mt-16 relative bg-white border-t border-slate-100"
    >
      {/* ── Contenedor que se fija con pin (Light Theme) ─────────────── */}
      <div
        ref={pinRef}
        className="relative w-full h-screen min-h-[640px] max-h-[1000px] flex items-center justify-center overflow-hidden bg-slate-50/50"
      >
        {/* Orbes sutiles de fondo (estilo Stripe claro) */}
        <div className="absolute top-[-100px] right-[-80px] w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-80px] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[140px] pointer-events-none" />

        {/* Patrón de puntos tenue */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(203, 213, 225, 0.45) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* ── Layout interior (Mobile First: flex-col, lg:grid lg:grid-cols-12) ── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:grid lg:grid-cols-12 items-center gap-8 lg:gap-12 h-full justify-center">

          {/* ── Panel de texto sincronizado (lado izquierdo) ─────────── */}
          <div className="w-full lg:col-span-5 flex flex-col justify-center relative min-h-[180px] sm:min-h-[220px] lg:min-h-[300px]">
            {/* Eyebrow badge */}
            <div className="mb-4 sm:mb-6">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-2.5 py-1">
                [ ARQUITECTURA SupraData ]
              </span>
            </div>

            {/* Textos sincronizados superpuestos */}
            <div className="relative h-[160px] sm:h-[180px]">
              {TEXT_PHASES.map(({ id, eyebrow, title, desc }, i) => (
                <div
                  key={id}
                  id={id}
                  className="absolute inset-0 flex flex-col justify-start"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <p className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-500 mb-2">
                    {eyebrow}
                  </p>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1] whitespace-pre-line mb-3">
                    {title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md">
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Barra de progreso de fases */}
            <div className="flex gap-2 mt-4 sm:mt-6">
              <div className="w-8 h-1 bg-emerald-500 rounded-full" />
              <div className="w-8 h-1 bg-slate-200 rounded-full" />
              <div className="w-8 h-1 bg-slate-200 rounded-full" />
            </div>
          </div>

          {/* ── Mockup de la UI (BrowserFrame - lado derecho) ─────────── */}
          <div className="w-full lg:col-span-7 flex justify-center items-center">
            <div className="w-full max-w-[800px] bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">

              {/* Barra superior del navegador */}
              <div className="bg-slate-50 border-b border-slate-100 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" />
                </div>

                {/* URL Bar */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white rounded-md border border-slate-200 text-[10px] font-mono text-slate-500 shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>app.supradata.co/dashboard/recepcion</span>
                </div>

                {/* Botón Minimizar */}
                <button
                  type="button"
                  className="bg-white border border-slate-300 text-slate-700 shadow-sm rounded-md px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 hover:bg-slate-50 transition-colors"
                >
                  <Minus className="w-2.5 h-2.5" />
                  <span>Minimizar</span>
                </button>
              </div>

              {/* Canvas del sistema que se ensambla */}
              <div className="p-2 sm:p-3 bg-slate-50/50 flex gap-2 sm:gap-3">
                {/* 1. Barra Lateral */}
                <SidebarPiece />

                {/* 2. Área principal */}
                <div className="flex-1 flex flex-col gap-2 sm:gap-3 min-w-0">
                  {/* Selector de sedes */}
                  <SelectorSedesPiece />

                  {/* Tabla de Miembros en Mostrador */}
                  <MemberTablePiece />

                  {/* Tarjetas Financieras */}
                  <FinanceCardsPiece />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none">
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
            Desplaza para ensamblar
          </span>
          <div className="w-px h-5 bg-gradient-to-b from-slate-300 to-transparent" />
        </div>
      </div>
    </section>
  );
}

export default SystemAssembler;
