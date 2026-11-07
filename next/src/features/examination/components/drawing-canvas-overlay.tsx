'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pen,
  Eraser,
  RotateCcw,
  Trash2,
  Palette,
} from 'lucide-react';

interface DrawingCanvasOverlayProps {
  initialDrawing?: string;
  onSaveDrawing?: (dataUrl: string) => void;
  width?: number;
  height?: number;
  readOnly?: boolean;
  children: React.ReactNode; // الخلفية التشريحية (SVG Diagram)
  title?: string;
}

const PEN_COLORS = [
  { id: 'blue', value: '#1D4ED8', label: 'أزرق (قلم كشف)' },
  { id: 'red', value: '#DC2626', label: 'أحمر (التهاب / ثقب)' },
  { id: 'black', value: '#000000', label: 'أسود' },
];

export function DrawingCanvasOverlay({
  initialDrawing,
  onSaveDrawing,
  width = 240,
  height = 140,
  readOnly = false,
  children,
  title,
}: DrawingCanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#1D4ED8'); // أزرق افتراضي
  const [lineWidth, setLineWidth] = useState<number>(2.5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // تحميل الرسمة المحفوظة سابقاً
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !initialDrawing) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHasDrawn(true);
    };
    img.src = initialDrawing;
  }, [initialDrawing]);

  // إحداثيات القلم الدقيقة نسبة إلى الكانفاس
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // بدء الرسم
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // حفظ الحالة في الـ history للتراجع
    try {
      const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev.slice(-10), currentState]);
    } catch (err) {
      // ignore
    }

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = lineWidth * 4;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  // حركة القلم أثناء الرسم
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  // إنهاء خطوة الرسم وحفظ الصورة
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }

    // تصدير الرسمة الشفافة كـ dataURL
    const dataUrl = canvas.toDataURL('image/png');
    onSaveDrawing?.(dataUrl);
  };

  // التراجع عن آخر خطوة
  const handleUndo = () => {
    if (history.length === 0 || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    ctx.putImageData(previousState, 0, 0);

    const dataUrl = canvas.toDataURL('image/png');
    onSaveDrawing?.(dataUrl);
  };

  // مسح الرسم بالكامل
  const handleClear = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // حفظ في history قبل المسح
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), currentState]);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSaveDrawing?.('');
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center select-none"
    >
      {title && (
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight mb-1 print:hidden">
          {title}
        </span>
      )}

      {/* الحاوية النسبية: الخلفية التشريحية وتحتها كانفاس الرسم التفاعلي */}
      <div
        className="relative group border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs print:border-none print:shadow-none"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* الطبقة 1: الرسم التشريحي الأساسي (SVG) */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-0">
          {children}
        </div>

        {/* الطبقة 2: كانفاس الرسم الشفاف التفاعلي للطبيب */}
        {!readOnly ? (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="absolute inset-0 w-full h-full z-10 touch-none cursor-crosshair"
            title="انقر واسحب للرسم وتحديد مكان الإصابة أو التثقب بالقلم"
          />
        ) : (
          initialDrawing && (
            <img
              src={initialDrawing}
              alt="Doctor Drawing"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
            />
          )
        )}
      </div>

      {/* شريط أدوات الرسم (يُخفى تماماً عند الطباعة) */}
      {!readOnly && (
        <div className="flex items-center justify-between gap-1 mt-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl w-full max-w-[240px] text-[10px] print:hidden shadow-2xs">
          {/* اختيار القلم والممحاة */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setActiveTool('pen')}
              className={`p-1 rounded-lg transition-all cursor-pointer ${
                activeTool === 'pen'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="قلم للكتابة والتأشير"
            >
              <Pen className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('eraser')}
              className={`p-1 rounded-lg transition-all cursor-pointer ${
                activeTool === 'eraser'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="ممحاة لمسح الشخبطة فقط"
            >
              <Eraser className="w-3 h-3" />
            </button>
          </div>

          {/* ألوان القلم */}
          {activeTool === 'pen' && (
            <div className="flex items-center gap-1 px-1 border-x border-slate-200">
              {PEN_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                    selectedColor === c.value
                      ? 'ring-2 ring-offset-1 ring-slate-800 scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          )}

          {/* تراجع ومسح الكل */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
              title="تراجع عن آخر خطوة"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={!hasDrawn && !initialDrawing}
              className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-30 cursor-pointer"
              title="مسح رسمة القلم بالكامل"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

