import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import type { Song } from '../../types';

interface Props {
  song: Song;
  isPlaying: boolean;
}

/**
 * AMLL 封面组件 — 精确复刻
 * 尺寸由父容器 .amll-cover 控制（var(--amll-cover-size)）
 * 圆角：由 corner-smoothing 库近似为 border-radius: 8%
 * 暂停过冲动画：cubic-bezier(0.3, 0.2, 0.2, 1.4)
 */
export default function VinylCover({ song, isPlaying }: Props) {
  const coverRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // AMLL 过冲缓动呼吸动画
  useEffect(() => {
    if (!coverRef.current || !wrapperRef.current) return;

    gsap.killTweensOf([coverRef.current, wrapperRef.current]);

    if (isPlaying) {
      gsap.to(coverRef.current, { scale: 1, duration: 0.6, ease: 'cubic-bezier(0.4, 0.2, 0.1, 1)' });
      gsap.to(wrapperRef.current, { filter: 'drop-shadow(rgba(0,0,0,0.19) 0px 1em 1.2em)', duration: 0.5 });
    } else {
      gsap.to(coverRef.current, { scale: 0.75, duration: 0.5, ease: 'cubic-bezier(0.3, 0.2, 0.2, 1.4)' });
      gsap.to(wrapperRef.current, { filter: 'drop-shadow(rgba(0,0,0,0.15) 0px 0.8em 0.8em)', duration: 0.5 });
    }
  }, [isPlaying]);

  return (
    <div ref={wrapperRef} style={{
      width: '100%',
      height: '100%',
      filter: 'drop-shadow(rgba(0,0,0,0.19) 0px 1em 1.2em)',
      transition: 'filter 0.5s ease',
    }}>
      <img ref={coverRef} src={song.album.picUrl} alt={song.name} style={{
        width: '100%', height: '100%',
        objectFit: 'cover',
        borderRadius: '8%', /* AMLL 用 corner-smoothing 0.7，这里用 border-radius 近似 */
        transform: 'scale(1)',
        display: 'block',
        transition: isPlaying
          ? 'transform 0.6s cubic-bezier(0.4, 0.2, 0.1, 1)'
          : 'transform 0.5s cubic-bezier(0.3, 0.2, 0.2, 1.4)',
      }} />
    </div>
  );
}
