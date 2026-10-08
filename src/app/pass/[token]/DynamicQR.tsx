'use client';

import { useState, useEffect } from 'react';
import { QRRenderer } from '@/components/QRRenderer';

export function DynamicQR({ baseToken }: { baseToken: string }) {
  const [token, setToken] = useState(() => `${baseToken}-${Math.floor(Date.now() / 45000)}`);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setToken(`${baseToken}-${Math.floor(Date.now() / 45000)}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [baseToken]);

  return (
    <div className="flex flex-col items-center">
      <QRRenderer value={token} size={200} />
      <div className="mt-2 w-full max-w-[200px]">
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
           <div className="h-full bg-blue-500 animate-[progress_45s_linear_infinite]"></div>
        </div>
        <p className="text-xs text-gray-400 mt-1 text-center font-medium">Actualizando código...</p>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  );
}
