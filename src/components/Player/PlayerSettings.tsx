import { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  LyricSizePreset,
  lyricSizePresetAtom, lyricFontFamilyAtom, lyricFontWeightAtom,
  lyricLetterSpacingAtom, enableLyricTranslationLineAtom,
  enableLyricRomanLineAtom, enableLyricSwapTransRomanLineAtom,
  enableLyricLineBlurEffectAtom, enableLyricLineScaleEffectAtom,
  enableLyricLineSpringAnimationAtom, lyricWordFadeWidthAtom,
  hideLyricViewAtom, showMusicNameAtom, showMusicArtistsAtom,
  showMusicAlbumAtom, showBottomControlAtom, showVolumeControlAtom,
  showRemainingTimeAtom, playerControlsTypeAtom,
  cssBackgroundPropertyAtom, lyricBackgroundStaticModeAtom,
  lyricBackgroundRendererAtom, lyricBackgroundFPSAtom,
  lyricBackgroundRenderScaleAtom, verticalCoverLayoutAtom,
} from '@applemusic-like-lyrics/react-full';
import { MeshGradientRenderer, PixiRenderer } from '@applemusic-like-lyrics/core';
import { X } from 'lucide-react';

// ────────────────────────────────────────────────
// 通用组件
// ────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ atom, label }: { atom: Parameters<typeof useAtomValue>[0]; label: string }) {
  const value = useAtomValue(atom as any);
  const setValue = useSetAtom(atom as any);
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[13px] text-white/80">{label}</span>
      <button
        onClick={() => setValue((p: boolean) => !p)}
        className="relative shrink-0 ml-3 w-[44px] h-[24px] rounded-full transition-colors duration-200"
        style={{ backgroundColor: value ? '#34C759' : 'rgba(255,255,255,0.15)' }}
        role="switch"
        aria-checked={Boolean(value)}
      >
        <span
          className="absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full bg-white shadow-md transition-transform duration-200 ease-out"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

function OptionGroup<T extends string>({
  value, onChange, options, label,
}: {
  value: T; onChange: (v: T) => void;
  options: { value: T; label: string }[]; label: string;
}) {
  return (
    <div className="py-2">
      <span className="text-sm text-white/80 block mb-2">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              value === opt.value
                ? 'bg-brand-red text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Slider({
  value, onChange, min, max, step, label, formatValue,
}: {
  value: number; onChange: (v: number) => void;
  min: number; max: number; step: number;
  label: string; formatValue?: (v: number) => string;
}) {
  const display = formatValue ? formatValue(value) : value.toFixed(step < 1 ? 2 : 0);
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-white/80">{label}</span>
        <span className="text-xs text-white/40 tabular-nums">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-brand-red cursor-pointer"
      />
    </div>
  );
}

// ────────────────────────────────────────────────
// 设置面板
// ────────────────────────────────────────────────

