import { useMemo } from 'react';

interface Props {
  colors: string[];
}

/**
 * Apple Music 风格流体背景
 * - 多层 morphing blob（CSS border-radius 动画变形）
 * - 每层独立漂移 + 缩放 + 旋转，周期错开产生有机感
 * - 全局 SVG feTurbulence 滤镜增加液态噪波质感（定义在 index.html）
 * - 动态取色驱动
 */

interface Blob {
  color: string;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  blur: number;
  opacity: number;
}

export default function FluidBackground({ colors }: Props) {
  const palette = useMemo(
    () => (colors.length >= 3 ? colors : ['#FA586A', '#C084FC', '#6366F1']),
    [colors],
  );

  const blobs = useMemo<Blob[]>(() => {
    const opacities = [0.4, 0.3, 0.25, 0.18, 0.22, 0.15];
    const sizes = [60, 50, 65, 40, 55, 45];
    const positions: [number, number][] = [
      [30, 25], [70, 35], [50, 60], [20, 70], [80, 55], [45, 40],
    ];
    const durations = [18, 22, 25, 20, 28, 16];
    const delays = [0, -4, -8, -12, -6, -2];
    const blurs = [80, 100, 70, 90, 85, 95];

    return palette.flatMap((color, ci) =>
      [0, 1].map((j) => ({
        color,
        size: sizes[ci * 2 + j],
        x: positions[ci * 2 + j][0],
        y: positions[ci * 2 + j][1],
        duration: durations[ci * 2 + j],
        delay: delays[ci * 2 + j],
        blur: blurs[ci * 2 + j],
        opacity: opacities[ci * 2 + j],
      }))
    );
  }, [palette]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 流体 blob 层 — 使用全局 SVG 液态滤镜 */}
      <div
        className="absolute inset-0"
        style={{ filter: 'url(#liquid-glass)' }}
      >
        {blobs.map((blob, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${blob.x}%`,
              top: `${blob.y}%`,
              width: `${blob.size}vmax`,
              height: `${blob.size}vmax`,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              opacity: blob.opacity,
              filter: `blur(${blob.blur}px)`,
              animation: `fluid-blob-${i % 3} ${blob.duration}s ease-in-out ${blob.delay}s infinite alternate`,
              willChange: 'transform, border-radius',
            }}
          />
        ))}
      </div>

      {/* 暗角遮罩 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* 底部渐变 */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: '40vh',
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))',
        }}
      />

      {/* Blob 动画 keyframes — 3 种变形模式 */}
      <style>{`
        @keyframes fluid-blob-0 {
          0% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
          }
          33% {
            transform: translate(-40%, -60%) scale(1.15) rotate(30deg);
            border-radius: 60% 40% 30% 70% / 40% 60% 40% 60%;
          }
          66% {
            transform: translate(-60%, -45%) scale(0.9) rotate(-20deg);
            border-radius: 30% 70% 50% 50% / 50% 40% 60% 50%;
          }
          100% {
            transform: translate(-55%, -55%) scale(1.1) rotate(15deg);
            border-radius: 50% 50% 40% 60% / 60% 50% 50% 40%;
          }
        }
        @keyframes fluid-blob-1 {
          0% {
            transform: translate(-50%, -50%) scale(1.05) rotate(10deg);
            border-radius: 50% 50% 40% 60% / 40% 60% 50% 50%;
          }
          33% {
            transform: translate(-60%, -40%) scale(0.85) rotate(-30deg);
            border-radius: 40% 60% 70% 30% / 50% 40% 60% 50%;
          }
          66% {
            transform: translate(-45%, -60%) scale(1.2) rotate(25deg);
            border-radius: 70% 30% 40% 60% / 30% 70% 40% 60%;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.95) rotate(-10deg);
            border-radius: 35% 65% 55% 45% / 65% 35% 65% 35%;
          }
        }
        @keyframes fluid-blob-2 {
          0% {
            transform: translate(-50%, -50%) scale(0.9) rotate(-15deg);
            border-radius: 60% 40% 50% 50% / 50% 50% 40% 60%;
          }
          33% {
            transform: translate(-55%, -45%) scale(1.2) rotate(20deg);
            border-radius: 30% 70% 60% 40% / 60% 30% 70% 40%;
          }
          66% {
            transform: translate(-40%, -55%) scale(1) rotate(-25deg);
            border-radius: 55% 45% 35% 65% / 45% 55% 50% 50%;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
            border-radius: 45% 55% 60% 40% / 55% 45% 55% 45%;
          }
        }
      `}</style>
    </div>
  );
}
