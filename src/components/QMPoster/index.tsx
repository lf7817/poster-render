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
  Fragment,
} from "react";
import FreePoster from "./FreePoster";
import type { QMPosterProps, QMPosterRef } from "./types";

const QMPosterCore: ForwardRefRenderFunction<QMPosterRef, QMPosterProps> = (
  props,
  ref
) => {
  const $retryCounter = useRef<number>(0);
  const { canvasId = "posterCanvasId" } = props;
  const $isFirst = useRef<boolean>(true);
  const [url, setUrl] = useState<string>();
  const $freePoster = useRef<FreePoster>();

  useEffect(() => {
    Taro.nextTick(async () => {
      const freePoster = new FreePoster({
        canvasId,
        debug: props.debug,
        width: props.width,
        height: props.height,
        quality: props.quality,
        onSave: props.onSave,
        onSaveFail: props.onSaveFail,
      });
      $freePoster.current = freePoster;
      await freePoster.setCanvasBackground("rgba(0,0,0,0)");
      await generateImage();
      $isFirst.current = false;
    })
   
    // eslint-disable-next-line
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
        $retryCounter.current = 0;
      } catch (e) {
        if (++$retryCounter.current <= 2) {
          $freePoster.current.log(`第${$retryCounter.current}次重新渲染`);
          await generateImage();
        } else {
          $freePoster.current.log(`重新渲染失败，放弃治疗`);
          props?.onRenderFail?.(e);
        }
      }
    }
  }

  useEffect(() => {
    if (!$isFirst.current) {
      $freePoster.current?.clearRect();
      generateImage();
    }
  }, [props.list]);

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
        canvas-id={canvasId}
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

export { QMPosterRef, QMPosterProps };

export const QMPoster = memo(forwardRef(QMPosterCore));

export default QMPoster;
