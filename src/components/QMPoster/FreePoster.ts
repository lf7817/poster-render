import Taro, { CanvasContext } from "@tarojs/taro";
import {
  FreePosterOptions,
  PaintImage,
  PaintShape,
  PaintText,
  PosterItemConfig,
} from "./types";

const { screenWidth } = Taro.getSystemInfoSync();

export default class FreePoster {
  private ctx: CanvasContext;
  private options: FreePosterOptions = {
    canvasId: "posterCanvasId",
    debug: true,
    width: 750,
    height: 1334,
    quality: 1,
  };

  constructor(options: Partial<FreePosterOptions>) {
    this.options = Object.assign(this.options, options);
    this.ctx = Taro.createCanvasContext(this.options.canvasId, this);
  }

  /**
   * canvas绘制背景色
   */
  public async setCanvasBackground(canvasBackground) {
    if (canvasBackground) {
      const color = canvasBackground;
      const { width, height, debug } = this.options;
      if (debug) console.log("canvas的背景色为：", color);
      this.ctx.save();
      this.ctx.setFillStyle(color);
      this.ctx.fillRect(0, 0, width, height);
      await this.draw(true);
      this.ctx.restore();
    }
  }

  private toPx(rpx: number) {
    // 这里要取整，否则安卓会出问题
    return Math.round((screenWidth / 750) * rpx);
  }

  private toRpx(px: number) {
    return Math.round(px / (screenWidth / 750));
  }

  /**
   * 下载图片
   * @param src
   * @private
   */
  private async loadImage(url: string): Promise<string> {
    if (this.options.debug) {
      this.log("开始下载图片", url);
      console.time("图片下载时间");
    }
    return new Promise(async (resolve, reject) => {
      try {
        const localUrl = await Taro.downloadFile({ url });
        if (this.options.debug) {
          this.log("图片下载成功", url);
          console.timeEnd("图片下载时间");
        }
        resolve((localUrl as any).tempFilePath);
      } catch (e) {
        this.log("图片下载失败", url);
        reject(e);
      }
    });
  }

  /**
   * 绘制图片
   * @param options
   */
  public async paintImage(options: Omit<PaintImage, "type">) {
    this.log("开始绘制图片", options);

    const { x, y, width, height, radius = 2, src, backgroundColor } = options;
    const [r1, r2, r3, r4] =
      typeof radius === "string"
        ? radius.split(" ").map((item) => Number(item))
        : new Array<number>(4).fill(radius);

    const newSrc = await this.loadImage(src);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(this.toPx(x + r1), this.toPx(y));
    this.ctx.arcTo(
      this.toPx(x + width),
      this.toPx(y),
      this.toPx(x + width),
      this.toPx(y + height),
      // 圆角小于2的话安卓会出问题
      this.toPx(Math.max(r2, 2))
    );
    this.ctx.arcTo(
      this.toPx(x + width),
      this.toPx(y + height),
      this.toPx(x),
      this.toPx(y + height),
      this.toPx(Math.max(r3, 2))
    );
    this.ctx.arcTo(
      this.toPx(x),
      this.toPx(y + height),
      this.toPx(x),
      this.toPx(y),
      this.toPx(Math.max(r4, 2))
    );
    this.ctx.arcTo(
      this.toPx(x),
      this.toPx(y),
      this.toPx(x + width),
      this.toPx(y),
      this.toPx(Math.max(r1, 2))
    );
    this.ctx.closePath();
    this.ctx.clip();
    if (backgroundColor) {
      this.ctx.setFillStyle(backgroundColor);
      this.ctx.fill();
    }
    this.ctx.drawImage(
      newSrc,
      this.toPx(x),
      this.toPx(y),
      this.toPx(width),
      this.toPx(height)
    );
    await this.draw(true);
    this.ctx.restore();
  }

  /**
   * 绘制shape
   * @param options
   */
  public async paintShape(options: Omit<PaintShape, "type">) {
    const {
      x,
      y,
      width,
      height,
      radius = 2,
      fillStyle,
      lineWidth,
      strokeStyle,
    } = options;
    const [r1, r2, r3, r4] =
      typeof radius === "string"
        ? radius.split(" ").map((item) => Number(item))
        : new Array<number>(4).fill(radius);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(this.toPx(x + r1), this.toPx(y));

    this.ctx.arcTo(
      this.toPx(x + width),
      this.toPx(y),
      this.toPx(x + width),
      this.toPx(y + height),
      this.toPx(Math.max(r2, 2))
    );

    this.ctx.arcTo(
      this.toPx(x + width),
      this.toPx(y + height),
      this.toPx(x),
      this.toPx(y + height),
      this.toPx(Math.max(r3, 2))
    );
    this.ctx.arcTo(
      this.toPx(x),
      this.toPx(y + height),
      this.toPx(x),
      this.toPx(y),
      this.toPx(Math.max(r4, 2))
    );
    this.ctx.arcTo(
      this.toPx(x),
      this.toPx(y),
      this.toPx(x + width),
      this.toPx(y),
      this.toPx(Math.max(r1, 2))
    );
    this.ctx.closePath();
    this.ctx.clip();

    if (fillStyle) {
      this.ctx.setFillStyle(fillStyle);
      this.ctx.fill();
    }

    if (lineWidth && strokeStyle) {
      this.ctx.setStrokeStyle(strokeStyle);
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }

    await this.draw(true);
    this.ctx.restore();
  }

