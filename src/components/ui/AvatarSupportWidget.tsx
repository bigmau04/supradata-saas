'use client';

import { useState, useEffect, useRef } from 'react';
import { StreamingAvatar } from '@heygen/hyperframes-core';
import { Bot, Sparkles } from 'lucide-react';

export default function AvatarSupportWidget() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Inicializa la conexión con el motor de IA cuando se abre el widget
  useEffect(() => {
    let isCancelled = false;

    if (!isActive) {
      return;
    }

    // 3. Fallback visual: si tras 3 segundos el video no está reproduciendo, activar fallback
    const fallbackTimer = setTimeout(() => {
      if (!isCancelled) {
        if (!videoRef.current || videoRef.current.readyState < 2 || videoRef.current.paused) {
          setHasVideoError(true);
        }
      }
    }, 3000);

    const initAvatar = async () => {
      setIsLoading(true);
      const avatar = new StreamingAvatar({
        apiKey: process.env.NEXT_PUBLIC_HEYGEN_API_KEY,
      });

      // 1. FUERZA EL RENDER DEL VIDEO: listener robusto con onloadedmetadata
      avatar.on('stream', (stream) => {
        if (videoRef.current && !isCancelled) {
          videoRef.current.srcObject = stream as MediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              ?.play()
              .then(() => {
                if (!isCancelled) {
                  setHasVideoError(false);
                }
              })
              .catch((e) => {
                console.error('Error reproduciendo video:', e);
                if (!isCancelled) {
                  setHasVideoError(true);
                }
              });
          };
        }
      });

      await avatar.createStartAvatar({
        avatarName: 'josh_lite3', // ID del avatar predeterminado
        quality: 'low',
      });

      if (!isCancelled) {
        avatarRef.current = avatar;
        setIsLoading(false);
      }
    };

    if (!avatarRef.current) {
      initAvatar();
    }

    return () => {
      isCancelled = true;
      clearTimeout(fallbackTimer);
      avatarRef.current?.stopAvatar();
      avatarRef.current = null;
    };
  }, [isActive]);

  const speak = async (text: string) => {
    if (avatarRef.current) {
      await avatarRef.current.speak({ text });
    }
  };

  // Estado minimizado (Botón flotante)
  if (!isActive) {
    return (
      <button
        onClick={() => {
          setIsActive(true);
          setHasVideoError(false);
        }}
        className="fixed bottom-6 right-6 bg-slate-900 text-emerald-400 px-5 py-3 rounded-full shadow-lg border border-emerald-500/30 hover:bg-slate-800 transition-colors font-medium tabular-nums z-50 cursor-pointer"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
        Soporte IA
      </button>
    );
  }

  // Estado maximizado (Widget Glassmorphism)
  return (
    <div className="fixed bottom-6 right-6 w-80 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col z-50">
      {/* Contenedor del Avatar en Video */}
      <div
        className={`h-64 w-full relative flex items-center justify-center overflow-hidden transition-colors duration-500 ${
          hasVideoError
            ? 'bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900'
            : 'bg-slate-950'
        }`}
      >
        {isLoading && !hasVideoError && (
          <div className="text-emerald-500 animate-pulse text-sm z-10">Conectando avatar...</div>
        )}

        {/* 3. MANEJO DE ERRORES: Fallback visual degradado esmeralda con inicial si no carga tras 3s */}
        {hasVideoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
            <div className="relative mb-3 flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
              <div className="w-16 h-16 rounded-full border-2 border-emerald-400/60 bg-emerald-950/80 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.4)] relative">
                <span className="text-2xl font-bold bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                  S
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 tracking-wide">
              <Bot className="h-3.5 w-3.5 text-emerald-400" />
              <span>SupraIA Asistente</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[210px] leading-relaxed">
              Audio interactivo habilitado • Respuestas operativas listas
            </p>
          </div>
        )}

        {/* 2. PROPIEDADES DEL DOM */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          className="w-full h-full object-cover absolute top-0 left-0"
        />

        <button
          onClick={() => {
            setIsActive(false);
            setHasVideoError(false);
          }}
          className="absolute top-3 right-3 text-white/50 hover:text-white bg-black/40 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center transition-colors z-20 cursor-pointer"
          aria-label="Cerrar widget"
        >
          ✕
        </button>
      </div>

      {/* Botones de Acción (Micro-interacciones) */}
      <div className="p-4 flex flex-col gap-2 border-t border-white/5">
        <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span>Preguntas operativas</span>
        </p>
        <button
          onClick={() =>
            speak(
              'Para cerrar tu turno, cuenta el efectivo físico y digítalo en la casilla correspondiente. El sistema cruzará los datos.'
            )
          }
          className="text-sm text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-200 border border-transparent hover:border-white/10 transition-all cursor-pointer"
        >
          ¿Cómo hago el arqueo ciego?
        </button>
        <button
          onClick={() =>
            speak(
              'Puedes validar un acceso escaneando el código QR del carnet digital, o digitando la cédula en la barra de búsqueda superior.'
            )
          }
          className="text-sm text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-200 border border-transparent hover:border-white/10 transition-all cursor-pointer"
        >
          ¿Cómo registro un acceso manual?
        </button>
      </div>
    </div>
  );
}

export { AvatarSupportWidget };
