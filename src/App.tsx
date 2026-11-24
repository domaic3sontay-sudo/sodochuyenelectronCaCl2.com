import React, { useEffect, useRef, useState } from 'react';
import { Download, FileCode2 } from 'lucide-react';
import { DiagramStage, SpeciesId } from './chemistry/cacl2Model';
import { InteractiveDiagramCanvas } from './components/InteractiveDiagramCanvas';
import { FullPosterDiagram } from './components/FullPosterDiagram';
import { ControlConceptDeck } from './components/ControlConceptDeck';
import { FormationGuideSection } from './components/FormationGuideSection';
import { downloadSvgElementAsPng, downloadSvgElementAsSvg } from './utils/exportSvg';

export default function App() {
  const [viewMode, setViewMode] = useState<'interactive' | 'poster'>('interactive');
  const [stage, setStage] = useState<DiagramStage>('transfer');
  const [transferProgress, setTransferProgress] = useState<number>(0.65);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [showShellLabels, setShowShellLabels] = useState<boolean>(true);
  const [highlightTransfer, setHighlightTransfer] = useState<boolean>(true);
  const [showBrackets, setShowBrackets] = useState<boolean>(true);
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesId>('ca');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const interactiveSvgRef = useRef<SVGSVGElement | null>(null);
  const posterSvgRef = useRef<SVGSVGElement | null>(null);

  // Smooth animation loop when playing simulation
  useEffect(() => {
    if (!isPlaying || viewMode !== 'interactive') {
      return;
    }

    let frameId: number;
    let lastTime = performance.now();

    // If user clicks Play while at the end (ions), restart smoothly from atoms
    if (stage === 'ions') {
      setStage('atoms');
      setTransferProgress(0);
    }

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setTransferProgress((prev) => {
        const next = prev + dt * 0.42;
        if (next >= 1) {
          setStage('ions');
          setIsPlaying(false);
          return 1;
        }
        return next;
      });

      frameId = requestAnimationFrame(tick);
    };

    if (stage === 'atoms') {
      const timeout = window.setTimeout(() => {
        setStage('transfer');
        setTransferProgress(0.02);
      }, 450);
      return () => window.clearTimeout(timeout);
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, stage, viewMode]);

  const handleStageChange = (nextStage: DiagramStage) => {
    setIsPlaying(false);
    setStage(nextStage);
    if (nextStage === 'atoms') {
      setTransferProgress(0);
    } else if (nextStage === 'transfer') {
      setTransferProgress(0.5);
    } else {
      setTransferProgress(1);
    }
  };

  const handleTogglePlay = () => {
    if (viewMode !== 'interactive') {
      setViewMode('interactive');
    }
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (stage === 'ions') {
      setStage('atoms');
      setTransferProgress(0);
    }
    setIsPlaying(true);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (stage === 'atoms') {
      setStage('transfer');
      setTransferProgress(0.5);
    } else if (stage === 'transfer') {
      setStage('ions');
      setTransferProgress(1);
    } else {
      setStage('atoms');
      setTransferProgress(0);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStage('atoms');
    setTransferProgress(0);
  };

  const handleTransferProgressChange = (val: number) => {
    setIsPlaying(false);
    if (val <= 0.01) {
      setStage('atoms');
      setTransferProgress(0);
    } else if (val >= 0.99) {
      setStage('ions');
      setTransferProgress(1);
    } else {
      setStage('transfer');
      setTransferProgress(val);
    }
  };

  const activeSvgRef = viewMode === 'interactive' ? interactiveSvgRef : posterSvgRef;

  const handleExportPng = async () => {
    const svgEl = activeSvgRef.current;
    if (!svgEl) return;
    try {
      const name = viewMode === 'poster' ? 'so-do-chuyen-electron-cacl2-tong-quan.png' : `so-do-cacl2-${stage}.png`;
      await downloadSvgElementAsPng(svgEl, name, 2);
      setExportNotice('Đã tải xuống sơ đồ PNG.');
      window.setTimeout(() => setExportNotice(null), 3000);
    } catch {
      setExportNotice('Không thể xuất PNG trên trình duyệt này.');
    }
  };

  const handleExportSvg = () => {
    const svgEl = activeSvgRef.current;
    if (!svgEl) return;
    const name = viewMode === 'poster' ? 'so-do-chuyen-electron-cacl2-tong-quan.svg' : `so-do-cacl2-${stage}.svg`;
    downloadSvgElementAsSvg(svgEl, name);
    setExportNotice('Đã tải xuống sơ đồ SVG vector.');
    window.setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900">
      {/* Clean 3-Zone Top Bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-6 py-4">
          <a
            href="#top"
            className="whitespace-nowrap shrink-0 text-lg font-bold tracking-tight text-slate-900"
          >
            Sơ đồ Liên kết CaCl₂
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex" aria-label="Điều hướng chính">
            <a
              href="#so-do"
              onClick={(e) => {
                e.preventDefault();
                setViewMode('interactive');
                document.getElementById('so-do')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
            >
              Mô phỏng tương tác
            </a>
            <a
              href="#so-do"
              onClick={(e) => {
                e.preventDefault();
                setViewMode('poster');
                document.getElementById('so-do')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
            >
              Sơ đồ tổng quan
            </a>
            <a
              href="#bang-cau-tao"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
            >
              Cấu tạo vỏ
            </a>
            <a
              href="#quy-tac-octet"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
            >
              Quy tắc Octet
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportPng}
              className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tải ảnh PNG</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:py-8">
        {/* Title & Workspace Toolbar */}
        <section id="so-do" className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span>Hóa học vô cơ</span>
              <span aria-hidden="true">·</span>
              <span>Ca (Z = 20) và Cl (Z = 17)</span>
              <span aria-hidden="true">·</span>
              <span>Liên kết ion CaCl₂</span>
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl [text-wrap:balance]">
              Sơ đồ chuyển electron khi hình thành liên kết giữa nguyên tử Ca và nguyên tử Cl
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1" role="tablist" aria-label="Chế độ xem sơ đồ">
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'interactive'}
                onClick={() => setViewMode('interactive')}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                  viewMode === 'interactive'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tương tác từng bước
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'poster'}
                onClick={() => {
                  setIsPlaying(false);
                  setViewMode('poster');
                }}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                  viewMode === 'poster'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sơ đồ tổng quan (2 hàng)
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportSvg}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tải SVG</span>
            </button>
          </div>
        </section>

        {exportNotice && (
          <div
            role="status"
            className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-medium text-sky-900"
          >
            {exportNotice}
          </div>
        )}

        {/* Two-Zone Sandbox Layout: Diagram Stage (Left ~66%) + Control & Concept Deck (Right ~34%) */}
        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-8">
            {viewMode === 'interactive' ? (
              <InteractiveDiagramCanvas
                svgRef={interactiveSvgRef}
                stage={stage}
                transferProgress={transferProgress}
                showShellLabels={showShellLabels}
                highlightTransfer={highlightTransfer}
                showBrackets={showBrackets}
                selectedSpecies={selectedSpecies}
                onSelectSpecies={setSelectedSpecies}
              />
            ) : (
              <FullPosterDiagram
                svgRef={posterSvgRef}
                showShellLabels={showShellLabels}
                highlightTransfer={highlightTransfer}
                showBrackets={showBrackets}
                selectedSpecies={selectedSpecies}
                onSelectSpecies={setSelectedSpecies}
              />
            )}

            {/* Clean unboxed legend beneath canvas */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-1 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-5">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-900" aria-hidden="true" />
                  <span>Electron lớp trong / không chuyển</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-600 ring-2 ring-orange-200" aria-hidden="true" />
                  <span>2 electron chuyển từ Ca sang 2 Cl</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full border border-dashed border-orange-600 bg-orange-50" aria-hidden="true" />
                  <span>Vị trí trống trên lớp ngoài cùng của Cl</span>
                </span>
              </div>
              <span className="text-slate-500">Nhấp vào từng nguyên tử để xem chi tiết vòng tròn</span>
            </div>
          </div>

          <div className="lg:col-span-4">
            <ControlConceptDeck
              viewMode={viewMode}
              stage={stage}
              onStageChange={handleStageChange}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onStepForward={handleStepForward}
              onReset={handleReset}
              transferProgress={transferProgress}
              onTransferProgressChange={handleTransferProgressChange}
              showShellLabels={showShellLabels}
              onToggleShellLabels={() => setShowShellLabels((v) => !v)}
              highlightTransfer={highlightTransfer}
              onToggleHighlightTransfer={() => setHighlightTransfer((v) => !v)}
              showBrackets={showBrackets}
              onToggleBrackets={() => setShowBrackets((v) => !v)}
              selectedSpecies={selectedSpecies}
              onSelectSpecies={setSelectedSpecies}
            />
          </div>
        </div>

        {/* Ring-by-ring comparison table & Octet explanation */}
        <FormationGuideSection />
      </main>
    </div>
  );
}
