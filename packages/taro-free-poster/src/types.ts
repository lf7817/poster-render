import FreePoster from "./FreePoster";

export type DownloadLimit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface FreePosterOptions {
  debug: boolean;
  canvasId: string;
  width: number;
  height: number;
  /** 背景颜色 */
  backgroundColor?: string;
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
  /** 默认图片，src下载失败时采用 */
  defaultSrc?: string;
  /**
   * fill-填充模式，图片会占满绘制区域
   * contain-保持纵横比缩放图片，使图片的长边能完全显示出来
   * cover-保持纵横比缩放图片，只保证图片的短边能完全显示出来
   */
  mode?: "fill" | "cover" | "contain";
  /**
   * 源图片被截取部分左上角顶点的横坐标
   * cover模式下生效，默认长边局中显示
   */
  sx?: number;
  /**
   * 源图片被截取部分左上角顶点的纵坐标
   * cover模式下生效，默认长边局中显示
   */
  sy?: number;
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

export interface PaintText {
  type: "text";
  x: ((textWidth: number, instance: FreePoster) => number) | number;
  y: number;
  width: ((textWidth: number, instance: FreePoster) => number) | number;
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
  /** 文字装饰，只支持line-through */
  // textDecoration?: 'none' | 'line-through';
}

export type PosterItemConfig = PaintImage | PaintShape | PaintText;
