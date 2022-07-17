# @poster-render/taro

通过配置的方式渲染海报，无需了解canvas语法。采用canvas2d api封装，支持同层渲染，支持微信/企微、支付宝、h5

## 安装

```bash
npm install @poster-render/taro
```

## 使用

初始化

```ts
import { PosterRenderCore, PosterItemConfig } from '@poster-render/taro';

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
  onRender: props.onRender,
  onRenderFail: props.onRenderFail,
  onSave: props.onSave,
  onSaveFail: props.onSaveFail,
});

// 初始化
await poster.init();
```

提前加载图片，可以省略这一步

```ts
await poster.preloadImage(['https://img.1000.com/shumou/interaction/bg3.png']);
```

渲染图片

```ts
await poster.paintImage({
    x: 60,
    y: 380,
    width: 400,
    height: 300,
    backgroundColor: "red",
    mode: "cover",
    src: "https://img.1000.com/shumou/interaction/img2.png",
})
```

渲染矩形(radius设为宽高一半可以绘制圆)

```ts
poster.paintRect({
    x: 294,
    y: 30,
    width: 96,
    height: 96,
    radius: 48,
    src: "https://img.1000.com/shumou/interaction/avatar.png",
})
```

渲染线

```ts
poster.paintline({
    x: 50,
    y: 50,
    destX: 200,
    destY: 50,
    color: "#fff",
    lineWidth: 4,
})
```

渲染文字

```ts
// 绘制文字
poster.paintText({
    x: 100,
    y: 180,
    width: 150,
    height: 30,
    text: "中二猪猪猪",
    color: "#fff",
    fontSize: 28,
  	lineNum:1,
    textAlign: "left",
    baseLine: "top",
    textDecoration: "line-through",
})
```

如果想要实现多段文字联动局中效果

```ts
// 用户昵称不定长
poster.paintText({
    x: (textWidth, instance) =>
      (644 - textWidth - instance.measureText("的助力邀请").width) / 2,
    y: 180,
    width: (textWidth) => textWidth,
    height: 30,
    text: "中二猪猪猪",
    color: "#fff",
    fontSize: 28,
    textAlign: "left",
    baseLine: "top",
    textDecoration: "line-through",
})
// ”的助力邀请“长度固定
poster.paintText({
    x: (textWidth, instance) =>
      (644 - textWidth - instance.measureText("中二猪猪猪").width) / 2 +
      instance.measureText("中二猪猪猪").width +
      10,
    y: 180,
    width: 200,
    height: 30,
    text: "的助力邀请",
    color: "#FEEE93",
    fontSize: 28,
    baseLine: "top",
    textDecoration: "underline",
})
```

渲染一组数据

```tsx
await poster.render([
  {
    type: "rect",
    x: 0,
    y: 0,
    width: 644,
    height: 1104,
    radius: 0,
    backgroundColor: "black",
  },
  {
    type: "image",
    x: 0,
    y: 0,
    width: 644,
    height: 1104,
    mode: "cover",
    src: "https://img.1000.com/shumou/interaction/bg3.png",
    radius: 16,
  },
  {
    type: "image",
    x: 294,
    y: 30,
    width: 96,
    height: 96,
    radius: 48,
    src: "https://img.1000.com/shumou/interaction/avatar.png",
  },
  {
    type: "text",
    x: (textWidth, instance) =>
      (644 - textWidth - instance.measureText("的助力邀请").width) / 2,
    y: 180,
    width: (textWidth) => textWidth,
    height: 30,
    text: "中二猪猪猪",
    color: "#fff",
    fontSize: 28,
    textAlign: "left",
    baseLine: "top",
    textDecoration: "line-through",
  },
  {
    type: "text",
    x: (textWidth, instance) =>
      (644 - textWidth - instance.measureText("中二猪猪猪").width) / 2 +
      instance.measureText("中二猪猪猪").width +
      10,
    y: 180,
    width: 200,
    height: 30,
    text: "的助力邀请",
    color: "#FEEE93",
    fontSize: 28,
    baseLine: "top",
    textDecoration: "underline",
  },
  {
    type: "image",
    x: 70,
    y: 240,
    width: 508,
    height: 68,
    src: "https://img.1000.com/shumou/interaction/text.png",
  },
  {
    type: "rect",
    x: 22,
    y: 760,
    width: 600,
    height: 320,
    backgroundColor: "#fff",
    radius: 20,
    borderColor: "#000",
    borderWidth: 10,
  },
  {
    type: "rect",
    x: 100,
    y: 800,
    width: 100,
    height: 100,
    backgroundColor: "red",
    radius: 50,
    borderColor: "yellow",
    borderWidth: 10,
  },
  {
    type: "line",
    x: 50,
    y: 50,
    destX: 200,
    destY: 50,
    color: "#fff",
    lineWidth: 4,
  },
]);
```

## Options

