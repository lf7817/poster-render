import { getFileSystemManager } from "@tarojs/taro";
import {
  hideLoading,
  showModal,
  openSetting,
  showToast,
  saveImageToPhotosAlbum,
  canvasToTempFilePath,
  type Canvas,
  type Image,
} from "@tarojs/taro";
import type {
  BaseLine,
  FreePosterOptions,
  PaintImage,
  PaintLine,
  PaintRect,
  PaintText,
  Radius,
  PosterItemConfig,
} from "./types";
import {
  getCanvasElementById,
  isAlipay,
  isAndroid,
  isQiwei,
  isWeb,
  pixelRatio,
} from "./utils";
import Logger from "./utils/logger";

export class FreePoster {
  /**
   * Canvas 实例
   */
  private canvas: Canvas;
  /**
   * dpr
   */
  private dpr: number = 1;
  /**
   * Canvas 绘图上下文
   */
  private ctx: CanvasRenderingContext2D;
  /**
   * 图片缓存
   */
  private images = new Map<string, HTMLImageElement | Image>();
  /**
   * log
   */
  private logger: Logger;
  /**
   * 构造函数默认参数
   */
  private options: FreePosterOptions = {
    id: "",
    debug: false,
    width: 300,
    height: 150,
    fileType: "png",
    quality: 1,
  };

  constructor(options: FreePosterOptions) {
    this.options = { ...this.options, ...options };

    if (!this.options.id) {
      throw new Error("[taro-free-poster]: canvas id must be specified");
    }

    if (this.options.height >= 4096) {
      throw new Error("[taro-free-poster]: height must be less than 4096");
    }

    this.dpr = this.calculateDpr();
    this.logger = new Logger(!!this.options.debug);
  }

  /**
   * 画布初始化
   */
  public async init() {
    const canvas = await getCanvasElementById(this.options.id);

    if (!canvas) {
      console.error(
        `[taro-free-poster]: canvas id "${this.options.id}" not found`
      );
      return;
    }

    this.canvas = canvas;
    this.canvas.width = this.options.width * this.dpr;
    this.canvas.height = this.options.height * this.dpr;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    // 强烈建议在scale前加上这句（如果在onShow上生成海报必须要）
    this.ctx.resetTransform?.();
    // this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(this.dpr, this.dpr);
    // 绘制前清空画布
    this.clearCanvas();
    this.logger.info(
      "[taro-free-poster]: 画布尺寸：",
      this.canvas.width,
      this.canvas.height
    );
  }

  /**
   * 计算dpr，确保不报错
   */
  private calculateDpr() {
    // 支付宝不支持高清模式， 安卓企微暂不支持高清模式，dpr大于3导出图片会报错
    const notSupport = isAlipay || (isQiwei && isAndroid);
    const dpr = this.options.dpr ?? pixelRatio;
    // 画布高度超过4096导出图片会报错
    const overLimit = this.options.height * dpr >= 4096;
    return overLimit || notSupport ? 1 : dpr;
  }

