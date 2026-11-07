'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SecurePdfViewerProps {
  docSlug: string;
  userEmail: string;
  userTier?: string;
}

export default function SecurePdfViewer({
  docSlug,
  userEmail,
  userTier = 'free',
}: SecurePdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/docs/stream?slug=${docSlug}`, {
          headers: { 'x-user-bundle': userTier },
        });

        if (!res.ok) {
          throw new Error('Access denied. Upgrade your bundle to view this monograph.');
        }

        const arrayBuffer = await res.arrayBuffer();

        // Dynamically load pdfjs only in client-side environment
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        setLoading(false);
      } catch (err: unknown) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Unable to render document';
          setError(message);
          setLoading(false);
        }
      }
    }

    loadPdf();
    return () => {
      isCancelled = true;
    };
  }, [docSlug, userTier]);

  return (
    <div
      className="relative select-none inline-block border border-slate-700 rounded-lg overflow-hidden shadow-2xl bg-slate-900"
      onContextMenu={(e) => e.preventDefault()}
    >
      {loading && (
        <div className="flex items-center justify-center h-[600px] w-[500px] text-slate-300">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Decrypting & rendering monograph...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-[600px] w-[500px] p-6 text-center text-rose-400 bg-slate-950">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <canvas ref={canvasRef} className={`block ${loading || error ? 'hidden' : ''}`} />

      <div className="absolute inset-0 pointer-events-auto bg-transparent">
        <div className="w-full h-full flex flex-col justify-around items-center opacity-10 pointer-events-none -rotate-12 select-none">
          <span className="text-xl font-black text-white uppercase tracking-widest">
            {userEmail} • VIEW ONLY
          </span>
          <span className="text-xl font-black text-white uppercase tracking-widest">
            LICENSED COPY • NO DOWNLOAD
          </span>
        </div>
      </div>
    </div>
  );
}
