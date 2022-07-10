import Taro from "@tarojs/taro";
import { FreePosterOptions, PaintImage, Radius } from "./types";
import { getCanvasElementById, isAlipay, isWeb, pixelRatio } from "./utils";

export class FreePoster {
  /**
   * Canvas 实例
   */
  private canvas: Taro.Canvas;
  /**
   * Canvas 绘图上下文
   */
  private ctx: CanvasRenderingContext2D;

  private images = new Map<string, HTMLImageElement | Taro.Image>();
  /**
   * 构造函数默认参数
   */
  private options: FreePosterOptions = {
    id: "taro-poster-render",
    debug: false,
    width: 300,
    height: 150,
    fileType: "png",
    quality: 1,
    disableHD: false,
  };

  constructor(options: Partial<FreePosterOptions>) {
    this.options = { ...this.options, ...options };
    if (this.options.height >= 4096) {
      throw new Error("[taro-poster-render]: height must be less than 4096");
    }
  }

  /**
   * 画布初始化
   */
  public async init() {
    const canvas = await getCanvasElementById(this.options.id);

    if (!canvas) {
      console.error(
        `[taro-poster-render]: canvas id "${this.options.id}" not found`
      );
      return;
    }
    // 是否开启高清模式
    const disableHD =
      this.options.disableHD || this.options.height * pixelRatio >= 4096;

    this.canvas = canvas;
    this.canvas.width =
      this.options.width * (disableHD || isAlipay ? 1 : pixelRatio);
    this.canvas.height =
      this.options.height * (disableHD || isAlipay ? 1 : pixelRatio);

    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    // 强烈建议在scale前加上这句（如果在onShow上生成海报必须要）
    this.ctx.resetTransform?.();
    // this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    if (!isAlipay && !disableHD) {
      this.ctx.scale(pixelRatio, pixelRatio);
    }
    // 绘制前清空画布
    this.clearCanvas();
    this.log(
      "[taro-poster-render]: 画布尺寸：",
      this.canvas.width,
      this.canvas.height
    );
  }

  /**
   * 清空画布
   */
  public clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * canvas绘制背景色
   */
  public async setCanvasBackground(canvasBackground: string) {
    if (canvasBackground) {
      this.time("渲染背景色");
      const color = canvasBackground;
      const { width, height } = this.options;
      this.log("设置canvas的背景色：", color);
      this.ctx.save();
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.restore();
      this.timeEnd("渲染背景色");
    }
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

  public log = (message?: any, ...optionalParams: any[]) => {
    if (this.options.debug) {
      console.log(message, ...optionalParams);
    }
  };

  public time = (message: string) => {
    if (this.options.debug) {
      console.time(message);
    }
  };

  public timeEnd = (message: string) => {
    if (this.options.debug) {
      console.timeEnd(message);
    }
  };

  private loadImage = async (
    url: string
  ): Promise<Taro.Image | HTMLImageElement | undefined> => {
    let retryCounter = 0;

    if (!url) {
      this.log("图像路径不能为空");
      return Promise.resolve(undefined);
    }

    if (this.images.has(url)) {
      return Promise.resolve(this.images.get(url));
    }

    // TODO 验证微信本地临时文件
    if (url.startsWith("wxfile://")) {
      //   try {
      //     Taro.getFileSystemManager().accessSync(url);
      //     const { width, height } = await Taro.getImageInfo({ src: url });
      //     const data = { width: width, height: height, url };
      //     this.images.set(url, data);
      //     return Promise.resolve(data);
      //   } catch (e) {
      //     this.log(e);
      //     this.log(`本地临时文件不存在`, url);
      //     return undefined;
      //   }
    }

    const downloadFile = async (resolve) => {
      this.time(`下载图片${url}用时`);
      const image = isWeb ? new Image() : this.canvas.createImage();

      image.onload = () => {
        this.timeEnd(`下载图片${url}用时`);
        retryCounter = 0;
        this.images.set(url, image);
        resolve(image);
      };
      image.onerror = async (e: any) => {
        if (++retryCounter <= 2) {
          this.log(`图片下载失败, 开始第${retryCounter}次重试`, url);
          await downloadFile(resolve);
        } else {
          this.timeEnd(`下载图片${url}用时`);
          this.log("三次尝试图片仍下载失败,放弃治疗", url, e);
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
    this.time("绘制图片时间");
    this.log("开始绘制图片", options);
    const { x, y, src, defaultSrc, width, height, backgroundColor } = options;
    const radius = this.normalizeRadius(options.radius);
    let image = await this.loadImage(src);

    if (!image && defaultSrc) {
      // 加载默认图片
      image = await this.loadImage(defaultSrc);
    }

    if (!image) {
      this.log(`图片${options.src}下载失败，跳过渲染`);
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
    this.timeEnd("绘制图片时间");
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
      this.log("处理图片失败，图片不存在");
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

  public canvasToTempFilePath = async (): Promise<string | undefined> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        this.log("开始截取canvas图片");
        this.time("截取canvas图片时间");
        if (isWeb) {
          resolve(
            this.canvas.toDataURL(
              `image/${
                this.options.fileType === "jpg" ? "jpeg" : this.options.fileType
              }`,
              this.options.quality
            )
          );
        } else {
          Taro.canvasToTempFilePath(
            {
              x: 0,
              y: 0,
              width: this.canvas.width,
              height: this.canvas.height,
              destWidth: this.options.destWidth ?? this.canvas.width,
              destHeight: this.options.destHeight ?? this.canvas.height,
              canvas: this.canvas,
              fileType: this.options.fileType,
              quality: this.options.quality,
              success: (res) => {
                const localUrl = isAlipay
                  ? (res as any).apFilePath
                  : res.tempFilePath;
                this.log("截取canvas图片成功", localUrl);
                this.timeEnd("截取canvas图片时间");
                resolve(localUrl);
              },
              fail: (err) => {
                this.log("截取canvas目前的图像失败", err);
                resolve(undefined);
              },
            },
            this
          );
        }
      }, 50);
    });
  };

  /**
   * 获取授权
   */
  private getAuth() {
    Taro.hideLoading();
    // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
    Taro.showModal({
      content: "需要您授权保存相册",
      confirmColor: "#E23A4E",
      showCancel: false,
      success: ({ confirm }) => {
        confirm &&
          Taro.openSetting({
            success(settingdata) {
              if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                Taro.showToast({
                  title: "获取权限成功,再操作一次",
                  icon: "none",
                  duration: 3000,
                });
              } else {
                Taro.showToast({
                  title: "获取权限失败，将无法保存到相册",
                  icon: "none",
                  duration: 3000,
                });
              }
            },
            fail(failData) {
              this.log("[taro-poster-render]: openSetting fail", failData);
            },
          });
      },
    });
  }

  /**
   * 保存到相册
   */
  public async savePosterToPhoto(): Promise<string> {
    this.log("开始保存到相册");
    return new Promise(async (resolve, reject) => {
      const tmp = await this.canvasToTempFilePath();
      if (tmp) {
        if (isWeb) {
          const link = document.createElement("a");
          //把a标签的href属性赋值到生成好了的url
          link.href = tmp;
          //通过a标签的download属性修改下载图片的名字
          link.download = `${new Date().getTime()}.${this.options.fileType}`;
          //让a标签的click函数，直接下载图片
          link.click();
        } else {
          Taro.saveImageToPhotosAlbum({
            filePath: tmp,
            success: () => {
              this.log("保存到相册成功");
              // this.options?.onSave?.(tmp);
              Taro.showToast({
                icon: "none",
                title: "已保存到相册，快去分享哟～",
              });
              resolve(tmp);
            },
            fail: (err) => {
              if (err.errMsg !== "saveImageToPhotosAlbum:fail cancel") {
                this.getAuth();
              }
              this.log("保存到相册失败");
              reject(err);
              // this.options?.onSaveFail?.(err);
            },
          });
        }
      } else {
        // this.options?.onSaveFail?.(e);
        this.log("保存到相册失败");
      }
    });
  }
}
