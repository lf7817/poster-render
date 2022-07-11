import { FreePoster } from "./FreePoster";

export interface FreePosterOptions {
  id: string;
  /**
   * 画布宽度
   */
  width: number;
  /**
   * 画布高度
   * canvas2d高度不能超过4096，超过会报错
   */
  height: number;
  /**
   * 是否开启调试模式
   */
  debug?: boolean;
  /**
   * 导出图片格式
   */
  fileType?: "png" | "jpg";
  /**
   * 图片质量 0-1，只对jpg生效
   */
  quality: number;
  /**
   * 输出的图片的宽度
   */
  destWidth?: number;
  /**
   * 输出的图片的高度
   */
  destHeight?: number;
  /**
   * 指定dpr
   * @desc 画布最终会被放大dpr倍，默认为系统dpr
   * 支付宝小程序不支持，固定为1，安卓下企微dpr为3时生成图片会报错，固定为1
   * 如果画布高度乘以dpr超过4096,则会取消放大
   */
  dpr?: number;
}

export type Radius = number | [number, number, number, number];
export type BaseLine = "top" | "middle" | "bottom";

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
   * 圆角所处圆的半径尺寸
   * 顺序：左上 -> 右上 -> 右下 -> 左下
   */
  radius?: Radius;
}

export interface PaintRect extends Common<"rect"> {
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

export interface PaintLine extends Common<"line"> {
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
}
