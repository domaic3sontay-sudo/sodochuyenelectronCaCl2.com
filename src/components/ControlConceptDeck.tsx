import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import {
  buildSpeciesGeometry,
  DiagramStage,
  SpeciesId,
  STAGE_SUMMARIES,
} from '../chemistry/cacl2Model';

interface ControlConceptDeckProps {
  viewMode: 'interactive' | 'poster';
  stage: DiagramStage;
  onStageChange: (stage: DiagramStage) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onReset: () => void;
  transferProgress: number;
  onTransferProgressChange: (value: number) => void;
  showShellLabels: boolean;
  onToggleShellLabels: () => void;
  highlightTransfer: boolean;
  onToggleHighlightTransfer: () => void;
  showBrackets: boolean;
  onToggleBrackets: () => void;
  selectedSpecies: SpeciesId;
  onSelectSpecies: (id: SpeciesId) => void;
}

export const ControlConceptDeck: React.FC<ControlConceptDeckProps> = ({
  viewMode,
  stage,
  onStageChange,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onReset,
  transferProgress,
  onTransferProgressChange,
  showShellLabels,
  onToggleShellLabels,
  highlightTransfer,
  onToggleHighlightTransfer,
  showBrackets,
  onToggleBrackets,
  selectedSpecies,
  onSelectSpecies,
}) => {
  const effectiveStage: DiagramStage = viewMode === 'poster' ? 'ions' : stage;
  const activeSummary = STAGE_SUMMARIES[effectiveStage];

  const atomBefore = buildSpeciesGeometry(selectedSpecies, 'atoms', 0);
  const atomAfter = buildSpeciesGeometry(selectedSpecies, 'ions', 1);
  const isFinalIonView = viewMode === 'poster' || stage === 'ions';
  const inspected = isFinalIonView ? atomAfter : atomBefore;

  const progressPercent = Math.round(
    (stage === 'atoms' ? 0 : stage === 'ions' ? 1 : transferProgress) * 100
  );

  return (
    <aside className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5">
      {/* Interactive Stage & Playback Controls */}
      {viewMode === 'interactive' && (
        <section aria-labelledby="playback-heading" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="playback-heading" className="text-sm font-semibold text-slate-900">
              Điều khiển giai đoạn
            </h2>
            <span className="font-mono text-xs font-medium text-slate-500 tabular-nums">
              Bước {activeSummary.stepNumber}/3
            </span>
          </div>

          {/* Stage Selector Segmented Control */}
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Chọn giai đoạn sơ đồ">
            {(['atoms', 'transfer', 'ions'] as DiagramStage[]).map((s) => {
              const info = STAGE_SUMMARIES[s];
              const isActive = stage === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onStageChange(s)}
                  className={`whitespace-nowrap rounded-md px-1.5 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {info.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Playback Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePlay}
              className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              <span>{isPlaying ? 'Tạm dừng' : 'Phát mô phỏng'}</span>
            </button>

            <button
              type="button"
              onClick={onStepForward}
              aria-label="Bước tiếp theo"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <SkipForward className="h-4 w-4" aria-hidden="true" />
              <span>Tiếp</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              aria-label="Đặt lại ban đầu"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white p-2.5 text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Transfer Progress Slider with explicit label and numeric unit */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="transfer-progress-slider" className="font-medium text-slate-700">
                Tiến độ dịch chuyển electron
              </label>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {progressPercent}%
              </span>
            </div>
            <input
              id="transfer-progress-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={progressPercent}
              onChange={(e) => onTransferProgressChange(Number(e.target.value) / 100)}
              className="h-2 w-full cursor-pointer accent-sky-600"
            />
          </div>
        </section>
      )}

      {/* Stage / Process Explanation */}
      <section className={viewMode === 'interactive' ? 'border-t border-slate-200 pt-4' : ''}>
        <h2 className="text-sm font-semibold text-slate-900">{activeSummary.title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{activeSummary.description}</p>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs font-medium text-slate-800">
          {activeSummary.equation}
        </div>
      </section>

      {/* Atom / Ion Ring Inspector */}
      <section aria-labelledby="inspector-heading" className="border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="inspector-heading" className="text-sm font-semibold text-slate-900">
            Cấu tạo từng vòng tròn
          </h2>
          <span className="text-xs text-slate-500">{inspected.nameVi}</span>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
          {(
            [
              { id: 'cl-left', label: 'Cl trái' },
              { id: 'ca', label: 'Ca giữa' },
              { id: 'cl-right', label: 'Cl phải' },
            ] as const
          ).map((item) => {
            const active = selectedSpecies === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSpecies(item.id)}
                className={`whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                  active ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between py-1 text-slate-700">
            <span className="font-medium">Vòng tròn trong cùng (Hạt nhân)</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {inspected.nucleusLabel}
            </span>
          </div>
          {inspected.shells.map((shell) => (
            <div
              key={`${inspected.id}-ring-${shell.ringIndex}`}
              className="flex items-center justify-between border-t border-slate-100 py-1 text-slate-700"
            >
              <span>
                Vòng tròn thứ {shell.ringIndex} (Lớp {shell.label})
                {shell.shellNumber === inspected.shells.length ? ' · ngoài cùng' : ''}
              </span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {stage === 'transfer' && viewMode === 'interactive' && selectedSpecies === 'ca' && shell.shellNumber === 4
                  ? '2e (đang nhường)'
                  : `${shell.electronCount} electron`}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-medium text-slate-900">
            <span>Trạng thái điện tích</span>
            <span className="font-mono font-semibold tabular-nums">
              {stage === 'transfer' && viewMode === 'interactive'
                ? selectedSpecies === 'ca'
                  ? 'Đang nhường 2e'
                  : 'Đang nhận 1e'
                : inspected.chargeValue === 0
                  ? 'Trung hòa (0)'
                  : `Ion điện tích ${inspected.chargeLabel}`}
            </span>
          </div>
        </div>
      </section>

      {/* Display Toggles */}
      <section aria-labelledby="display-options-heading" className="border-t border-slate-200 pt-4">
        <h2 id="display-options-heading" className="text-sm font-semibold text-slate-900">
          Tùy chọn hiển thị
        </h2>
        <div className="mt-2.5 flex flex-col gap-2">
          <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-xs font-medium text-slate-700">
            <span>Hiện ký hiệu lớp vỏ (K, L, M, N)</span>
            <input
              type="checkbox"
              checked={showShellLabels}
              onChange={onToggleShellLabels}
              className="h-4 w-4 rounded border-slate-300 accent-sky-600"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-xs font-medium text-slate-700">
            <span>Tô màu cam 2 electron nhường/nhận</span>
            <input
              type="checkbox"
              checked={highlightTransfer}
              onChange={onToggleHighlightTransfer}
              className="h-4 w-4 rounded border-slate-300 accent-sky-600"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-xs font-medium text-slate-700">
            <span>Hiện dấu ngoặc vuông ion [ ]</span>
            <input
              type="checkbox"
              checked={showBrackets}
              onChange={onToggleBrackets}
              className="h-4 w-4 rounded border-slate-300 accent-sky-600"
            />
          </label>
        </div>
      </section>
    </aside>
  );
};
