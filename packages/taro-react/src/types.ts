import { CSSProperties } from "react";
import { type PosterItemConfig, PosterRenderCore } from "@poster-render/taro/src";

export interface PosterRenderBaseProps {
  /** canvasId，当有多个canvas时，需要指定canvasId，否则默认为第一个canvas */
  canvasId?: string;
  /** 画布宽度, 注意不是css width */
  canvasWidth: number;
  /** 画布高度, 高度不要超过4096（报错）， 注意不是css height */
  canvasHeight: number;
  /** 输出的图片的宽度 */
  destWidth?: number;
  /** 输出的图片的高度 */
  destHeight?: number;
  /**
   * 指定dpr
   * @desc 默认组件会启用高清方案，画布最终会被放大dpr倍（默认为系统dpr），
   * 但是某些场景画布太大会报错，或者画布太大导致生成图片太慢，这种情况可以
   * 指定dpr调整画布大小解决问题；
   * 支付宝小程序不支持，固定为1，安卓下企微dpr为3时生成图片会报错，固定为1
   * 如果画布高度乘以dpr超过4096,则会取消放大
   */
  dpr?: number;
  /** 导出图片格式 */
  fileType?: "png" | "jpg";
  /** 图片质量 0-1，只对jpg生效 */
  quality?: number;
  /** 是否开启debug */
  debug?: boolean;
  /** 禁用二次渲染 */
  disableRerender?: boolean;
  /** 配置列表 */
  list:
    | PosterItemConfig[]
    | ((instance: PosterRenderCore) => PosterItemConfig[]);
  /** 保存海报成功回调，h5不支持 */
  onSave?: (url: string) => void;
  /** 保存海报失败回调 */
  onSaveFail?: (err?: any) => void;
  /** 渲染失败回调 */
  onRenderFail?: (err?: any) => void;
}

export interface PosterRenderImageProps extends PosterRenderBaseProps {
  /** 渲染类型，默认canvas */
  renderType: "image";
  /** image classname */
  className?: string;
  /** image style */
  style?: CSSProperties;
  /**
   * 想要实现长按识别二维码场景，可以启用该属性，
   */
  showMenuByLongpress?: boolean;
  /**
   * 长按事件回调
   */
  onLongTap?: (url: string) => void;
  /** 渲染成功回调 */
  onRender?: (url: string) => void;
}

export interface PosterRenderCanvasProps extends PosterRenderBaseProps {
  /** 渲染类型，默认canvas */
  renderType: "canvas";
  /** canvas classname */
  className?: string;
  /** canvas style */
  style?: CSSProperties;
  /**
   * 长按事件回调
   */
  onLongTap?: () => void;
  /** 渲染成功回调 */
  onRender?: () => void;
}

export type PosterRenderProps =
  | PosterRenderImageProps
  | PosterRenderCanvasProps;

export interface PosterRenderRef {
  /** 保存到相册 */
  savePosterToPhoto: () => Promise<string | undefined>;
  /** 预览图片 */
  preview: () => Promise<void>;
  /** 渲染方法 */
  render: (
    config?:
      | PosterItemConfig[]
      | ((instance: PosterRenderCore) => PosterItemConfig[])
  ) => Promise<void>;
}