| 字段                  | 类型                                                                                                               | 是否必填 | 描述                                                                             |
|:--------------------|:-----------------------------------------------------------------------------------------------------------------| :---- |--------------------------------------------------------------------------------|
| Id           | string                                                                                                           | 是 |canvas id|
| width               | number                                                                                                           | 是 | 画布宽度                                                                      |
| height              | number                                                                                                           | 是 | 画布高度                                                                      |
| destWidth           | number                                                                                                           | 否 | 输出图片宽度                                                                    |
| destHeight         | number                                                                                                           | 否 | 输出图片高度                                                                    |
| debug               | boolean                                                                                                          | 否 | 开启调试日志                                                                         |
| fileType            | "png" \| "jpg"                                                                                                    | 否 | 导出图片格式，默认png                                                                   |
| quality             | number                                                                                                           | 否 | 导出图片质量0-1，默认为1，只对jpg生效                                                         |
| dpr          | number                  | 否       | 指定dpr，默认会启用高清方案，画布最终会被放大dpr倍（默认为系统dpr），但是某些场景画布太大会报错，或者画布太大导致生成图片太慢，这种情况可以指定dpr调整画布大小解决问题；支付宝小程序不支持，固定为1，安卓下企微dpr为3时生成图片会报错，固定为1，另外，如果画布高度乘以dpr超过4096,则会取消放大 |
| onRender     | (url?: string) => void; | 否       | 渲染完成事件，图片模式时接收海报url参数，canvas模式时无参数  |
| onRenderFail | (err?: any) => void     | 否       | 渲染失败事件                                                 |
| onSave       | (url?: string) => void  | 否       | 保存成功事件                                                 |
| onSaveFail   | (err?: any) => void     | 否       | 保存失败事件                                                 |

Methods

| 方法                 | 类型                                                         | 描述                                                         |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| init                 | () => Promise<void>                                          | 初始化                                                       |
| clearCanvas          | () => void                                                   | 清除画布                                                     |
| savePosterToPhoto    | () => Promise<string>                                        | 保存到相册                                                   |
| canvasToTempFilePath | () => Promise<string>                                        | 生成临时图片，h5返回base64，小程序返回临时文件路径           |
| preloadImage         | (list: string[] \| PosterItemConfig[] \| ((instance: PosterRenderCore) => PosterItemConfig[])) => promise<boolean> | 预加载图片，建议在渲染前调用，减少时间，否则图片会按顺序下载，有一张图片失败就会返回false，但不会阻塞后续图片下载 |
| paintImage           | (options: Omit<PaintImage, "type">): Promise<void>           | 绘制图片，支持圆角，填充模式                                 |
| paintRect            | (options: Omit<PaintRect, "type">): Promise<void>            | 绘制矩形，支持圆角，如果要绘制圆形，宽高一样radius设为宽高一半即可 |
| paintLine            | (options: Omit<PaintLine, "type">): Promise<void>            | 绘制线                                                       |
| paintText            | (options: Omit<PaintText, "type">): Promise<number>          | 绘制文字                                                     |
| measureText          | (text: string, options?: MeasureTextOptions): TextMetrics    | 测量文字信息（主要是宽度），如果要测量的文字字体大小与当前渲染文字大小不一致，需要传入第二个参数指定字体信息 |
| render               | (list: PosterItemConfig[] \| ((instance: PosterRenderCore) => PosterItemConfig[]), type?: "canvas" \| "image"): Promise<void> | 渲染一组数据                                                 |



list支持三种类型：``image``、``text``、``rect`` ``line``

image类型(PaintImage)

| 字段            | 类型                                       | 是否必填 | 描述                                                         |
| --------------- | ------------------------------------------ | -------- | ------------------------------------------------------------ |
| type            | String                                     | 是       | 固定为image                                                  |
| x               | number                                     | 是       | 左上角x坐标                                                  |
| y               | number                                     | 是       | 左上角y坐标                                                  |
| sx              | number                                     | 否       | 源图片被截取部分左上角顶点的横坐标，cover模式下生效，默认长边局中显示 |
| sy              | number                                     | 否       | 源图片被截取部分左上角顶点的纵坐标，cover模式下生效，默认长边局中显示 |
| width           | number                                     | 是       | 图片宽                                                       |
| height          | number                                     | 是       | 图片高                                                       |
| src             | string                                     | 是       | 图片路径，支持https、wxfile、base64                          |
| defaultSrc      | string                                     | 否       | 默认图片，src下载失败采用下载默认图                          |
| backgroundColor | string                                     | 否       | 背景色                                                       |
| radius          | number \| [number, number, number, number] | 否       | 圆角半径，顺序：左上 -> 右上 -> 右下 -> 左下，如果要绘制圆形，宽高一致，radius设为宽高一半 |
| mode            | "fill" \| "cover" \| "contain"             | 否       | 图片裁剪方式，默认fill。fill-填充模式，图片会占满绘制区域，contain-保持纵横比缩放图片，使图片的长边能完全显示出来，cover-保持纵横比缩放图片，只保证图片的短边能完全显示出来 |

