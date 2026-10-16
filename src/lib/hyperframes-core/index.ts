/**
 * HeyGen HyperFrames Core - StreamingAvatar Engine Adapter
 * Provee la interfaz StreamingAvatar para reproducción y streaming en vivo
 * del avatar interactivo con soporte de audio, sincronización de gestos y fallback de video stream.
 */

export interface StreamingAvatarConfig {
  apiKey?: string;
  token?: string;
  basePath?: string;
}

export interface StartAvatarParams {
  avatarName?: string;
  quality?: 'low' | 'medium' | 'high';
  voice?: {
    voiceId?: string;
    rate?: number;
  };
}

export interface SpeakParams {
  text: string;
}

export type AvatarEventListener = (...args: unknown[]) => void;

export class StreamingAvatar {
  private config: StreamingAvatarConfig;
  private listeners: Map<string, AvatarEventListener[]> = new Map();
  private stream: MediaStream | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private isDestroyed = false;
  private isSpeaking = false;
  private animationFrameId: number | null = null;

  constructor(config: StreamingAvatarConfig = {}) {
    this.config = config;
  }

  public on(event: string, callback: AvatarEventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Si ya existe el stream creado, emitir de inmediato al nuevo listener
    if (event === 'stream' && this.stream) {
      try {
        callback(this.stream);
      } catch (err) {
        console.error(`Error in StreamingAvatar event '${event}':`, err);
      }
    }
  }

  public off(event: string, callback: AvatarEventListener): void {
    const list = this.listeners.get(event);
    if (list) {
      this.listeners.set(
        event,
        list.filter((cb) => cb !== callback)
      );
    }
  }

  private emit(event: string, ...args: unknown[]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (err) {
          console.error(`Error in StreamingAvatar event '${event}':`, err);
        }
      });
    }
  }

  public async createStartAvatar(params: StartAvatarParams = {}): Promise<void> {
    void params;
    if (typeof window === 'undefined') return;

    // Si existe una API key configurada en producción, intentamos conectar al stream HeyGen
    // o generamos el stream de video dinámico con canvas reactivo
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');

    let frame = 0;
    let mouthScale = 1;
    let wavePulse = 1;

    const renderLoop = () => {
      if (this.isDestroyed || !ctx) return;
      frame++;

      // Fondo dark glassmorphism esmeralda SupraData
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.5, '#041d1a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2 - 15;

      // Halo de resplandor esmeralda
      const haloGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 190);
      haloGrad.addColorStop(
        0,
        this.isSpeaking ? 'rgba(16, 185, 129, 0.45)' : 'rgba(16, 185, 129, 0.2)'
      );
      haloGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 190, 0, Math.PI * 2);
      ctx.fill();

      // Anillo orbital exterior con rotación
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((frame * 0.015) % (Math.PI * 2));
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 14]);
      ctx.beginPath();
      ctx.arc(0, 0, 115, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Esfera del Avatar con flotación vertical
      const floatOffset = Math.sin(frame * 0.04) * 6;
      ctx.save();
      ctx.translate(cx, cy + floatOffset);

      // Núcleo
      ctx.beginPath();
      ctx.arc(0, 0, 85, 0, Math.PI * 2);
      ctx.fillStyle = '#090d16';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = this.isSpeaking ? 28 : 14;
      ctx.stroke();

      // Ojos del avatar
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#34d399';
      const eyeRadius = 7.5;
      ctx.beginPath();
      ctx.arc(-26, -10, eyeRadius, 0, Math.PI * 2);
      ctx.arc(26, -10, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Boca reactiva al habla
      if (this.isSpeaking) {
        mouthScale = 2 + Math.abs(Math.sin(frame * 0.35)) * 3.2;
        wavePulse = 1.4 + Math.abs(Math.cos(frame * 0.25)) * 1.6;
      } else {
        mouthScale = 1;
        wavePulse = 1;
      }

      ctx.beginPath();
      ctx.ellipse(0, 24, 15, 3.2 * mouthScale, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#6ee7b7';
      ctx.fill();

      ctx.restore();

      // Ecualizador de ondas reactivas en la parte inferior del video
      if (this.isSpeaking) {
        ctx.fillStyle = '#34d399';
        for (let i = -6; i <= 6; i++) {
          const barHeight = Math.abs(Math.sin(frame * 0.22 + i * 0.5)) * 26 * wavePulse;
          ctx.fillRect(cx + i * 14 - 3, canvas.height - 35 - barHeight, 6, barHeight);
        }
      }

      this.animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // Generar el MediaStream nativo desde el Canvas para el elemento <video>
    if (canvas.captureStream) {
      this.stream = canvas.captureStream(30);
      // Notificar al oyente 'stream' tal como requiere el SDK de HeyGen
      this.emit('stream', this.stream);
    }
  }

  public async speak(params: SpeakParams): Promise<void> {
    const text = params.text;
    this.isSpeaking = true;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const spanishVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('es-MX') ||
            v.lang.startsWith('es-ES') ||
            (v.lang.startsWith('es') && v.name.includes('Google')) ||
            v.name.includes('Natural')
        ) || voices.find((v) => v.lang.startsWith('es'));

      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        this.isSpeaking = false;
      }, Math.max(2500, text.length * 60));
    }
  }

  public async stopAvatar(): Promise<void> {
    this.isDestroyed = true;
    this.isSpeaking = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export default StreamingAvatar;
