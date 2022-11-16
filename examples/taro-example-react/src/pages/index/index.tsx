import { FC, useEffect, useRef, useState } from "react";
import { pxTransform } from "@tarojs/taro";
import {
  PosterItemConfig,
  PosterRender,
  PosterRenderRef,
} from "@poster-render/taro-react";
import { data2 } from "./data";

const h5: FC = () => {
  const posterRender = useRef<PosterRenderRef>(null);
  const [list, setList] = useState<PosterItemConfig[]>([]);

  useEffect(() => {
    setInterval(() => {
      setList([
        ...data2,
        {
          type: "text",
          width: 400,
          height: 100,
          x: 100,
          y: 100,
          text: Math.random().toString(),
          fontSize: 34,
          color: "#fff",
        },
      ]);
    }, 1000);
  }, []);

  return (
    <PosterRender
      ref={posterRender}
      canvasId="taro-poster-render"
      renderType={"canvas"}
      canvasWidth={644}
      canvasHeight={1104}
      list={list}
      debug
      // showMenuByLongpress
      style={{
        width: pxTransform(644),
        height: pxTransform(1104),
      }}
      onRender={() => console.log("onRender")}
      onLongTap={() => posterRender.current?.savePosterToPhoto()}
      onRenderFail={(err) => console.error("onRenderFail", err?.message)}
      onSave={(url) => console.log("onSave", url)}
      onSaveFail={(err) => console.error("onSaveFail", err?.message)}
    />
  );
};

export default h5;
