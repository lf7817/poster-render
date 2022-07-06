import Taro from "@tarojs/taro";
import { FC, useEffect, useRef, useState } from "react";
import { Poster, PosterRef } from "taro-poster-render";

const Index: FC = () => {
  const poster = useRef<PosterRef>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setCount(Math.random());
    }, 3000);
  }, []);

  console.log(count);

  return (
    <Poster
      style={{ marginLeft: Taro.pxTransform(55), width: Taro.pxTransform(644), height: Taro.pxTransform(1104) }}
      width={644 * 2}
      height={1104 * 2}
      ref={poster}
      debug
      disableRerender
      quality={1}
      // showMenuByLongpress
      renderType='image'
      downloadLimit={10}
      // fileType="jpg"
      onLongPress={() => poster.current?.savePosterToPhoto()}
      onRender={(url) => console.log("onRender", url)}
      onSave={(url) => console.log("onSave", url)}
      list={[
        {
          type: "image",
          x: 0,
          y: 0,
          width: 644 * 2,
          height: 1104 * 2,
          mode: "cover",
          src: "https://img.1000.com/shumou/interaction/bg3.png",
          radius: 16,
        },
        {
          type: "image",
          x: 294 * 2,
          y: 30 * 2,
          width: 96 * 2,
          height: 96 * 2,
          radius: 48,
          src: "https://img.1000.com/shumou/interaction/avatar.png",
        },
        {
          type: "text",
          x: (textWidth, instance) =>
            (644 * 2 - textWidth - instance.measureTextWidth("的助力邀请")) / 2,
          y: 180 * 2,
          width: (textWidth) => textWidth,
          height: 30 * 2,
          text: "中二猪猪猪",
          color: "#fff",
          fontSize: 28 * 2,
          textAlign: "left",
          baseLine: "normal",
        },
        {
          type: "text",
          x: (textWidth, instance) =>
            (644 * 2 - textWidth - instance.measureTextWidth("中二猪猪猪")) / 2 +
            instance.measureTextWidth("中二猪猪猪") +
            10 * 2,
          y: 180 * 2,
          width: 200 * 2,
          height: 30 * 2,
          text: "的助力邀请",
          color: "#FEEE93",
          fontSize: 28 * 2,
          baseLine: "normal",
        },
        {
          type: "image",
          x: 70 * 2,
          y: 240 * 2,
          width: 508 * 2,
          height: 68 * 2,
          src: "https://img.1000.com/shumou/interaction/text.png",
        },
        {
          type: "shape",
          x: 22 * 2,
          y: 760 * 2,
          width: 600 * 2,
          height: 320 * 2,
          fillStyle: "#fff",
          radius: 20,
          strokeStyle: "#000",
          lineWidth: 10 * 2,
        },
        {
          type: "shape",
          x: 100 * 2,
          y: 800 * 2,
          width: 100 * 2,
          height: 100 * 2,
          fillStyle: "red",
          radius: 50,
          strokeStyle: "yellow",
          lineWidth: 10 * 2,
        },
        {
          type: "image",
          x: 60 * 2,
          y: 380 * 2,
          sx: 0,
          sy: 0,
          width: 400 * 2,
          height: 300 * 2,
          backgroundColor: "red",
          mode: "cover",
          src: "https://img.1000.com/shumou/interaction/img2.png",
        },
      ]}
    />
  );
};

export default Index;