  /**
   * 清空画布
   */
  public clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 获取授权
   */
  private getAuth() {
    hideLoading();
    // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
    showModal({
      content: "需要您授权保存相册",
      confirmColor: "#E23A4E",
      showCancel: false,
      success: ({ confirm }) => {
        confirm &&
          openSetting({
            success(settingdata) {
              if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                showToast({
                  title: "获取权限成功,再操作一次",
                  icon: "none",
                  duration: 3000,
                });
              } else {
                showToast({
                  title: "获取权限失败，将无法保存到相册",
                  icon: "none",
                  duration: 3000,
                });
              }
            },
            fail(failData) {
              this.logger.info(
                "[taro-free-poster]: openSetting fail",
                failData
              );
            },
          });
      },
    });
  }

  /**
   * 保存到相册
   */
  public async savePosterToPhoto(): Promise<string> {
    this.logger.group("[taro-free-poster]: 保存到相册");
    return new Promise(async (resolve, reject) => {
      try {
        const tmp = await this.canvasToTempFilePath();
        if (isWeb) {
          const link = document.createElement("a");
          //把a标签的href属性赋值到生成好了的url
          link.href = tmp;
          //通过a标签的download属性修改下载图片的名字
          link.download = `${new Date().getTime()}.${this.options.fileType}`;
          //让a标签的click函数，直接下载图片
          link.click();
          this.logger.groupEnd();
        } else {
          saveImageToPhotosAlbum({
            filePath: tmp,
            success: () => {
              this.logger.info("保存到相册成功");
              this.options?.onSave?.(tmp);
              showToast({
                icon: "none",
                title: "已保存到相册，快去分享哟～",
              });
              resolve(tmp);
            },
            fail: (err) => {
              if (err.errMsg !== "saveImageToPhotosAlbum:fail cancel") {
                this.getAuth();
              }
              this.logger.info("保存到相册失败");
              reject(err);
              this.options?.onSaveFail?.(err);
            },
            complete: () => {
              this.logger.groupEnd();
            },
          });
        }
      } catch (err) {
        this.options?.onSaveFail?.(err);
        this.logger.info("保存到相册失败");
        this.logger.groupEnd();
      }
    });
  }

  /**
   * 解析圆角半径
   * @param radius
   * @desc 老版本canvas圆角半径小于2的话安卓会出问题，新版本待测
   */
  private normalizeRadius(radius: Radius = 2) {
    if (typeof radius === "number") {
      return {
        topLeft: radius,
        topRight: radius,
        bottomLeft: radius,
        bottomRight: radius,
      };
    }
    if (Array.isArray(radius)) {
      // TODO: 验证安卓新版canvas圆角半径小于2的问题
      return {
        topLeft: Math.max(radius[0], 2),
        topRight: Math.max(radius[1], 2),
        bottomRight: Math.max(radius[2], 2),
        bottomLeft: Math.max(radius[3], 2),
      };
    }
    return {
      topLeft: 2,
      topRight: 2,
      bottomLeft: 2,
      bottomRight: 2,
    };
  }

  private loadImage = async (
    url: string
  ): Promise<Image | HTMLImageElement | undefined> => {
    let retryCounter = 0;

    if (!url) {
      this.logger.info("图像路径不能为空");
      return Promise.resolve(undefined);
    }

    if (this.images.has(url)) {
      return Promise.resolve(this.images.get(url));
    }

    if (url.startsWith("wxfile://")) {
      try {
        getFileSystemManager().accessSync(url);
      } catch (e) {
        this.logger.info(`[taro-free-poster]: wxfile文件不存在`);
        return Promise.resolve(undefined);
      }
    }

    const downloadFile = async (resolve) => {
      this.logger.time(`下载图片${url}用时`);
      const image = isWeb ? new Image() : this.canvas.createImage();

      image.onload = () => {
        this.logger.timeEnd(`下载图片${url}用时`);
        retryCounter = 0;
        this.images.set(url, image);
        resolve(image);
      };
      image.onerror = async (e: any) => {
        if (++retryCounter <= 2) {
          this.logger.info(`图片下载失败, 开始第${retryCounter}次重试`, url);
          await downloadFile(resolve);
        } else {
          this.logger.timeEnd(`下载图片${url}用时`);
          this.logger.info("三次尝试图片仍下载失败,放弃治疗", url, e);
          resolve(undefined);
        }
      };

      if (isWeb) {
        // 解决h5跨域问题
        (image as HTMLImageElement).setAttribute("crossOrigin", "Anonymous");
      }

      // 支持base64、http(s)
      image.src = url;
    };

    return new Promise(async (resolve) => {
      await downloadFile(resolve);
    });
  };

  /**
   * 绘制图片
   * @param options
   */
  public async paintImage(options: Omit<PaintImage, "type">) {
    this.logger.time("绘制图片时间");
    this.logger.info("开始绘制图片", options);
    const { x, y, src, defaultSrc, width, height, backgroundColor } = options;
    const radius = this.normalizeRadius(options.radius);
    let image = await this.loadImage(src);

    if (!image && defaultSrc) {
      // 加载默认图片
      image = await this.loadImage(defaultSrc);
    }

    if (!image) {
      this.logger.info(`图片${options.src}下载失败，跳过渲染`);
      return;
    }

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius.topLeft, y);
    // 绘制上边
    this.ctx.lineTo(x + width - radius.topRight, y);
    // 绘制右上角圆弧
    this.ctx.arcTo(
      x + width,
      y,
      x + width,
      y + radius.topRight,
      radius.topRight
    );
    // 绘制右边
    this.ctx.lineTo(x + width, y + height - radius.bottomRight);
    // 绘制右下角圆弧
    this.ctx.arcTo(
      x + width,
      y + height,
      x + width - radius.bottomRight,
      y + height,
      radius.bottomRight
    );
    // 绘制下边
    this.ctx.lineTo(x + radius.bottomLeft, y + height);
    // 绘制左下角圆弧
    this.ctx.arcTo(
      x,
      y + height,
      x,
      y + height - radius.bottomLeft,
      radius.bottomLeft
    );
    // 绘制左边
    this.ctx.lineTo(x, y + radius.topLeft);
    // 绘制左上角圆弧
    this.ctx.arcTo(x, y, x + radius.topLeft, y, radius.topLeft);
    this.ctx.closePath();
    this.ctx.clip();
    if (backgroundColor) {
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fill();
    }
    this.fitImage(options);
    this.ctx.restore();
    this.logger.timeEnd("绘制图片时间");
  }

  /**
   * 图片处理
   * @see https://www.cnblogs.com/AIonTheRoad/p/14063041.html
   * @param options
   */
  private fitImage(options: Omit<PaintImage, "type">) {
    const image =
      this.images.get(options.src) || this.images.get(options.defaultSrc!);

    if (!image) {
      this.logger.info("处理图片失败，图片不存在");
      return;
    }

    const mode = options.mode || "fill";
    // 图片宽高比
    const imageRatio = image.width / image.height;
    // 绘制区域宽高比
    const rectRatio = options.width / options.height;
    let sw: number,
      sh: number,
      sx: number,
      sy: number,
      dx: number,
      dy: number,
      dw: number,
      dh: number;

    if (mode === "contain") {
      if (imageRatio <= rectRatio) {
        dh = options.height;
        dw = dh * imageRatio;
        dx = options.x + (options.width - dw) / 2;
        dy = options.y;
      } else {
        dw = options.width;
        dh = dw / imageRatio;
        dx = options.x;
        dy = options.y + (options.height - dh) / 2;
      }
      this.ctx.drawImage(image as CanvasImageSource, dx, dy, dw, dh);
    } else if (mode === "cover") {
      if (imageRatio <= rectRatio) {
        sw = image.width;
        sh = sw / rectRatio;
        sx = 0;
        sy = (image.height - sh) / 2;
      } else {
        sh = image.height;
        sw = sh * rectRatio;
        sx = (image.width - sw) / 2;
        sy = 0;
      }
      this.ctx.drawImage(
        image as CanvasImageSource,
        options.sx ?? sx,
        options.sy ?? sy,
        sw,
        sh,
        options.x,
        options.y,
        options.width,
        options.height
      );
    } else {
      this.ctx.drawImage(
        image as CanvasImageSource,
        options.x,
        options.y,
        options.width,
        options.height
      );
    }
  }

  /**
   * 绘制矩形
   * @param options
   */
  public async paintRect(options: Omit<PaintRect, "type">) {
    this.logger.time("绘制图形时间");
    this.logger.info("开始绘制图形", options);
    const radius = this.normalizeRadius(options.radius);
    const { x, y, width, height, borderWidth, borderColor, backgroundColor } =
      options;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius.topLeft, y);
    // 绘制上边
    this.ctx.lineTo(x + width - radius.topRight, y);
    // 绘制右上角圆弧
    this.ctx.arcTo(
      x + width,
      y,
      x + width,
      y + radius.topRight,
      radius.topRight
    );
    // 绘制右边
    this.ctx.lineTo(x + width, y + height - radius.bottomRight);
    // 绘制右下角圆弧
    this.ctx.arcTo(
      x + width,
      y + height,
      x + width - radius.bottomRight,
      y + height,
      radius.bottomRight
    );
    // 绘制下边
    this.ctx.lineTo(x + radius.bottomLeft, y + height);
    // 绘制左下角圆弧
    this.ctx.arcTo(
      x,
      y + height,
      x,
      y + height - radius.bottomLeft,
      radius.bottomLeft
    );
    // 绘制左边
    this.ctx.lineTo(x, y + radius.topLeft);
    // 绘制左上角圆弧
    this.ctx.arcTo(x, y, x + radius.topLeft, y, radius.topLeft);
    this.ctx.closePath();

    if (backgroundColor) {
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fill();
    }

    if (borderColor && borderWidth) {
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = borderWidth;
      this.ctx.stroke();
    }

    this.ctx.restore();
    this.logger.timeEnd("绘制图形时间");
  }

  /**
   * 绘制文字
   * @param options
   */
  public async paintText(options: Omit<PaintText, "type">) {
    this.logger.time("绘制文字时间");
    this.logger.info("开始绘制文字", options);
    const {
      textAlign = "left",
      opacity = 1,
      lineNum = 1,
      lineHeight = 0,
      baseLine = "top",
      fontWeight = "normal",
      fontStyle = "normal",
      fontFamily = "sans-serif",
      textDecoration,
    } = options;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.font = `${fontStyle} ${fontWeight} ${options.fontSize}px ${fontFamily}`;
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = options.color;
    this.ctx.textAlign = textAlign;
    this.ctx.textBaseline = baseLine;

    let textWidth: number = this.measureText(options.text, {
      fontSize: options.fontSize,
      fontFamily,
      fontStyle,
      fontWeight,
      baseLine,
    }).width;
    const width =
      typeof options.width === "number"
        ? options.width
        : options.width(textWidth, this);
    const x =
      typeof options.x === "number" ? options.x : options.x(textWidth, this);

    const textArr: string[] = [];
    if (textWidth > width) {
      // 文本宽度 大于 渲染宽度
      let fillText = "";
      let line = 1;
      for (let i = 0; i <= options.text.length - 1; i++) {
        // 将文字转为数组，一行文字一个元素
        fillText = fillText + options.text[i];
        if (
          this.measureText(fillText, {
            fontSize: options.fontSize,
            fontFamily,
            fontStyle,
            fontWeight,
            baseLine,
          }).width >= width
        ) {
          if (line === lineNum) {
            if (i !== options.text.length - 1) {
              fillText = fillText.substring(0, fillText.length - 1) + "...";
            }
          }
          if (line <= lineNum) {
            textArr.push(fillText);
          }
          fillText = "";
          line++;
        } else {
          if (line <= lineNum) {
            if (i === options.text.length - 1) {
              textArr.push(fillText);
            }
          }
        }
      }
      textWidth = width;
    } else {
      textArr.push(options.text);
    }

    textArr.forEach((item, index) => {
      const y = options.y + (lineHeight || options.fontSize) * index;
      this.ctx.fillText(item, x, y);
      const {
        width,
        actualBoundingBoxAscent = 0,
        actualBoundingBoxDescent = 0,
      } = this.measureText(item, {
        fontSize: options.fontSize,
        fontFamily,
        fontStyle,
        fontWeight,
        baseLine,
      });

      const actualHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;

      if (textDecoration) {
        const deltaY = this.calcTextDecorationPosition(actualHeight, options);
        this.ctx.moveTo(x, y + deltaY);
        this.ctx.lineTo(x + width, y + deltaY);
        this.ctx.lineWidth = options.textDecorationWidth ?? 2;
        this.ctx.strokeStyle = options.color;
        this.ctx.stroke();
      }
    });
    this.ctx.closePath();
    this.ctx.restore();
    this.logger.timeEnd("绘制文字时间");
    return textWidth;
  }

  /**
   * 绘制线
   * @param options
   */
  public async paintLine(options: Omit<PaintLine, "type">) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(options.x, options.y);
    this.ctx.lineTo(options.destX, options.destY);
    this.ctx.closePath();
    this.ctx.lineWidth = options.lineWidth;
    this.ctx.strokeStyle = options.color;
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * 计算TextDecoration位置
   * @param options
   */
  private calcTextDecorationPosition(
    actualHeight: number,
    options: Omit<PaintText, "type">
  ): number {
    const { fontSize, textDecoration, baseLine = "top" } = options;
    const height = actualHeight || fontSize;
    let deltaY = 0;

    if (baseLine === "top") {
      if (textDecoration === "overline") {
        deltaY = 0;
      } else if (textDecoration === "underline") {
        deltaY = height;
      } else {
        deltaY = height / 2;
      }
    } else if (baseLine === "bottom") {
      if (textDecoration === "overline") {
        deltaY = -height;
      } else if (textDecoration === "underline") {
        deltaY = 0;
      } else {
        deltaY = -height / 2;
      }
    } else {
      if (textDecoration === "overline") {
        deltaY = -height / 2;
      } else if (textDecoration === "underline") {
        deltaY = height / 2;
      } else {
        deltaY = 0;
      }
    }

    return deltaY;
  }

  /**
   * 计算文本宽度
   * @param text
   */
  public measureText(
    text: string,
    options?: {
      baseLine?: BaseLine;
      fontSize: number;
      fontWeight?: string;
      fontStyle?: string;
      fontFamily?: string;
    }
  ): TextMetrics {
    this.ctx.save();

    if (options) {
      const {
        fontStyle = "normal",
        fontFamily = "normal",
        fontWeight = "normal",
        fontSize,
        baseLine = "top",
      } = options;
      this.ctx.textBaseline = baseLine;
      this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    }

    const textMetrics = this.ctx.measureText(text);
    this.ctx.restore();

    return textMetrics;
  }

  public canvasToTempFilePath = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        this.logger.info("开始截取canvas图片");
        this.logger.time("截取canvas图片时间");
        if (isWeb) {
          try {
            const data = this.canvas.toDataURL(
              `image/${
                this.options.fileType === "jpg" ? "jpeg" : this.options.fileType
              }`,
              this.options.quality || 1
            );
            resolve(data);
            this.logger.info("截取canvas图片成功", data);
            this.logger.timeEnd("截取canvas图片时间");
          } catch (e) {
            this.logger.info("截取canvas目前的图像失败", e);
            reject(e);
          }
        } else {
          canvasToTempFilePath(
            {
              x: 0,
              y: 0,
              width: this.canvas.width,
              height: this.canvas.height,
              destWidth: this.options.destWidth ?? this.canvas.width,
              destHeight: this.options.destHeight ?? this.canvas.height,
              canvas: this.canvas as any,
              fileType: this.options.fileType,
              quality: this.options.quality,
              success: (res) => {
                const localUrl = isAlipay
                  ? (res as any).apFilePath
                  : res.tempFilePath;
                this.logger.info("截取canvas图片成功", localUrl);
                this.logger.timeEnd("截取canvas图片时间");
                resolve(localUrl);
              },
              fail: (err) => {
                this.logger.info("截取canvas目前的图像失败", err);
                reject(err);
              },
            },
            this
          );
        }
      }, 50);
    });
  };

  /**
   * 提前下载图片
   * @param images
   * @returns boolean 有一张图下载失败都会返回false,但不会阻塞后续图片下载
   */
  public async preloadImage(
    list: PosterItemConfig[] | ((instance: FreePoster) => PosterItemConfig[])
  ): Promise<boolean> {
    this.logger.group("[taro-free-poster]: 提前下载图片");
    this.logger.time("提前下载图片用时");

    const configs = Array.isArray(list) ? list : list(this);
    const images = configs.reduce((arr, item) => {
      if (item.type === "image") {
        arr.push(item.src);
      }
      return arr;
    }, [] as string[]);

    const needLoadImages = Array.from(
      new Set(images.filter((item) => !this.images.has(item)))
    );
    const loadedImages = await Promise.all(
      needLoadImages.map((item) => this.loadImage(item))
    );
    this.logger.timeEnd("提前下载图片用时");
    this.logger.groupEnd();
    return !loadedImages.includes(undefined);
  }

  public async render(
    list: PosterItemConfig[] | ((instance: FreePoster) => PosterItemConfig[]),
    type: "canvas" | "image" = "canvas"
  ) {
    const funcMap = {
      text: "paintText",
      line: "paintLine",
      image: "paintImage",
      rect: "paintRect",
    };
    this.logger.group("[taro-free-poster]: 渲染");
    this.logger.time("渲染海报完成");
    const configs = Array.isArray(list) ? list : list(this);

    this.clearCanvas();

    for await (const item of configs) {
      if (!funcMap[item.type]) {
        const error = new Error(`[taro-free-poster]: ${item.type}类型不存在`);
        this.options?.onRenderFail?.(error);
        throw error;
      }

      await this[funcMap[item.type]]?.(item);
    }

    if (type === "image") {
      try {
        const tmp = await this.canvasToTempFilePath();
        this.options?.onRender?.(tmp);
      } catch (e) {
        this.options?.onRenderFail?.(e);
      }
    } else {
      this.options?.onRender?.();
    }
    this.logger.timeEnd("渲染海报完成");
    this.logger.groupEnd();
  }
}
