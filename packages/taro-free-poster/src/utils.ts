import * as Taro from "@tarojs/taro";

export const delay = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const { screenWidth, pixelRatio } = Taro.getSystemInfoSync();
export const isAlipay = Taro.getEnv() === "ALIPAY";
export const factor = screenWidth / 750;

export function toPx(rpx: number) {
  return isAlipay
    ? Math.round(pixelRatio * rpx * factor)
    : Math.round(factor * rpx);
}

export function toRpx(px: number) {
  return isAlipay
    ? Math.round(px / pixelRatio / factor)
    : Math.round(px / factor);
}
