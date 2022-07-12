import React, {
  FC,
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  memo,
} from "react";
import Taro from "@tarojs/taro";
import { FreePoster, PosterItemConfig } from "../FreePoster";
import type { PosterRenderProps, PosterRenderRef } from "./types";
import { PosterRenerCanvas } from "./canvas";
import { Image, View } from "@tarojs/components";

const PosterRenderCore: ForwardRefRenderFunction<
  PosterRenderRef,
  PosterRenderProps
> = (props, ref) => {
  const freePoster = useRef<FreePoster>();
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    Taro.nextTick(async () => {
      const poster = new FreePoster({
        id: props.canvasId || "taro-poster-render",
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
    freePoster.current?.render(props.list);
  }, [props.list]);

  useImperativeHandle(ref, () => ({
    savePosterToPhoto: async () =>
      await freePoster.current?.savePosterToPhoto?.(),
    preview: async () => {
      try {
        if (freePoster.current) {
          const res = await freePoster.current?.canvasToTempFilePath();
          await Taro.previewImage({ urls: [res], current: res });
        }
      } catch (e) {}
    },
    render: async (
      config?:
        | PosterItemConfig[]
        | ((instance: FreePoster) => PosterItemConfig[])
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
        onLongPress={props.onLongPress}
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
          onLongPress={() => props?.onLongPress?.(url)}
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
      if (typeof v === "function") {
        return false;
      }

      if (v !== nextList[i][k]) {
        return false;
      }
    }
  }

  return true;
}

export const PosterRender = memo(forwardRef(PosterRenderCore), (prev, next) => {
  if (next.disableRerender) {
    return true;
  }

  if (typeof prev.list === "function" || typeof next.list === "function") {
    return false;
  }

  return isEqual(prev.list, next.list);
});
