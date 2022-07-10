import Taro from "@tarojs/taro";

/**
 * 获取canvas元素
 * @param id
 * @returns
 */
export function getCanvasElementById(
  id: string
): Promise<Taro.Canvas | undefined> {
  if (Taro.getEnv() === "WEB") {
    return Promise.resolve(document.getElementById(id) as any);
  }

  return new Promise((resolve) => {
    Taro.createSelectorQuery()
      .select(`#${id}`)
      .fields({ node: true, size: true })
      .exec((rect) => resolve(rect?.[0]?.node));
  });
}

export const { screenWidth, pixelRatio } = Taro.getSystemInfoSync();
export const isAlipay = Taro.getEnv() === "ALIPAY";
export const isWeb = Taro.getEnv() === "WEB";
export const factor = screenWidth / 750;
