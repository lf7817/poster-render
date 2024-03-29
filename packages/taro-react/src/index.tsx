import {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  memo,
} from "react";
import { nextTick, previewImage } from "@tarojs/taro";
import { PosterRenderCore, PosterItemConfig } from "@poster-render/taro/src";
import type { PosterRenderProps, PosterRenderRef } from "./types";
import { PosterRenerCanvas } from "./canvas";
import { Image, View } from "@tarojs/components";

const PosterRenderReact: ForwardRefRenderFunction<
  PosterRenderRef,
  PosterRenderProps
> = (props, ref) => {
  const posterRenderCore = useRef<PosterRenderCore>();
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    nextTick(async () => {
      setTimeout(async () => {
        const poster = new PosterRenderCore({
          id: props.canvasId || "taro-poster-render",
          width: props.canvasWidth,
          height: props.canvasHeight,
          destWidth: props.destWidth,
          destHeight: props.destHeight,
          quality: props.quality || 1,
          fileType: props.fileType || "png",
          dpr: props.dpr,
          debug: props.debug,
          onRender: (url) => {
            props?.onRender?.(url!);
            setUrl(url || "");
          },
          onRenderFail: props.onRenderFail,
          onSave: props.onSave,
          onSaveFail: props.onSaveFail,
        });
  
        await poster.init();
        await poster.preloadImage(props.list);
        poster.clearCanvas();
        await poster.render(props.list, props.renderType);
  
        posterRenderCore.current = poster;
      }, 50)
    });
  }, []);

  useEffect(() => {
    posterRenderCore.current?.clearCanvas();
    posterRenderCore.current?.render(props.list, props.renderType);
  }, [props.list]);

  useImperativeHandle(ref, () => ({
    savePosterToPhoto: async () =>
      await posterRenderCore.current?.savePosterToPhoto?.(),
    preview: async () => {
      try {
        if (posterRenderCore.current) {
          const res = await posterRenderCore.current?.canvasToTempFilePath();
          await previewImage({ urls: [res], current: res });
        }
      } catch (e) {}
    },
    render: async (
      config?:
        | PosterItemConfig[]
        | ((instance: PosterRenderCore) => PosterItemConfig[])
    ) => {
      posterRenderCore.current?.clearCanvas();
      return await posterRenderCore.current?.render(
        config || props.list,
        props.renderType
      );
    },
  }));

  if (props.renderType === "canvas") {
    return (
      <PosterRenerCanvas
        className={props.className}
        style={props.style}
        id={props.canvasId}
        width={props.canvasWidth}
        height={props.canvasHeight}
        onLongTap={props.onLongTap}
      />
    );
  }

  return (
    <View
      className={props.className}
      style={{ position: "relative", overflow: "hidden", ...props.style }}
    >
      <PosterRenerCanvas
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 1,
        }}
        id={props.canvasId}
        width={props.canvasWidth}
        height={props.canvasHeight}
      />
      {url && (
        <Image
          src={url}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            zIndex: 2,
          }}
          onLongPress={() => props?.onLongTap?.(url)}
          showMenuByLongpress={props.showMenuByLongpress}
        />
      )}
    </View>
  );
};

function isEqual(prevList: PosterItemConfig[], nextList: PosterItemConfig[]) {
  if (prevList.length !== nextList.length) {
    return false;
  }

  // @ts-ignore
  for (let [i, item] of prevList.entries()) {
    for (let [k, v] of Object.entries(item)) {
      if (typeof v === "function" || v !== nextList[i][k]) {
        return false;
      }
    }
  }

  return true;
}

// @ts-ignore
export const PosterRender = memo(
  forwardRef(PosterRenderReact),
  (prev, next) => {
    if (next.disableRerender) {
      return true;
    }

    if (typeof prev.list === "function" || typeof next.list === "function") {
      return false;
    }

    return isEqual(prev.list, next.list);
  }
);

export type { PosterRenderProps, PosterRenderRef, PosterItemConfig };
