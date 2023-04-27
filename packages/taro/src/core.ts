import {
  getFileSystemManager,
  env,
  base64ToArrayBuffer,
  FileSystemManager,
} from "@tarojs/taro";
import {
  hideLoading,
  showModal,
  openSetting,
  showToast,
  saveImageToPhotosAlbum,
  canvasToTempFilePath,
  type Canvas,
} from "@tarojs/taro";
import {
  preloadImage as sharedPreloadImage,
  clearCanvas,
  renderItem,
  DrawImageOptions,
  PosterItemConfig,
  PreloadImageItem,
} from "@poster-render/shared";
import type { PosterRenderCoreOptions } from "./types";
import {
  getCanvasElementById,
  isAlipay,
  isAndroid,
  isQiwei,
  isTT,
  isWeb,
  pixelRatio,
} from "./utils";
import Logger from "./utils/logger";

export class PosterRenderCore {
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
   * log
   */
  private logger: Logger;
  /**
   * 构造函数默认参数
   */
  private options: PosterRenderCoreOptions = {
    id: "taro-poster-render",
    debug: false,
    width: 300,
    height: 150,
    fileType: "png",
    quality: 1,
  };

  constructor(options: PosterRenderCoreOptions) {
    this.options = { ...this.options, ...options };

    if (!this.options.id) {
      throw new Error("[poster-render]: canvas id must be specified");
    }

    if (this.options.height >= 4096) {
      throw new Error("[poster-render]: height must be less than 4096");
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
        `[poster-render]: canvas id "${this.options.id}" not found`
      );
      return;
    }

    this.canvas = canvas;
    // @ts-ignore
    this.canvas.width = this.options.width * this.dpr;
    // @ts-ignore
    this.canvas.height = this.options.height * this.dpr;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    // 强烈建议在scale前加上这句（如果在onShow上生成海报必须要）
    this.ctx.resetTransform?.();
    // this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(this.dpr, this.dpr);
    // 绘制前清空画布
    this.clearCanvas();
    this.logger.info(
      "[poster-render]: 画布尺寸：",
      // @ts-ignore
      this.canvas.width,
      // @ts-ignore
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
    clearCanvas({ ctx: this.ctx, canvas: this.canvas });
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
              this.logger.info("[poster-render]: openSetting fail", failData);
            },
          });
      },
    });
  }

  /**
   * 保存到相册
   */
  public async savePosterToPhoto(): Promise<string> {
    this.logger.group("[poster-render]: 保存到相册");
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
          this.logger.info("H5不支持onSave事件");
          this.logger.groupEnd();
        } else {
          let filePath = tmp;
          if (isTT) {
            const tmpPath = `${env.USER_DATA_PATH}/poster-render.${
              this.options.fileType || "png"
            }`;
            const body = tmp.replace(/^data:image\/\w+;base64,/, "");
            const arrayBuffer = base64ToArrayBuffer(body);
            const writeFileError = await this.writeFile({
              filePath: tmpPath,
              data: arrayBuffer,
              encoding: "binary",
            });

            if (
              // @ts-ignore
              writeFileError?.errNo === 21103 ||
              // @ts-ignore
              writeFileError?.errNo === 21104
            ) {
              const rmdirError = await this.rmdir({
                dirPath: `${env.USER_DATA_PATH}`,
                recursive: true,
              });
              if (rmdirError) {
                this.logger.info("清理目录失败", rmdirError);
                this.logger.info("保存到相册失败", rmdirError);
                this.options?.onSaveFail?.(rmdirError);
                return reject(rmdirError);
              }

              this.logger.info("超出目录大小限制，已清理成功，请重新保存");
              return reject(writeFileError);
            }

            filePath = tmpPath;
          }

          saveImageToPhotosAlbum({
            filePath,
            success: () => {
              this.logger.info("保存到相册成功");
              this.options?.onSave?.(tmp);
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
   * 写文件
   * @param options
   * @returns
   */
  private async writeFile(
    options: FileSystemManager.WriteFileOption
  ): Promise<FileSystemManager.WriteFileFailCallbackResult | undefined> {
    return new Promise((resolve) => {
      getFileSystemManager().writeFile({
        ...options,
        success: () => resolve(undefined),
        fail: (error) => resolve(error),
      });
    });
  }

  private async rmdir(
    option: FileSystemManager.RmdirOption
  ): Promise<FileSystemManager.RmdirFailCallbackResult | undefined> {
    return new Promise((resolve) => {
      getFileSystemManager().rmdir({
        ...option,
        success: () => resolve(undefined),
        fail: (error) => resolve(error),
      });
    });
  }

  /**
   * 绘制图形
   * @param options
   */
  public async renderItem(options: PosterItemConfig) {
    this.logger.time(`绘制时间`);
    this.logger.info("开始绘制", options);
    const rtn = await renderItem(
      { ctx: this.ctx, canvas: this.canvas },
      options
    );
    this.logger.timeEnd(`绘制时间`);
    return rtn;
  }

  /**
   * 生成临时文件
   * @returns
   */
  public canvasToTempFilePath = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        this.logger.info("开始截取canvas图片");
        this.logger.time("截取canvas图片时间");
        if (isWeb || isTT) {
          try {
            // @ts-ignore
            const data = this.canvas.toDataURL(
              `image/${
                this.options.fileType === "jpg" ? "jpeg" : this.options.fileType
              }`,
              this.options.quality || 1
            );
            this.logger.info("截取canvas图片成功");
            this.logger.timeEnd("截取canvas图片时间");
            resolve(data);
          } catch (e) {
            this.logger.info("截取canvas目前的图像失败", e);
            reject(e);
          }
        } else {
          canvasToTempFilePath(
            // @ts-ignore
            {
              x: 0,
              y: 0,
              // @ts-ignore
              width: this.canvas.width,
              // @ts-ignore
              height: this.canvas.height,
              // @ts-ignore
              destWidth: this.options.destWidth ?? this.canvas.width,
              // @ts-ignore
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
    list:
      | PreloadImageItem[]
      | PosterItemConfig[]
      | ((instance: PosterRenderCore) => PosterItemConfig[])
  ): Promise<boolean> {
    this.logger.group("[poster-render]: 提前下载图片");
    this.logger.time("提前下载图片用时");

    let images: PreloadImageItem[] = [];

    if (Array.isArray(list)) {
      if (list.some((item: any) => typeof item !== "string")) {
        images = (list as PosterItemConfig[])
          .filter((item) => item.type === "image")
          .map((item) => ({
            src: (item as DrawImageOptions).src,
            cacheKey: (item as DrawImageOptions).cacheKey,
          }));
      } else {
        images = list as PreloadImageItem[];
      }
    } else if (typeof list === "function") {
      const configs = list(this) || [];
      images = configs
        .filter((item) => item.type === "image")
        .map((item) => ({
          src: (item as DrawImageOptions).src,
          cacheKey: (item as DrawImageOptions).cacheKey,
        }));
    }

    const rtn = await sharedPreloadImage(this.ctx, this.canvas, images);
    this.logger.timeEnd("提前下载图片用时");
    this.logger.groupEnd();
    return rtn;
  }

  public async render(
    list:
      | PosterItemConfig[]
      | ((instance: PosterRenderCore) => PosterItemConfig[]),
    type: "canvas" | "image" = "canvas"
  ) {
    this.logger.group("[poster-render]: 渲染");
    this.logger.time("渲染海报");
    const configs = Array.isArray(list) ? list : list(this);

    for await (const item of configs) {
      await this.renderItem(item);
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
    this.logger.timeEnd("渲染海报");
    this.logger.groupEnd();
  }
}
