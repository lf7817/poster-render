import { CSSProperties } from "react";
import FreePoster, { DownloadLimit, PosterItemConfig } from "taro-free-poster";

interface PosterBaseProps {
  canvasId?: string;
  className?: string;
  style?: CSSProperties;
  width: number;
  height: number;
  debug?: boolean;
  /** 禁用二次渲染 */
  disableRerender?: boolean;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 图片并行下载数, 默认10 */
  downloadLimit?: DownloadLimit;
  /** 导出图片格式 */
  fileType?: "png" | "jpg";
  /** 图片质量 0-1，只对jpg生效 */
  quality?: number;
  list: PosterItemConfig[] | ((instance: FreePoster) => PosterItemConfig[]);
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
  /** 渲染方法 */
  render: (
    config?: PosterItemConfig[] | ((instance: FreePoster) => PosterItemConfig[])
  ) => Promise<string | undefined>;
}

export type PosterProps = PosterCanvasProps | PosterImageProps;
