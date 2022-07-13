import * as Taro from "@tarojs/taro";

export const { screenWidth, pixelRatio, environment, platform } =
  Taro.getSystemInfoSync();

/**
 * 是否是企微
 */
export const isQiwei = environment === "wxwork";
export const isAndroid = platform?.toLocaleLowerCase()?.includes("android");
export const isAlipay = Taro.getEnv() === "ALIPAY";
export const isWeb = Taro.getEnv() === "WEB";

/**
 * 获取canvas元素
 * @param id
 * @returns
 */
export function getCanvasElementById(
  id: string
): Promise<Taro.Canvas | undefined> {
  return new Promise((resolve) => {
    isWeb
      ? resolve(document.getElementById(id) as any)
      : Taro.createSelectorQuery()
          .select(`#${id}`)
          .fields({ node: true, size: true })
          .exec((rect) => resolve(rect?.[0]?.node));
  });
}
