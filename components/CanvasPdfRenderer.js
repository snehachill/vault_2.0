"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Set up the PDF.js worker - use local copy from public folder
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

const PRIMARY = "#25671E";

export default function CanvasPdfRenderer({ paperId, onContainerScroll }) {
  const containerRef = useRef(null);
  const pageRefs = useRef([]);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderVersion, setRenderVersion] = useState(0);
  const [rendering, setRendering] = useState(false);

  // Fetch and load the full PDF once
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/papers/${paperId}/content`);

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("You don't have permission to view this paper. Make sure you've unlocked it.");
          } else if (response.status === 404) {
            throw new Error("Paper not found.");
          } else {
            throw new Error(`Failed to load PDF: ${response.statusText}`);
          }
        }

        const arrayBuffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        pageRefs.current = new Array(pdf.numPages);
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(err.message || "Failed to load PDF");
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [paperId]);

  // Render all pages to canvases, auto-fitting the container width for mobile/desktop
  const renderAllPages = useCallback(async () => {
    if (!pdfDoc || !totalPages) return;

    setRendering(true);

    try {
      const containerWidth = containerRef.current?.clientWidth ? containerRef.current.clientWidth - 24 : undefined;

      for (let pageNum = 1; pageNum <= totalPages; pageNum += 1) {
        const page = await pdfDoc.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1 });

        const targetWidth = containerWidth ? Math.min(containerWidth, 1100) : baseViewport.width;
        const scale = Math.max(0.72, targetWidth / baseViewport.width);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { alpha: false });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.display = "block";

        await page.render({ canvasContext: context, viewport }).promise;

        const wrapper = pageRefs.current[pageNum - 1];
        if (wrapper) {
          wrapper.innerHTML = "";
          wrapper.appendChild(canvas);
        }
      }
    } catch (err) {
      console.error("Error rendering PDF:", err);
      setError("Failed to render PDF");
    } finally {
      setRendering(false);
    }
  }, [pdfDoc, totalPages]);

  // Re-render pages when PDF loads or container width changes
  useEffect(() => {
    if (pdfDoc && totalPages) {
      renderAllPages();
    }
  }, [pdfDoc, totalPages, renderAllPages, renderVersion]);

  // Watch container width to keep pages responsive on resize/orientation change
  useEffect(() => {
    if (!containerRef.current) return undefined;

    let lastWidth = containerRef.current.clientWidth;
    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0].contentRect.width;
      if (Math.abs(nextWidth - lastWidth) > 24) {
        lastWidth = nextWidth;
        setRenderVersion((v) => v + 1);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const handleScroll = (e) => {
    onContainerScroll?.(e.target.scrollTop);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-[var(--primary,_#25671E)] animate-spin" />
          <p className="text-gray-600">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16 px-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 max-w-md w-full shadow-sm">
          <h3 className="font-semibold text-red-800 mb-2">Unable to load PDF</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-gray-200/70 shadow-sm bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-gray-200/70">
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: PRIMARY }}>
          <span className="inline-flex h-2 w-2 rounded-full" style={{ background: PRIMARY }} />
          Protected paper · Scroll to read
        </div>
        <span className="text-xs text-gray-500">Auto-fit for mobile and desktop</span>
      </div>

      <div
        ref={containerRef}
        className="max-h-[calc(100vh-160px)] sm:max-h-[calc(100vh-190px)] overflow-y-auto px-3 sm:px-6 py-5 select-none"
        style={{ WebkitUserSelect: "none" }}
        onContextMenu={handleContextMenu}
        onScroll={handleScroll}
      >
        <div className="mx-auto w-full max-w-5xl flex flex-col gap-6">
          {rendering && (
            <div className="text-xs text-gray-500 mb-2">Optimizing layout for your screen…</div>
          )}

          {Array.from({ length: totalPages }, (_, i) => (
            <div
              key={i}
              ref={(el) => {
                pageRefs.current[i] = el;
              }}
              className="w-full overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm" 
              style={{ minHeight: "320px", boxShadow: "0 18px 40px rgba(37, 103, 30, 0.06)" }}
            >
              <div className="flex items-center justify-center py-12 text-sm text-gray-400">
                Preparing page {i + 1}...
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-3 border-t border-gray-200/70 text-xs text-gray-600 bg-white/90">
        <p>ⓘ Protected content. Downloading and copying are disabled.</p>
      </div>
    </div>
  );
}
