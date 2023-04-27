import {
  getSystemInfoSync,
  getEnv,
  createSelectorQuery,
  type Canvas,
} from "@tarojs/taro";

// @ts-ignore
export const { screenWidth, pixelRatio, environment, platform } =
  getSystemInfoSync();

/**
 * 是否是企微
 */
export const isQiwei = environment === "wxwork";
export const isAndroid = platform?.toLocaleLowerCase()?.includes("android");
export const isAlipay = getEnv() === "ALIPAY";
export const isWeb = getEnv() === "WEB";
export const isWeapp = getEnv() === "WEAPP";
export const isTT = getEnv() === "TT";

/**
 * 获取canvas元素
 * @param id
 * @returns
 */
export function getCanvasElementById(id: string): Promise<Canvas | undefined> {
  return new Promise((resolve) => {
    isWeb
      ? resolve(document.getElementById(id) as any)
      : createSelectorQuery()
          .select(`#${id}`)
          .fields({ node: true, size: true })
          .exec((rect) => resolve(rect?.[0]?.node));
  });
}
