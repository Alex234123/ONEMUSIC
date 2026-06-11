import { useState, useEffect, useRef } from 'react';

/**
 * 从封面图片提取主色调（借鉴 Mengobs/MusicPlayer 的 getDominantColors 算法）
 * 将图片分为 4 个象限，每象限取平均色，过滤相近色后返回 3 个主色调
 */
export function useAlbumColors(imageUrl: string | undefined): string[] {
  const [colors, setColors] = useState<string[]>(['#FA586A', '#C084FC', '#6366F1']);
  const lastUrl = useRef<string>('');

  useEffect(() => {
    if (!imageUrl || imageUrl === lastUrl.current) return;
    lastUrl.current = imageUrl;

    // imageUrl 已经是 /api/image?url=... 代理地址（由后端 mapper 转换），同源无需跨域
    const img = new Image();
    img.onload = () => {
      try {
        // 缩小到 100px 高度采样，减少计算量
        const scale = 100 / img.height;
        const w = Math.round(img.width * scale);
        const h = 100;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const extracted = getDominantColors(imageData);

        if (extracted.length >= 3) {
          setColors(extracted);
        } else {
          const defaults = ['#FA586A', '#C084FC', '#6366F1'];
          while (extracted.length < 3) extracted.push(defaults[extracted.length]);
          setColors(extracted);
        }
      } catch {
        // 取色失败，保持默认
      }
    };

    img.onerror = () => {};
    img.src = imageUrl;
  }, [imageUrl]);

  return colors;
}

/**
 * 分区平均取样 + 去重过滤（借鉴 Mengobs/MusicPlayer）
 */
function getDominantColors(imageData: ImageData): string[] {
  const { data, width, height } = imageData;
  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);
  const step = 4; // 采样步进

  const regions = [
    { x1: 0, y1: 0, x2: halfW, y2: halfH },
    { x1: halfW, y1: 0, x2: width, y2: halfH },
    { x1: 0, y1: halfH, x2: halfW, y2: height },
    { x1: halfW, y1: halfH, x2: width, y2: height },
  ];

  const regionColors: [number, number, number][] = [];

  for (const region of regions) {
    let tr = 0, tg = 0, tb = 0, count = 0;
    for (let y = region.y1; y < region.y2; y += step) {
      for (let x = region.x1; x < region.x2; x += step) {
        const i = (y * width + x) * 4;
        tr += data[i];
        tg += data[i + 1];
        tb += data[i + 2];
        count++;
      }
    }
    if (count > 0) {
      regionColors.push([Math.round(tr / count), Math.round(tg / count), Math.round(tb / count)]);
    }
  }

  // 去重：颜色距离 >= 50 才保留
  const minDistance = 50;
  const unique: string[] = [];

  for (const [r, g, b] of regionColors) {
    const isUnique = unique.every((hex) => {
      const other = hexToRgb(hex);
      return Math.sqrt((r - other[0]) ** 2 + (g - other[1]) ** 2 + (b - other[2]) ** 2) >= minDistance;
    });
    if (isUnique) {
      unique.push(rgbToHex(r, g, b));
    }
  }

  return unique;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}