export default function PlayerSettings({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex justify-end"
      style={{ animation: 'amll-fade-in 0.2s ease-out' }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[340px] h-full glass-panel-heavy overflow-y-auto"
        style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
          <h2 className="text-lg font-semibold text-white">播放器设置</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-white/60" />
          </button>
        </div>
        <div className="p-5 space-y-6">
          <LyricFontSection />
          <LyricEffectsSection />
          <LyricTranslationSection />
          <DisplaySection />
          <ControlsSection />
          <CoverLayoutSection />
          <BackgroundSection />
        </div>
      </div>
    </div>
  );
}

// ── 歌词字体 ──
const SIZE_OPTIONS: { value: LyricSizePreset; label: string }[] = [
  { value: LyricSizePreset.Tiny, label: '极小' },
  { value: LyricSizePreset.ExtraSmall, label: '更小' },
  { value: LyricSizePreset.Small, label: '小' },
  { value: LyricSizePreset.Medium, label: '中' },
  { value: LyricSizePreset.Large, label: '大' },
  { value: LyricSizePreset.ExtraLarge, label: '更大' },
  { value: LyricSizePreset.Huge, label: '极大' },
];

const FONT_OPTIONS = [
  { value: '', label: '默认' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'SF Pro Display', sans-serif", label: 'SF Pro' },
  { value: "'PingFang SC', sans-serif", label: '苹方' },
  { value: "'Noto Sans SC', sans-serif", label: '思源黑体' },
];

const WEIGHT_OPTIONS = [
  { value: '400', label: '400' },
  { value: '500', label: '500' },
  { value: '600', label: '600' },
  { value: '700', label: '700' },
  { value: '800', label: '800' },
];

const SPACING_OPTIONS = [
  { value: 'normal', label: '默认' },
  { value: '0.02em', label: '紧凑' },
  { value: '0.05em', label: '标准' },
  { value: '0.1em', label: '宽松' },
  { value: '0.15em', label: '超宽' },
];

function LyricFontSection() {
  const size = useAtomValue(lyricSizePresetAtom);
  const setSize = useSetAtom(lyricSizePresetAtom);
  const font = useAtomValue(lyricFontFamilyAtom);
  const setFont = useSetAtom(lyricFontFamilyAtom);
  const weight = useAtomValue(lyricFontWeightAtom);
  const setWeight = useSetAtom(lyricFontWeightAtom);
  const spacing = useAtomValue(lyricLetterSpacingAtom);
  const setSpacing = useSetAtom(lyricLetterSpacingAtom);

  return (
    <Section title="歌词字体">
      <OptionGroup value={size} onChange={(v) => setSize(v as LyricSizePreset)} label="歌词大小" options={SIZE_OPTIONS} />
      <OptionGroup value={font} onChange={setFont} label="字体家族" options={FONT_OPTIONS} />
      <OptionGroup value={String(weight)} onChange={(v) => setWeight(Number(v))} label="字重" options={WEIGHT_OPTIONS} />
      <OptionGroup value={spacing} onChange={setSpacing} label="字间距" options={SPACING_OPTIONS} />
    </Section>
  );
}

// ── 歌词行效果 ──
function LyricEffectsSection() {
  const fadeWidth = useAtomValue(lyricWordFadeWidthAtom);
  const setFadeWidth = useSetAtom(lyricWordFadeWidthAtom);

  return (
    <Section title="歌词行效果">
      <Slider value={fadeWidth} onChange={setFadeWidth} min={0} max={1} step={0.05}
        label="歌词渐变宽度" formatValue={(v) => v.toFixed(2)} />
      <Toggle atom={enableLyricLineBlurEffectAtom} label="歌词模糊" />
      <Toggle atom={enableLyricLineScaleEffectAtom} label="缩放效果" />
      <Toggle atom={enableLyricLineSpringAnimationAtom} label="弹簧动画" />
    </Section>
  );
}

// ── 翻译与音译 ──
function LyricTranslationSection() {
  return (
    <Section title="翻译与音译">
      <Toggle atom={enableLyricTranslationLineAtom} label="翻译歌词" />
      <Toggle atom={enableLyricRomanLineAtom} label="音译歌词" />
      <Toggle atom={enableLyricSwapTransRomanLineAtom} label="交换翻译/音译" />
    </Section>
  );
}

// ── 显示选项 ──
function DisplaySection() {
  return (
    <Section title="显示选项">
      <Toggle atom={hideLyricViewAtom} label="隐藏歌词视图" />
      <Toggle atom={showMusicNameAtom} label="歌曲名" />
      <Toggle atom={showMusicArtistsAtom} label="艺术家" />
      <Toggle atom={showMusicAlbumAtom} label="专辑名" />
      <Toggle atom={showVolumeControlAtom} label="音量控制" />
      <Toggle atom={showBottomControlAtom} label="底部控制" />
      <Toggle atom={showRemainingTimeAtom} label="剩余时间" />
    </Section>
  );
}

// ── 控件类型 ──
const CONTROLS_OPTIONS: { value: string; label: string }[] = [
  { value: 'controls', label: '标准' },
  { value: 'fft', label: '频谱' },
  { value: 'none', label: '无' },
];

function ControlsSection() {
  const type = useAtomValue(playerControlsTypeAtom);
  const setType = useSetAtom(playerControlsTypeAtom);
  return (
    <Section title="控件类型">
      <OptionGroup value={type} onChange={(v) => setType(v as any)} label="控件" options={CONTROLS_OPTIONS} />
    </Section>
  );
}

// ── 封面布局 ──
const COVER_LAYOUT_OPTIONS: { value: string; label: string }[] = [
  { value: 'auto', label: '自动' },
  { value: 'force-normal', label: '标准' },
  { value: 'force-immersive', label: '沉浸' },
];

function CoverLayoutSection() {
  const layout = useAtomValue(verticalCoverLayoutAtom);
  const setLayout = useSetAtom(verticalCoverLayoutAtom);
  return (
    <Section title="封面布局">
      <OptionGroup value={layout} onChange={(v) => setLayout(v as any)} label="布局" options={COVER_LAYOUT_OPTIONS} />
    </Section>
  );
}

// ── 背景 ──
const BG_RENDERER_OPTIONS = [
  { value: 'mesh', label: '渐变' },
  { value: 'pixi', label: 'Pixi' },
  { value: 'css-bg', label: 'CSS 背景' },
];

function BackgroundSection() {
  const rendererValue = useAtomValue(lyricBackgroundRendererAtom);
  const setRenderer = useSetAtom(lyricBackgroundRendererAtom);
  const cssBg = useAtomValue(cssBackgroundPropertyAtom);
  const setCssBg = useSetAtom(cssBackgroundPropertyAtom);
  const fps = useAtomValue(lyricBackgroundFPSAtom);
  const setFps = useSetAtom(lyricBackgroundFPSAtom);
  const scale = useAtomValue(lyricBackgroundRenderScaleAtom);
  const setScale = useSetAtom(lyricBackgroundRenderScaleAtom);

  // 推断当前渲染器类型
  const currentType = typeof rendererValue.renderer === 'string'
    ? rendererValue.renderer === 'css-bg' ? 'css-bg' : 'mesh'
    : 'mesh';

  const handleRendererChange = (type: string) => {
    localStorage.setItem(
      'amll-react-full.lyricBackgroundRenderer',
      type === 'mesh' ? '' : type
    );
    switch (type) {
      case 'pixi': setRenderer({ renderer: PixiRenderer }); break;
      case 'css-bg': setRenderer({ renderer: 'css-bg' }); break;
      default: setRenderer({ renderer: MeshGradientRenderer }); break;
    }
  };

  return (
    <Section title="背景">
      <OptionGroup value={currentType} onChange={handleRendererChange} label="背景渲染" options={BG_RENDERER_OPTIONS} />
      {currentType === 'css-bg' && (
        <div className="py-2">
          <span className="text-sm text-white/80 block mb-2">背景颜色</span>
          <div className="flex items-center gap-2">
            <input
              type="color" value={cssBg.startsWith('#') ? cssBg : '#111111'}
              onChange={(e) => setCssBg(e.target.value)}
              className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
            />
            <input
              type="text" value={cssBg}
              onChange={(e) => setCssBg(e.target.value)}
              className="flex-1 bg-white/5 text-white text-sm rounded-lg px-3 py-1.5 border border-white/10 outline-none font-mono"
            />
          </div>
        </div>
      )}
      <Slider value={scale} onChange={setScale} min={0.25} max={2} step={0.25}
        label="分辨率比率" formatValue={(v) => v.toFixed(2)} />
      <Slider value={fps} onChange={setFps} min={15} max={120} step={15}
        label="帧率" formatValue={(v) => `${v} FPS`} />
      <Toggle atom={lyricBackgroundStaticModeAtom} label="静态模式" />
    </Section>
  );
}
