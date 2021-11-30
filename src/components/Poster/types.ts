import { CSSProperties } from "react";

type DownloadLimit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface FreePosterOptions {
  debug: boolean;
  canvasId: string;
  width: number;
  height: number;
  /** 图片并行下载数, 默认10 */
  downloadLimit?: DownloadLimit;
  /** 导出图片格式 */
  fileType?: "png" | "jpg";
  /** 图片质量 0-1，只对jpg生效 */
  quality?: number;
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

interface PosterImageProps {
  renderType: "image";
  onLongPress?: (url: string) => void;
  onRender?: (url: string) => void;
}

interface PosterCanvasProps {
  renderType: "canvas";
  onLongPress?: () => void;
  onRender?: () => void;
}

export type PosterProps = PosterCanvasProps | PosterImageProps;

interface PosterBaseProps {
  canvasId?: string;
  className?: string;
  style?: CSSProperties;
  width: number;
  height: number;
  debug?: boolean;
  /** 图片并行下载数, 默认10 */
  downloadLimit?: DownloadLimit;
  /** 导出图片格式 */
  fileType?: "png" | "jpg";
  /** 图片质量 0-1，只对jpg生效 */
  quality?: number;
  list: PosterItemConfig[];
  showMenuByLongpress?: boolean;
  onSave?: (url: string) => void;
  onSaveFail?: (err: any) => void;
  onRenderFail?: (err: any) => void;
}

interface PosterImageProps extends PosterBaseProps {
  renderType: "image";
  onLongPress?: (url: string) => void;
  onRender?: (url: string) => void;
}

interface PosterCanvasProps extends PosterBaseProps {
  renderType: "canvas";
  onLongPress?: () => void;
  onRender?: () => void;
}

export interface PosterRef {
  /** 保存到相册 */
  savePosterToPhoto: () => Promise<string>;
  /** 预览图片 */
  preview: () => Promise<void>;
}
