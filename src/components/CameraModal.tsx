'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = () => {
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
    setError(null);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

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
      setError('Cámara no disponible. Puedes subir una foto desde tus archivos.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      startStream(facingMode);
    } else {
      stopStream();
      setCapturedPhoto(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen]);

  const toggleFacingMode = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    setCapturedPhoto(null);
    await startStream(nextMode);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const vWidth = video.videoWidth || 720;
    const vHeight = video.videoHeight || 720;
    const size = Math.min(vWidth, vHeight);
    const startX = (vWidth - size) / 2;
    const startY = (vHeight - size) / 2;

    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (facingMode === 'user') {
      ctx.translate(600, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, 600, 600);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    stopStream();
    setCapturedPhoto(dataUrl);
  };

  const handleRetry = () => {
    setCapturedPhoto(null);
    startStream(facingMode);
  };

  const handleSaveAndUse = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      handleClose();
    }
  };

  const handleClose = () => {
    stopStream();
    setCapturedPhoto(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl flex flex-col items-center gap-4">
        {/* Cabecera superior con título e indicador de cámara activa */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Fotografía del Socio
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {facingMode === 'user' ? 'Cámara Frontal Activa' : 'Cámara Trasera Activa'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {capturedPhoto
                ? 'Verifica que el rostro se aprecie con claridad antes de guardar'
                : 'Enfoca el rostro del cliente para su carnet digital'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Botón selector de cámara (solo texto, sin iconos) */}
        {!capturedPhoto && (
          <div className="w-full flex items-center justify-between">
            <span className="text-xs text-slate-500">¿Usas celular o necesitas otra cámara?</span>
            <button
              type="button"
              onClick={toggleFacingMode}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 transition-all active:scale-95"
            >
              {facingMode === 'user' ? 'Cambiar a Trasera' : 'Cambiar a Frontal'}
            </button>
          </div>
        )}

        {/* Visor grande de video o foto capturada */}
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden bg-black relative border-2 border-emerald-400 shadow-inner flex items-center justify-center">
          {capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Foto del socio capturada"
              className="w-full h-full object-cover"
            />
          ) : (
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
          )}

          {/* Guía visual de encuadre en estado vivo */}
          {!capturedPhoto && !error && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-48 h-56 sm:w-52 sm:h-60 border-2 border-dashed border-white/60 rounded-[50%] shadow-[0_0_15px_rgba(0,0,0,0.35)] flex items-center justify-center">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-white/90 bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  Rostro aquí
                </span>
              </div>
            </div>
          )}

          {/* Alerta de error si no hay permisos o no está disponible */}
          {error && !capturedPhoto && (
            <div className="absolute inset-0 bg-slate-900/95 p-4 flex flex-col items-center justify-center text-center text-white gap-3 z-20">
              <p className="text-xs text-rose-300 font-medium leading-relaxed max-w-xs">{error}</p>
              <button
                type="button"
                onClick={() => startStream(facingMode)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 transition-all"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        {/* Canvas oculto para procesar el frame */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Botonera de acciones: VIVO vs CAPTURADA */}
        <div className="w-full flex items-center justify-center gap-3 pt-1">
          {capturedPhoto ? (
            <>
              {/* Botón 1: Repetir / Reintentar */}
              <button
                type="button"
                onClick={handleRetry}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-slate-200"
              >
                Repetir / Reintentar
              </button>

              {/* Botón 2: Guardar y Usar Foto */}
              <button
                type="button"
                onClick={handleSaveAndUse}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                Guardar y Usar Foto
              </button>
            </>
          ) : (
            <>
              {/* Botón Secundario: Cancelar */}
              <button
                type="button"
                onClick={handleClose}
                className="text-slate-600 hover:text-slate-900 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>

              {/* Botón Primario: Capturar Foto */}
              <button
                type="button"
                onClick={handleCapture}
                disabled={!!error}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                Capturar Foto
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
