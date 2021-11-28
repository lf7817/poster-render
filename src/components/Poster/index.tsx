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
import isEqual from "lodash.isequal";
import FreePoster from "./FreePoster";
import type { PosterProps, PosterRef, PosterItemConfig } from "./types";
import { toPx } from "./utils";

const QMPosterCore: ForwardRefRenderFunction<PosterRef, PosterProps> = (
  props,
  ref
) => {
  const $retryCounter = useRef<number>(0);
  const { canvasId = "posterCanvasId", renderType = "image" } = props;
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
      await render();
      $isFirst.current = false;
    });

    // eslint-disable-next-line
  }, []);

  async function render() {
    if ($freePoster.current) {
      $freePoster.current.time("渲染海报完成");
      // 提前加载图片
      await $freePoster.current.preloadImage(
        props.list.reduce((arr, item) => {
          if (item.type === "image") {
            arr.push(item.src);
          }
          return arr;
        }, [] as string[])
      );
      // 按顺序渲染
      for await (const item of props.list) {
        await $freePoster.current.exec(item);
      }

      if (props.renderType === "image") {
        try {
          const temp = await $freePoster.current.canvasToTempFilePath();
          setUrl(temp);
          props?.onRender?.(temp);
          $retryCounter.current = 0;
          $freePoster.current.timeEnd("渲染海报完成");
        } catch (e) {
          if (++$retryCounter.current <= 2) {
            $freePoster.current.log(`第${$retryCounter.current}次重新渲染`);
            await render();
          } else {
            $freePoster.current.log(`重新渲染失败，放弃治疗`);
            props?.onRenderFail?.(e);
          }
        }
      } else {
        $retryCounter.current = 0;
        props?.onRender?.();
        $freePoster.current.timeEnd("渲染海报完成");
      }
    }
  }

  useEffect(() => {
    if (!$isFirst.current) {
      $freePoster.current?.clearRect();
      render();
    }
    // eslint-disable-next-line
  }, [props.list]);

  useImperativeHandle(ref, () => ({
    savePosterToPhoto: async () => {
      try {
        if ($freePoster.current) {
          return await $freePoster.current.savePosterToPhoto();
        }
        return "";
      } catch (e) {
        return "";
      }
    },
    preview: async () => {
      try {
        if ($freePoster.current) {
          $freePoster.current.time("渲染预览用时");
          const res = await $freePoster.current.canvasToTempFilePath();
          await Taro.previewImage({ urls: [res], current: res });
          $freePoster.current.timeEnd("渲染预览用时");
        }
      } catch (e) {
        $freePoster.current?.log("预览图片出错", e);
      }
    },
  }));

  return (
    <Fragment>
      <Canvas
        id={canvasId}
        canvas-id={canvasId}
        onLongTap={() => props.renderType === "canvas" && props.onLongPress?.()}
        className={props.className}
        // @ts-ignore 兼容支付宝
        width={toPx(props.width)}
        // @ts-ignore 兼容支付宝
        height={toPx(props.height)}
        style={{
          ...(renderType === "canvas"
            ? {}
            : {
                position: "absolute",
                left: 0,
                bottom: 0,
                transform: "translate3d(-9999rpx, 0, 0)",
              }),
          width: Taro.pxTransform(props.width),
          height: Taro.pxTransform(props.height),
          ...props.style,
        }}
      />
      {url && renderType === "image" && (
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

export { PosterRef, PosterProps, PosterItemConfig };

export const Poster = memo(forwardRef(QMPosterCore), (prev, next) => {
  return isEqual(prev.list, next.list);
});

export default Poster;
