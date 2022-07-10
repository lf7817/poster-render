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
        disableHD: false,
      });

      await freePoster.init();

      // freePoster.setCanvasBackground("red");

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

      // Taro.createSelectorQuery()
      //   .select("#m")
      //   .fields({ node: true, size: true })
      //   .exec((res) => {
      //     // const canvas: any = document.getElementById("m");
      //     // console.log(canvas.prototype);
      //     const canvas = res[0].node;
      //     // console.log(res[0]);
      //     const ctx: RenderingContext = canvas.getContext("2d");
      //     const dpr = Taro.getSystemInfoSync().pixelRatio;
      //     canvas.width = res[0].width * dpr;
      //     canvas.height = res[0].height * dpr;
      //     // 强烈建议在scale前加上这句（如果在onShow上生成海报必须要）
      //     ctx.resetTransform();
      //     // ctx.setTransform(1, 0, 0, 1, 0, 0)
      //     ctx.scale(dpr, dpr);
      //     ctx.fillRect(0, 0, 1000, 2000);
      //     const image = canvas.createImage();
      //     // const image = new Image();
      //     image.onload = () => {
      //       ctx.drawImage(image, 0, 0, 644 , 1104 );
      //       // const imageData = canvas.toDataURL("image/png");
      //       // console.log(imageData);
      //       // var link = document.createElement("a");
      //       // //把a标签的href属性赋值到生成好了的url
      //       // link.href = imageData;
      //       //
      //       // //通过a标签的download属性修改下载图片的名字
      //       // link.download = "一起来休息一下.png";
      //       // //让a标签的click函数，直接下载图片
      //       // link.click();
      //       Taro.canvasToTempFilePath({
      //         canvas,
      //         success: (res) => {
      //           console.log(res);
      //         },
      //       });
      //     };
      //     // image.crossOrigin = "cors";
      //     // image.setAttribute("crossOrigin", "Anonymous");
      //     image.src = "https://img.1000.com/shumou/interaction/bg3.png";
      //   });
      console.log(111, await freePoster.savePosterToPhoto());
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