  /**
   * 绘制文字
   * @param options
   */
  public async paintText(options: Omit<PaintText, "type">) {
    const {
      textAlign = "left",
      opacity = 1,
      lineNum = 1,
      lineHeight = 0,
      fontWeight = "normal",
      fontStyle = "normal",
      fontFamily = "sans-serif",
    } = options;
    this.ctx.save();
    this.ctx.font =
      fontStyle +
      " " +
      fontWeight +
      " " +
      this.toPx(options.fontSize) +
      "px " +
      fontFamily;
    this.ctx.setGlobalAlpha(opacity);
    this.ctx.setFillStyle(options.color);
    this.ctx.setTextBaseline(options.baseLine);
    this.ctx.setTextAlign(textAlign);
    // measureText返回的是px
    let textWidth: number = this.toRpx(
      this.ctx.measureText(options.text).width
    );
    const textArr: string[] = [];
    if (textWidth > options.width) {
      // 文本宽度 大于 渲染宽度
      let fillText = "";
      let line = 1;
      for (let i = 0; i <= options.text.length - 1; i++) {
        // 将文字转为数组，一行文字一个元素
        fillText = fillText + options.text[i];
        if (this.toRpx(this.ctx.measureText(fillText).width) >= options.width) {
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
      textWidth = options.width;
    } else {
      textArr.push(options.text);
    }

    textArr.forEach((item, index) => {
      this.ctx.fillText(
        item,
        this.toPx(options.x),
        this.toPx(options.y + (lineHeight || options.fontSize) * index)
      );
    });

    await this.draw(true);
    this.ctx.restore();
    return textWidth;
  }

  public async clearRect() {
    this.ctx.clearRect(0,0, this.toPx(this.options.width), this.toPx(this.options.height))
    await this.draw()
  }

  private async draw(reserve?: boolean) {
    return new Promise((resolve) => {
      this.ctx.draw(reserve, (res) => resolve(res))
    })
  }
  /**
   * 生成临时文件
   */
  public canvasToTempFilePath(): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (this.options.debug) {
          this.log("开始截取canvas目前的图像");
          console.time("canvas截取图片");
        }
        Taro.canvasToTempFilePath({
          x: 0,
          y: 0,
          quality: this.options.quality,
          canvasId: this.options.canvasId,
          success: res => {
            if (this.options.debug) {
              this.log("截取canvas目前的图像成功", res.tempFilePath);
              console.timeEnd("canvas截取图片");
            }
            resolve(res.tempFilePath);
          },
          fail: err => {
            this.log('截取canvas目前的图像失败', err)
            reject(err)
          }
        }, this)
      }, 50);
    });
  }

  /**
   * 保存到相册
   */
  public async savePosterToPhoto(): Promise<string> {
    this.log("开始保存到相册");
    return new Promise(async (resolve, reject) => {
      try {
        const tmp = await this.canvasToTempFilePath();
        Taro.saveImageToPhotosAlbum({
          filePath: tmp,
          success: () => {
            this.log("保存到相册成功");
            this.options?.onSave?.(tmp);
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
            this.options?.onSaveFail?.(err);
          },
        });
      } catch (e) {
        this.options?.onSaveFail?.(e);
          this.log("保存到相册失败");
      }
    });
  }

  public log = (message?: any, ...optionalParams: any[]) => {
    if (this.options.debug) {
      console.log(message, ...optionalParams)
    }
  }

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
              console.log("settingdata", settingdata);
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
              console.log("failData", failData);
            },
            complete(finishData) {
              console.log("finishData", finishData);
            },
          });
      },
    });
  }

  public exec = (options: PosterItemConfig) => {
    const funcMap = {
      image: "paintImage",
      shape: "paintShape",
      text: "paintText",
    };

    if (!funcMap[options.type]) {
      throw new Error(`[poster]: ${options.type}类型不存在`);
    }

    return this[funcMap[options.type]](options);
  };
}
