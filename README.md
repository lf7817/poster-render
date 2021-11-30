# taro-poster-render

taro海报组件，兼容微信、企微、支付宝，后续会兼容h5

## 安装

```bash
npm install taro-poster-render
```

## 使用

```tsx
import { Poster, PosterRef } from 'taro-poster-render';
import { FC, useRef } from 'react';

const Index: FC = () => {
  const poster = useRef<PosterRef>(null);

  return (
    <Poster
      ref={poster}
      width={560}
      height={1000}
      debug
      quality={1}
      renderType="image"
      downloadLimit={10}
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
          radius: 20,
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

| 字段 | 类型 | 是否必填 | 描述 |
| :-----| :---- | :---- | ------|
| canvasId | string | 否 |  |
| className | string | 否 |  |
| style | CSSProperties | 否 | 默认宽为pxTransform(画布宽),高为pxTransform(画布高) |
| width | number | 否 | 画布宽度（rpx） |
| height | number | 否 | 画布高度（rpx） |
| debug | boolean | 否 | 开启调试日志 |
| fileType | 'png' \| 'jpg' | 否 | 导出图片格式，默认png |
| quality | number | 否 | 导出图片质量0-1，默认为1，只对jpg生效 |
| renderType | 'image' \| 'canvas' | 是 | 渲染方式，默认是图片方式兼容性好，canvas方式速度快，但是不支持识别二维码 |
| showMenuByLongpress | boolean | 否 | 开启长按图片显示识别小程序码菜单（支持转发、下载、收藏、识别二维码），图片模式时生效 |
| downloadLimit | number | 否 | 图片并行下载数，范围1-10，默认10 |
| onLongPress | (url?: string) => void; | 否 | 长按事件，图片模式时接收海报url参数，canvas模式时无参数 |
| onRender | (url?: string) => void; | 否 | 渲染完成事件，图片模式时接收海报url参数，canvas模式时无参数 |
| onRenderFail | (err: any) => void | 否 | 渲染失败事件 |
| onSave | (url: string) => void | 否 | 保存成功事件 |
| onSaveFail | (err: any) => void | 否 | 保存失败事件 |
| list | [PosterItemConfig](https://github.com/lf7817/taro-poster-render/blob/main/src/components/Poster/types.ts#L71)[] | 是 | 图片、文字、图形配置 |

list支持三种类型：``image``、``text``、``shape``

image类型

| 字段            | 类型                                                 | 是否必填 | 描述                                                         |
| --------------- | ---------------------------------------------------- | -------- | ------------------------------------------------------------ |
| type            | String                                               | 是       | 固定为image                                                  |
| x               | number                                               | 是       | 左上角x坐标，单位rpx                                         |
| y               | number                                               | 是       | 左上角y坐标，单位rpx                                         |
| width           | number                                               | 是       | 图片宽，单位rpx                                              |
| height          | number                                               | 是       | 图片高，单位rpx                                              |
| src             | string                                               | 是       | 图片路径，支持https、wxfile协议，暂不支持base64              |
| backgroundColor | string                                               | 否       | 背景色                                                       |
| radius          | number \|\`${number} ${number} ${number} ${number}\` | 否       | 圆角半径，顺序：左上 -> 右上 -> 右下 -> 左下，如果要绘制圆形，宽高一致，radius设为宽高一半 |

text类型

| 字段       | 类型                                      | 是否必填 | 描述                                                         |
| ---------- | ----------------------------------------- | -------- | ------------------------------------------------------------ |
| type       | String                                    | 是       | 固定为text                                                   |
| x          | number                                    | 是       | 左上角x坐标，单位rpx                                         |
| y          | number                                    | 是       | 左上角y坐标，单位rpx                                         |
| width      | number                                    | 是       | 文字宽，单位rpx                                              |
| height     | number                                    | 是       | 文字高，单位rpx                                              |
| text       | string                                    | 是       | 文字内容                                                     |
| textAlign  | "left" \| "center" \| "right"             | 否       | 文字对齐方式，注意这里跟css文字对齐方式不一样，请仔细[查看      文档](https://developers.weixin.qq.com/miniprogram/dev/api/canvas/CanvasContext.setTextAlign.html) |
| fontWeight | "normal" ｜ "bold"                        | 否       |                                                              |
| color      | string                                    | 是       | 字体颜色                                                     |
| fontSize   | number                                    | 是       | 字体大小，单位rpx                                            |
| fontStyle  | "normal" \| "italic" \| "oblique"         | 否       |                                                              |
| fontFamily | string                                    | 否       |                                                              |
| lineHeight | number                                    | 否       | 行高，单位rpx                                                |
| baseLine   | "top" \| "bottom" \| "middle" \| "normal" | 是       | baseLine                                                     |
| opacity    | number                                    | 否       | 字体透明度                                                   |
| lineNum    | number                                    | 否       | 行数，默认1行，超出自动显示...                               |

shape类型

| 字段        | 类型                                                 | 是否必填 | 描述                                                         |
| ----------- | ---------------------------------------------------- | -------- | ------------------------------------------------------------ |
| type        | String                                               | 是       | 固定为shape                                                  |
| x           | number                                               | 是       | 左上角x坐标，单位rpx                                         |
| y           | number                                               | 是       | 左上角y坐标，单位rpx                                         |
| width       | number                                               | 是       | 图片宽，单位rpx                                              |
| height      | number                                               | 是       | 图片高，单位rpx                                              |
| strokeStyle | string                                               | 否       | 边框颜色                                                     |
| lineWidth   | number                                               | 否       | 边框宽，单位rpx                                              |
| fillStyle   | string                                               | 否       | 填充色                                                       |
| radius      | number \|\`${number} ${number} ${number} ${number}\` | 否       | 圆角半径，顺序：左上 -> 右上 -> 右下 -> 左下，如果要绘制圆形，宽高一致，radius设为宽高一半 |

## 实例方法

| 方法              | 类型                  | 描述                     |
| ----------------- | --------------------- | ------------------------ |
| savePosterToPhoto | () => Promise<string> | 保存到相册，返回图片路径 |
| preview           | () => Promise<void>   | 预览图片                 |

## 注意

- canvas没有层级，后渲染的可能会盖住之前的内容，所以list要注意顺序，这里使用了``for await...of``特性实现“同步”渲染

  ```ts
  for await (const item of props.list) {
    await $freePoster.current.exec(item);
  }
  ```

- 图片域名要提前配置到下载白名单

- 所有图片都会提前下载，不用担心图片按顺序下载浪费时间

  ```ts
  public async preloadImage(images: string[]) {
    this.log("开始提前下载图片");
    this.time("提前下载图片用时");
  
    await Promise.all(
      images
      .filter((item) => !this.images.has(item))
      .map((item) => this.loadImage(item))
    );
  
    this.timeEnd("提前下载图片用时");
  }
  ```

- 受网路影响图片可能会下载失败，这里做了两次下载重试
- list变化后会重新渲染