"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Set up the PDF.js worker - use local copy from public folder
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

const RENDER_SCALE = 1.5; // Scale for canvas rendering

export default function CanvasPdfRenderer({ paperId, storageUrl }) {
  const containerRef = useRef(null);
  const pageContainerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [renderingPages, setRenderingPages] = useState(new Set());
  const [visiblePages, setVisiblePages] = useState(new Set([1]));

  // Fetch and load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch PDF from protected endpoint
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

        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setVisiblePages(new Set([1]));
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(err.message || "Failed to load PDF");
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [paperId]);

  // Render a single page to canvas
  const renderPage = useCallback(
    async (pageNum) => {
      if (!pdfDoc || renderingPages.has(pageNum)) return;

      setRenderingPages((prev) => new Set(prev).add(pageNum));

      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: RENDER_SCALE });

        // Create canvas
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.id = `page-canvas-${pageNum}`;

        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport,
        };

        await page.render(renderContext).promise;

        // Replace placeholder or append
        const pageElement = document.getElementById(`page-${pageNum}`);
        if (pageElement) {
          const existingCanvas = pageElement.querySelector("canvas");
          if (existingCanvas) {
            existingCanvas.replaceWith(canvas);
          } else {
            pageElement.appendChild(canvas);
          }
        }
      } catch (err) {
        console.error(`Error rendering page ${pageNum}:`, err);
      } finally {
        setRenderingPages((prev) => {
          const next = new Set(prev);
          next.delete(pageNum);
          return next;
        });
      }
    },
    [pdfDoc, renderingPages]
  );

  // Observe visible pages using Intersection Observer
  useEffect(() => {
    if (!pdfDoc) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const newVisiblePages = new Set(visiblePages);

        entries.forEach((entry) => {
          const pageNum = parseInt(entry.target.id.replace("page-", ""), 10);
          if (entry.isIntersecting) {
            newVisiblePages.add(pageNum);
            // Also add adjacent pages for smoother scrolling
            if (pageNum > 1) newVisiblePages.add(pageNum - 1);
            if (pageNum < totalPages) newVisiblePages.add(pageNum + 1);
          } else if (pageNum > currentPage + 5 || pageNum < currentPage - 5) {
            // Unload pages far away from current view to save memory
            const pageElement = document.getElementById(`page-${pageNum}`);
            if (pageElement) {
              const canvas = pageElement.querySelector("canvas");
              if (canvas) {
                canvas.remove();
              }
            }
          }
        });

        setVisiblePages(newVisiblePages);

        // Render visible pages
        newVisiblePages.forEach((pageNum) => {
          const pageElement = document.getElementById(`page-${pageNum}`);
          if (pageElement && !pageElement.querySelector("canvas")) {
            renderPage(pageNum);
          }
        });
      },
      { rootMargin: "50px" }
    );

    // Observe all page containers
    document.querySelectorAll('[id^="page-"]').forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [pdfDoc, totalPages, renderPage, visiblePages, currentPage]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Prevent common screenshot/save shortcuts in this view
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) {
        e.preventDefault();
      }
      // Navigate pages with arrow keys
      if (e.key === "ArrowDown" && currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      } else if (e.key === "ArrowUp" && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, totalPages]);

  // Auto-scroll to current page
  useEffect(() => {
    if (currentPage > 0) {
      const pageElement = document.getElementById(`page-${currentPage}`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [currentPage]);

  // Handle right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 max-w-md">
          <h3 className="font-semibold text-red-800 mb-2">Unable to Load PDF</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-gray-50 rounded-lg overflow-auto select-none"
      onContextMenu={handleContextMenu}
      style={{
        height: "calc(100vh - 200px)",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Page Controls */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = Math.min(Math.max(1, parseInt(e.target.value) || 1), totalPages);
                setCurrentPage(page);
              }}
              className="w-12 px-2 py-2 border border-gray-300 rounded text-center"
            />
            <span className="text-sm text-gray-600">
              of <strong>{totalPages}</strong>
            </span>
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition"
          >
            Next →
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Protected Content • Use arrow keys to navigate
        </div>
      </div>

      {/* PDF Pages Container */}
      <div
        ref={pageContainerRef}
        className="p-8 flex flex-col items-center gap-8"
        style={{ userSelect: "none" }}
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <div
            key={i + 1}
            id={`page-${i + 1}`}
            className="bg-white rounded-lg shadow-md overflow-hidden flex items-center justify-center"
            style={{
              minHeight: "400px",
              maxWidth: "100%",
              userSelect: "none",
            }}
          >
            <div className="text-gray-400 text-sm">Rendering page {i + 1}...</div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 text-xs text-gray-600 text-center">
        <p>
          ⓘ This content is protected and cannot be downloaded or copied.
        </p>
      </div>
    </div>
  );
}