text类型(PaintText)

| 字段           | 类型                                                         | 是否必填    | 描述                                                         |
| -------------- | ------------------------------------------------------------ | ----------- | ------------------------------------------------------------ |
| type           | String                                                       | 是          | 固定为text                                                   |
| x              | ((textWidth: number, instance: PosterRenderCore) => number) \| number; | 是          | 左上角x坐标。当为函数时参数为text宽度，可以根据文字宽度动态计算x坐标 |
| y              | number                                                       | 是          | 左上角y坐标                                                  |
| width          | ((textWidth: number, instance: PosterRenderCore) => number) \| number; | 是          | 文字宽，当为函数时参数为text宽度                             |
| height         | number                                                       | 是          | 文字高                                                       |
| text           | string                                                       | 是          | 文字内容                                                     |
| textAlign      | "left" \| "center" \| "right"                                | 否          | 文字对齐方式，默认left,注意这里跟css文字对齐方式不一样，请仔细[查看文档](https://developers.weixin.qq.com/miniprogram/dev/api/canvas/CanvasContext.setTextAlign.html) |
| fontWeight     | "normal" ｜ "bold"                                           | 否          | 默认normal                                                   |
| color          | string                                                       | 是          | 字体颜色                                                     |
| fontSize       | number                                                       | 是          | 字体大小                                                     |
| fontStyle      | "normal" \| "italic" \| "oblique"                            | 否          | 默认normal                                                   |
| fontFamily     | string                                                       | 否          |                                                              |
| lineHeight     | number                                                       | 否          | 行高                                                         |
| baseLine       | "top" \| "bottom" \| "middle" \| "normal"                    | 否          | 默认top，方便计算坐标                                        |
| opacity        | number                                                       | 否          | 字体透明度                                                   |
| lineNum        | number                                                       | 否          | 行数，默认1行，超出自动显示...                               |
|textDecoration | "line-through"  \| "underline" \| "overline"                  |否|文字装饰线,支持下划线、上划线、删除（线的y坐标计算的可能不是很准，不满意的话用线自己绘制吧）|
| textDecorationWidth | number | 否 | 文字装饰线宽 |

rect类型(PaintRect)

| 字段            | 类型                                      | 是否必填 | 描述                                                         |
| --------------- | ----------------------------------------- | -------- | ------------------------------------------------------------ |
| type            | String                                    | 是       | 固定为rect                                                   |
| x               | number                                    | 是       | 左上角x坐标                                                  |
| y               | number                                    | 是       | 左上角y坐标                                                  |
| width           | number                                    | 是       | 图片宽                                                       |
| height          | number                                    | 是       | 图片高                                                       |
| borderColor     | string                                    | 否       | 边框颜色                                                     |
| borderWidth     | number                                    | 否       | 边框宽                                                       |
| backgroundColor | string                                    | 否       | 填充色                                                       |
| radius          | number \| [number, number, number,number] | 否       | 圆角半径，顺序：左上 -> 右上 -> 右下 -> 左下，如果要绘制圆形，宽高一致，radius设为宽高一半 |

Line类型(PaintLine)

| 字段      | 类型   | 是否必填 | 描述       |
| --------- | ------ | -------- | ---------- |
| type      | String | 是       | 固定为line |
| x         | number | 是       | 起始点x    |
| y         | number | 是       | 起始点y    |
| destX     | number | 是       | 目标点x    |
| destY     | number | 是       | 目标点y    |
| color     | string | 否       | 线颜色     |
| lineWidth | number | 否       | 线款       |

## 注意

- canvas没有层级，后渲染的可能会盖住之前的内容，所以list要注意顺序，这里使用了``for await...of``特性实现“同步”渲染

  ```ts
  for await (const item of props.list) {
    await $freePoster.current.exec(item);
  }
  ```

- 小程序图片域名要提前配置到下载白名单

- 建议预加载图，否则图片会按顺序下载，增加渲染时常

- 受网路影响图片可能会下载失败，这里做了两次下载重试

- 微信小程序canvas2d 画布高度不能超过4096（其他小程序没测试），所以初始化时画布超过4096会抛错

- 默认渲染会开启高清模式，即画布会放大dpr倍，但是放大后画布尺寸可能会超限，所以，监测到画布高度超过4096后会取消高清模式，避免报错

- 部分安卓手机企微下会报“canvasToTempFilePath:fail:convert native buffer parameter fail. native buffer exceed size limit.”，查了下说是高清方案引起的，dpr超过3都会出现该问题，为了不报错，安卓手机企微下默认不启用高清模式，如果觉着海报不清楚，可以手动指定dpr

- 生成海报模糊？采用高清图、画布调大点、调高dpr（注意渲染速度，自己权衡吧）