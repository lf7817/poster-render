import { FC, useEffect, useRef, useState } from "react";
import { pxTransform } from "@tarojs/taro";
import { PosterRender, PosterRenderRef } from "taro-poster-render";
import { data1, data2, data3 } from "./data";

const h5: FC = () => {
  const posterRender = useRef<PosterRenderRef>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setCount(Math.random());
    }, 3000);
  }, []);

  console.log(count);

  return (
    <PosterRender
      ref={posterRender}
      canvasId="taro-poster-render"
      renderType={"canvas"}
      canvasWidth={644}
      canvasHeight={1104}
      list={data2}
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
