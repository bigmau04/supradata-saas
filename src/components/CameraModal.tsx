'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, SwitchCamera, X, RefreshCw } from 'lucide-react';

export interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  initialFacingMode?: 'user' | 'environment';
  title?: string;
  subtitle?: string;
}

export function CameraModal({
  isOpen,
  onClose,
  onCapture,
  initialFacingMode = 'environment',
  title = 'Foto del Socio',
  subtitle = 'Enfoca el rostro del cliente para su carnet digital',
}: CameraModalProps) {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialFacingMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCurrentStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const currentStream = videoRef.current.srcObject as MediaStream;
      currentStream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startStream = async (mode: 'user' | 'environment') => {
    setIsLoading(true);
    setError(null);
    stopCurrentStream();

    try {
      // Usamos ideal para compatibilidad con celulares y laptops sin error overconstrained
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('[CameraModal] video play interrupted:', playErr);
        }
      }
    } catch (err: any) {
      console.error('[CameraModal] Error accessing camera:', err);
      setError(
        'No se pudo acceder a la cámara. Por favor verifica que tu navegador tenga permisos de cámara concedidos.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startStream(facingMode);
    } else {
      stopCurrentStream();
    }

    return () => {
      stopCurrentStream();
    };
  }, [isOpen]);

  const handleFlipCamera = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    await startStream(nextMode);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 640;
    const size = Math.min(vWidth, vHeight);
    const startX = (vWidth - size) / 2;
    const startY = (vHeight - size) / 2;

    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Si la cámara es frontal ('user'), reflejamos horizontalmente
    // para que la captura guardada sea fiel a la vista tipo espejo
    if (facingMode === 'user') {
      ctx.translate(600, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, 600, 600);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    stopCurrentStream();
    onCapture(dataUrl);
    onClose();
  };

  const handleClose = () => {
    stopCurrentStream();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xl flex flex-col items-center">
        {/* Cabecera */}
        <div className="w-full flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Camera className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Cerrar cámara"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Visor de Video en vivo con encuadre */}
        <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border-2 border-emerald-500/80 relative shadow-inner bg-black flex items-center justify-center">
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el && streamRef.current && el.srcObject !== streamRef.current) {
                el.srcObject = streamRef.current;
                el.play().catch(() => {});
              }
            }}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-transform duration-300 ${
              facingMode === 'user' ? 'scale-x-[-1]' : 'scale-x-100'
            }`}
          />

          {/* Guía visual sutil de encuadre facial */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-44 h-52 sm:w-48 sm:h-56 border-2 border-dashed border-white/60 rounded-[50%] shadow-[0_0_15px_rgba(0,0,0,0.35)] flex items-center justify-center">
              <span className="text-[10px] tracking-widest uppercase font-semibold text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                Rostro aquí
              </span>
            </div>
          </div>

          {/* Badge indicador de modo de cámara */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs border border-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {facingMode === 'environment' ? 'Cámara Trasera' : 'Cámara Frontal'}
            </span>
          </div>

          {/* Overlay de carga */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white gap-2 z-20">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
              <span className="text-xs font-medium">Iniciando cámara...</span>
            </div>
          )}

          {/* Overlay de error */}
          {error && !isLoading && (
            <div className="absolute inset-0 bg-slate-900/95 p-4 flex flex-col items-center justify-center text-center text-white gap-3 z-20">
              <p className="text-xs text-rose-300 font-medium leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={() => startStream(facingMode)}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg transition border border-white/20"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        {/* Canvas oculto para procesar el frame */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Botones de acción del visor */}
        <div className="w-full flex items-center justify-between gap-2.5 mt-5 pt-1">
          {/* Botón dar vuelta / rotar cámara */}
          <button
            type="button"
            onClick={handleFlipCamera}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition active:scale-95 disabled:opacity-50 shadow-2xs"
            title="Dar vuelta cámara (trasera / frontal)"
          >
            <SwitchCamera className={`h-4 w-4 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Girar Cámara</span>
          </button>

          {/* Botón Shutter / Capturar foto */}
          <button
            type="button"
            onClick={handleCapture}
            disabled={isLoading || !!error}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition active:scale-95 disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            Tomar Foto
          </button>

          {/* Botón Cancelar */}
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-medium hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
