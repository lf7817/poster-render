export type Radius = number | [number, number, number, number];
export type BaseLine = "top" | "middle" | "bottom";

export interface DrawImageOptions {
  /** 图形左定点相对canvas左上角的x坐标 */
  x: number;
  /** 图形左定点相对canvas左上角的y坐标 */
  y: number;
  width: number;
  height: number;
  /** 图片路径，支持https、wxfile协议 */
  src: string;
  /** 默认图片，src下载失败时采用 */
  defaultSrc?: string;
  /**
   * 图片缓存key，不填时使用src做缓存key，如果使用base64时建议指定cacheKey, 不指定的话
   * 用base64做Map键不知道能不能撑住
   */
  cacheKey?: string;
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
   * 圆角所处圆的半径尺寸
   * 顺序：左上 -> 右上 -> 右下 -> 左下
   */
  radius?: Radius;
}

export interface DrawRectOptions {
  /** 图形左定点相对canvas左上角的x坐标 */
  x: number;
  /** 图形左定点相对canvas左上角的y坐标 */
  y: number;
  /** 矩形宽 */
  width: number;
  /** 矩形高 */
  height: number;
  /** 圆角度数，如果要绘制圆形，宽高一致，radius设为宽一半 */
  radius?: Radius;
  /** 线颜色 */
  borderColor?: string;
  /** 线宽 */
  borderWidth?: number;
  /** 背景色 */
  backgroundColor?: string;
  /** 设置虚线 */
  lineDash?: number[];
  /** 设置虚线偏移量 */
  lineDashOffset?: number;
}

export interface DrawLineOptions {
  /** 起始点x */
  x: number;
  /** 起始点y */
  y: number;
  /** 目标点x */
  destX: number;
  /** 目标点y */
  destY: number;
  /** 线颜色 */
  color: string;
  /** 线宽 */
  lineWidth: number;
  /**
   * 设置虚线
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash
   */
  lineDash?: number[];
  /** 设置虚线偏移量 */
  lineDashOffset?: number;
  /** 线段末端的属性，默认butt
   * butt - 线段末端以方形结束
   * round - 线段末端以圆形结束
   * square - 线段末端以方形结束，但是增加了一个宽度和线段相同，高度是线段厚度一半的矩形区域
   */
  lineCap?: "butt" | "round" | "square";
}

export interface MeasureTextOptions {
  baseLine?: BaseLine;
  fontSize: number;
  fontWeight?: string;
  fontStyle?: string;
  fontFamily?: string;
}

export interface DownloadImageOptions {
  src: string;
  ctx: CanvasRenderingContext2D;
  canvas: any;
  cacheKey?: string;
}

export type MeasureTextFunc = (
  text: string,
  options?: MeasureTextOptions
) => TextMetrics;

export interface DrawTextOptions {
  x: ((textWidth: number, measureText: MeasureTextFunc) => number) | number;
  y: number;
  width: ((textWidth: number, measureText: MeasureTextFunc) => number) | number;
  height: number;
  text: string;
  /** 文字对齐方式 */
  textAlign?: "left" | "center" | "right";
  fontWeight?: "normal" | "bold";
  color: string;
  fontSize: number;
  lineHeight?: number;
  /**
   * 文本基线的属性, 默认top
   */
  baseLine?: BaseLine;
  opacity?: number;
  lineNum?: number;
  fontStyle?: "normal" | "italic" | "oblique";
  fontFamily?: string;
  /** 文字装饰线,下划线、上划线、删除线 */
  textDecoration?: "line-through" | "underline" | "overline";
  /** 文字装饰线宽 */
  textDecorationWidth?: number;
}

export interface PaintImage extends DrawImageOptions {
  type: "image";
}

export interface PaintText extends DrawTextOptions {
  type: "text";
}

export interface PaintLine extends DrawLineOptions {
  type: "line";
}

export interface PaintRect extends DrawRectOptions {
  type: "rect";
}

export interface CommonParams {
  ctx: CanvasRenderingContext2D;
  canvas: any;
}

export type PosterItemConfig = PaintRect | PaintLine | PaintText | PaintImage;

export interface PreloadImageItem {
  /**
   * 图片路径
   */
  src: string;
  /**
   * 缓存key
   */
  cacheKey?: string;
}
