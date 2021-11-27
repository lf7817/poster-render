# taro-qm-poster

为了兼容企微采用了老版的canvas封装，后续会兼容h5

## 使用

```bash
npm install taro-qm-poster
```

```tsx
import { QMPoster, QMPosterRef } from 'taro-qm-poster';
import { FC, useRef } from 'react';

const Index: FC = () => {
  const poster = useRef<QMPosterRef>(null);

  return (
    <QMPoster
      ref={poster}
      width={560}
      height={1000}
      debug
      quality={1}
      onLongPress={() => poster.current?.savePosterToPhoto()}
      onRender={(url) => console.log('onRender', url)}
      onSave={(url) => console.log('onSave', url)}
      list={[
        {
          type: 'image',
          x: 0,
          y: 0,
          src: 'https://img.1000.com/shumou/mp/poster-activity-bg.png',
          width: 560,
          height: 800,
          radius: '20 20 0 0',
        },
        {
          type: 'shape',
          x: 100,
          y: 100,
          width: 340,
          height: 340,
          radius: 170,
          strokeStyle: '#fff',
          lineWidth: 10,
          fillStyle: 'red',
        },
        {
          type: 'text',
          x: 0,
          y: 0,
          width: 200,
          height: 200,
          fontSize: 36,
          lineNum: 2,
          lineHeight: 36,
          textAlign: 'left',
          color: '#000',
          text: '你好你好你canvas ',
          baseLine: 'top',
          fontFamily: '黑体',
          fontWeight: 'bold',
        },
        {
          type: 'shape',
          x: 0,
          y: 800,
          width: 560,
          height: 200,
          radius: '0 0 20 20',
          fillStyle: 'red',
        },
      ]}
    />
  );
};

export default Index;
```

## props

```ts
export interface QMPosterProps {
  canvasId?: string;
  className?: string;
  style?: CSSProperties;
  width: number;
  height: number;
  debug?: boolean;
  quality?: number;
  list: PosterItemConfig[];
  showMenuByLongpress?: boolean;
  /** 海报渲染方式，默认渲染图片 */
  renderType: "image" | "canvas";
  onLongPress?: (url?: string) => void;
  onSave?: (url: string) => void;
  onSaveFail?: (err: any) => void;
  onRender?: (url: string) => void;
  onRenderFail?: (err: any) => void;
}
```

list支持三种类型：``image``、``text``、``shape``

```ts
export interface PaintImage {
  type: 'image',
  x: number;
  y: number;
  width: number;
  height: number;
  /** 图片路径，支持https、wxfile协议 */
  src: string;
  /** 背景色 */
  backgroundColor?: string;
  /**
   * 圆角所处圆的半径尺寸，如果要绘制圆形，宽高一致，radius设为宽一半
   * 顺序：左上 -> 右上 -> 右下 -> 左下
   */
  radius?: number | `${number} ${number} ${number} ${number}`;
}

export interface PaintText {
  type: 'text',
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  /** 文字对齐方式 */
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  color: string;
  fontSize: number;
  lineHeight?: number;
  baseLine: 'top' | 'bottom' | 'middle' | 'normal';
  opacity?: number;
  lineNum?: number;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontFamily?: string;
}

export interface PaintShape{
  type: 'shape',
  x: number;
  y: number;
  /** 矩形宽 */
  width: number;
  /** 矩形高 */
  height: number;
  /** 圆角度数，如果要绘制圆形，宽高一致，radius设为宽一半 */
  radius?: number | `${number} ${number} ${number} ${number}`;
  /** 线颜色 */
  strokeStyle?: string;
  /** 线宽 */
  lineWidth?: number;
  /** 背景色 */
  fillStyle?: string;
}
```