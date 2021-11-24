import { FreePosterOptions, PaintImage, PaintShape, PaintText, PosterItemConfig } from './types';
export default class FreePoster {
    private ctx;
    private options;
    constructor(options: Partial<FreePosterOptions>);
    /**
     * canvas绘制背景色
     */
    setCanvasBackground(canvasBackground: any): void;
    private toPx;
    private toRpx;
    /**
     * 下载图片
     * @param src
     * @private
     */
    private loadImage;
    /**
     * 绘制图片
     * @param options
     */
    paintImage(options: Omit<PaintImage, 'type'>): Promise<void>;
    /**
     * 绘制shape
     * @param options
     */
    paintShape(options: Omit<PaintShape, 'type'>): Promise<void>;
    /**
     * 绘制文字
     * @param options
     */
    paintText(options: Omit<PaintText, 'type'>): number;
    /**
     * 生成临时文件
     */
    canvasToTempFilePath(): Promise<string>;
    /**
     * 保存到相册
     */
    savePosterToPhoto(): Promise<string>;
    /**
     * 获取授权
     */
    private getAuth;
    exec: (options: PosterItemConfig) => any;
}
