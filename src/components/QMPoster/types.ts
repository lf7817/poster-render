import { CSSProperties } from "react";

export interface FreePosterOptions {
  debug: boolean;
  canvasId: string;
  width: number;
  height: number;
  /** 图片质量 0-1 */
  quality: number;
  onSave?: (url: string) => void;
  onSaveFail?: (err: any) => void;
}

interface Common<T> {
  type: T;
  /** 图形左定点相对canvas左上角的x坐标 */
  x: number;
  /** 图形左定点相对canvas左上角的y坐标 */
  y: number;
}

/**
 * 绘制图片
 */
export interface PaintImage extends Common<"image"> {
  width: number;
  height: number;
  /** 图片路径，支持https、wxfile协议 */
  src: string;
  /** 背景色 */
  backgroundColor?: string;
  /**
   * 圆角所处圆的半径尺寸，如果要绘制圆形，宽高一致，radius设为宽一半
   * 顺序：左上 -> 右上 -> 右下 -> 左下
   */
  radius?: number | `${number} ${number} ${number} ${number}`;
}

export interface PaintShape extends Common<"shape"> {
  /** 矩形宽 */
  width: number;
  /** 矩形高 */
  height: number;
  /** 圆角度数，如果要绘制圆形，宽高一致，radius设为宽一半 */
  radius?: number | `${number} ${number} ${number} ${number}`;
  /** 线颜色 */
  strokeStyle?: string;
  /** 线宽 */
  lineWidth?: number;
  /** 背景色 */
  fillStyle?: string;
}

export interface PaintText extends Common<"text"> {
  width: number;
  height: number;
  text: string;
  /** 文字对齐方式 */
  textAlign?: "left" | "center" | "right";
  fontWeight?: "normal" | "bold";
  color: string;
  fontSize: number;
  lineHeight?: number;
  baseLine: "top" | "bottom" | "middle" | "normal";
  opacity?: number;
  lineNum?: number;
  fontStyle?: "normal" | "italic" | "oblique";
  fontFamily?: string;
}

export type PosterItemConfig = PaintImage | PaintShape | PaintText;

export interface QMPosterProps {
  canvasId?: string;
  className?: string;
  style?: CSSProperties;
  width: number;
  height: number;
  debug?: boolean;
  quality?: number;
  list: PosterItemConfig[];
  showMenuByLongpress?: boolean;
  onLongPress?: (url: string) => void;
  onSave?: (url: string) => void;
  onSaveFail?: (err: any) => void;
  onRender?: (url: string) => void;
  onRenderFail?: (err: any) => void;
}

export interface QMPosterRef {
  /** 保存到相册 */
  savePosterToPhoto: () => Promise<string>;
}
