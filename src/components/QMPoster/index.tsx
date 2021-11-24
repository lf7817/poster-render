import { Canvas, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import React, {
  forwardRef,
  ForwardRefRenderFunction,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  Fragment
} from "react";
import FreePoster from "./FreePoster";
import type { QMPosterProps, QMPosterRef } from "./types";
import { delay } from "./utils";

const QMPosterCore: ForwardRefRenderFunction<QMPosterRef, QMPosterProps> = (
  props,
  ref
) => {
  const [url, setUrl] = useState<string>();
  const $freePoster = useRef<FreePoster>();

  useEffect(() => {
    (async () => {
      await delay(100);
      const freePoster = new FreePoster({
        debug: props.debug,
        width: props.width,
        height: props.height,
        quality: props.quality,
        onSave: props.onSave,
        onSaveFail: props.onSaveFail,
      });
      $freePoster.current = freePoster;
      freePoster.setCanvasBackground("rgba(0,0,0,0)");
      await generateImage();
    })();
  }, []);

  async function generateImage() {
    if ($freePoster.current) {
      for await (const item of props.list) {
        await $freePoster.current.exec(item);
      }

      try {
        const temp = await $freePoster.current.canvasToTempFilePath();
        setUrl(temp);
        props?.onRender?.(temp);
      } catch (e) {
        props?.onRenderFail?.(e);
      }
    }
  }

  useImperativeHandle(ref, () => ({
    savePosterToPhoto: async () => {
      try {
        if ($freePoster.current?.savePosterToPhoto) {
          return await $freePoster.current?.savePosterToPhoto();
        }
        return "";
      } catch (e) {
        return "";
      }
    },
  }));

  return (
    <Fragment>
      <Canvas
        canvas-id="posterCanvasId"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: Taro.pxTransform(props.width),
          height: Taro.pxTransform(props.height),
          transform: "translate3d(-9999rpx, 0, 0)",
        }}
      />
      {url && (
        <Image
          className={props.className}
          src={url}
          style={{
            width: Taro.pxTransform(props.width),
            height: Taro.pxTransform(props.height),
            ...props.style,
          }}
          showMenuByLongpress={props.showMenuByLongpress}
          onLongPress={() => props?.onLongPress?.(url)}
        />
      )}
    </Fragment>
  );
};

export {QMPosterRef, QMPosterProps}

export const QMPoster = memo(forwardRef(QMPosterCore))

export default QMPoster;
