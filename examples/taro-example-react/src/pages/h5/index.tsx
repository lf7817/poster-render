import Reac, { FC, useEffect } from "react";
import { View, Canvas } from "@tarojs/components";
import Taro, { getEnv, useDidShow } from "@tarojs/taro";
import { FreePoster } from "./FreePoster/index";

const h5: FC = () => {
  console.log(Taro.getSystemInfoSync());

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    Taro.nextTick(async () => {
      const freePoster = new FreePoster({
        id: "m",
        width: 644,
        height: 1104,
        debug: true,
        // dpr: 3,
      });

      await freePoster.init();

      freePoster.setCanvasBackground("red");

      await freePoster.preloadImage([
        "https://img.1000.com/shumou/interaction/bg3.png",
        "https://img.1000.com/shumou/interaction/avatar.png",
        "https://img.1000.com/shumou/interaction/text.png",
        "https://img.1000.com/shumou/interaction/img2.png",
      ]);

      await freePoster.paintImage({
        x: 0,
        y: 0,
        width: 644,
        height: 1104,
        mode: "cover",
        src: "https://img.1000.com/shumou/interaction/bg3.png",
        radius: 16,
      });

      await freePoster.paintImage({
        x: 288,
        y: 30,
        width: 96,
        height: 96,
        radius: 48,
        src: "https://img.1000.com/shumou/interaction/avatar.png",
      });

      await freePoster.paintImage({
        x: 70,
        y: 240,
        width: 508,
        height: 68,
        src: "https://img.1000.com/shumou/interaction/text.png",
      });

      await freePoster.paintImage({
        x: 60,
        y: 380,
        sx: 0,
        sy: 0,
        width: 400,
        height: 300,
        backgroundColor: "red",
        mode: "cover",
        src: "https://img.1000.com/shumou/interaction/img2.png",
      });

      freePoster.paintRect({
        x: 22,
        y: 760,
        width: 600,
        height: 320,
        backgroundColor: "#fff",
        radius: 20,
        borderColor: "#000",
        borderWidth: 10,
      });

      freePoster.paintRect({
        x: 100,
        y: 800,
        width: 100,
        height: 100,
        backgroundColor: "red",
        radius: 50,
        borderColor: "yellow",
        borderWidth: 10,
      });

      freePoster.paintText({
        x: 50,
        y: 50,
        text: "中二猪猪猪猪猪",
        lineNum: 2,
        lineHeight: 40,
        width: 150,
        height: 400,
        fontStyle: "italic",
        fontWeight: "bold",
        fontSize: 30,
        opacity: 1,
        color: "#fff",
        baseLine: "bottom",
        textDecoration: "line-through",
      });

      freePoster.paintText({
        x: (textWidth, instance) =>
          (644 - textWidth - instance.measureText("的助力邀请").width) / 2,
        y: 180,
        width: (textWidth) => textWidth,
        height: 30,
        text: "中二猪猪猪",
        color: "#fff",
        fontSize: 28,
        textAlign: "left",
        baseLine: "top",
        textDecoration: "line-through",
      });

      freePoster.paintText({
        x: (textWidth, instance) =>
          (644 - textWidth - instance.measureText("中二猪猪猪").width) / 2 +
          instance.measureText("中二猪猪猪").width +
          10,
        y: 180,
        width: 200,
        height: 30,
        text: "的助力邀请",
        color: "#FEEE93",
        fontSize: 28,
        baseLine: "top",
      });

      // console.log(111, await freePoster.savePosterToPhoto());
    });
  }, []);

  return getEnv() === "WEB" ? (
    <canvas
      id="m"
      style={{
        width: Taro.pxTransform(644),
        height: Taro.pxTransform(1104),
      }}
    />
  ) : (
    <Canvas
      type="2d"
      id="m"
      // @ts-ignore
      width="644"
      height="1104"
      style={{
        width: Taro.pxTransform(644),
        height: Taro.pxTransform(1104),
      }}
    />
  );
};

export default h5;
