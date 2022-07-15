import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  memo,
} from "react";
import { nextTick, previewImage } from "@tarojs/taro";
import { PosterRenderCore, PosterItemConfig } from "@poster-render/taro";
import type { PosterRenderProps, PosterRenderRef } from "./types";
import { PosterRenerCanvas } from "./canvas";
import { Image, View } from "@tarojs/components";

const PosterRenderReact: ForwardRefRenderFunction<
  PosterRenderRef,
  PosterRenderProps
> = (props, ref) => {
  const freePoster = useRef<PosterRenderCore>();
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    nextTick(async () => {
      const poster = new PosterRenderCore({
        id: props.canvasId || "poster-render",
        width: props.canvasWidth,
        height: props.canvasHeight,
        destWidth: props.destWidth,
        destHeight: props.destHeight,
        quality: props.quality,
        fileType: props.fileType,
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
      await poster.render(props.list, props.renderType);

      freePoster.current = poster;
    });
  }, []);

  useEffect(() => {
    freePoster.current?.render(props.list, props.renderType);
  }, [props.list]);

  useImperativeHandle(ref, () => ({
    savePosterToPhoto: async () =>
      await freePoster.current?.savePosterToPhoto?.(),
    preview: async () => {
      try {
        if (freePoster.current) {
          const res = await freePoster.current?.canvasToTempFilePath();
          await previewImage({ urls: [res], current: res });
        }
      } catch (e) {}
    },
    render: async (
      config?:
        | PosterItemConfig[]
        | ((instance: PosterRenderCore) => PosterItemConfig[])
    ) =>
      await freePoster.current?.render(config || props.list, props.renderType),
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
