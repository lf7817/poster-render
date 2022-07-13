import { Canvas } from "@tarojs/components";
import { getEnv } from "@tarojs/taro";
import React, { FC } from "react";

interface Props {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  width: number;
  height: number;
  /**
   * 长按事件，暂不支持h5
   * @desc 微信H5不支持下载文件，不支持长按下载场景
   */
  onLongTap?: () => void;
}

export const PosterRenerCanvas: FC<Props> = (props) => {
  return getEnv() === "WEB" ? (
    <canvas id={props.id} className={props.className} style={props.style} />
  ) : (
    <Canvas
      type="2d"
      id={props.id}
      // @ts-ignore
      width={props.width}
      height={props.height}
      className={props.className}
      style={props.style}
      onLongTap={props.onLongTap}
    />
  );
};
