'use client';
import { QRCodeSVG } from 'qrcode.react';

export function QRRenderer({ value, size }: { value: string, size: number }) {
  return <QRCodeSVG value={value} size={size} />;
}
