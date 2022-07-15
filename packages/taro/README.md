# @poster-render/taro

通过配置的方式渲染海报，无需了解canvas语法

采用canvas2d api封装，支持同层渲染，支持微信/企微、支付宝、h5

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



```tsx

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
// 提前加载图片，可以省略这一步
await poster.preloadImage(props.list);
// 绘制图片
await poster.paintImage({
    x: 60,
    y: 380,
    width: 400,
    height: 300,
    backgroundColor: "red",
    mode: "cover",
    src: "https://img.1000.com/shumou/interaction/img2.png",
})
// 绘制react
poster.paintRect({
    x: 100,
    y: 800,
    width: 100,
    height: 100,
    backgroundColor: "red",
    radius: 50,
    borderColor: "yellow",
    borderWidth: 10,
})
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

await poster.render(props.list);
```

如果不喜欢我的封装可以使用api的方式自己封装react组件

```ts
import { FreePoster } from 'taro-poster-render';

const freePoster = new FreePoster({
  canvasId,
  debug: props.debug,
  width: props.width,
  height: props.height,
  quality: props.quality,
  fileType: props.fileType,
  downloadLimit: props.downloadLimit,
  onSave: props.onSave,
  onSaveFail: props.onSaveFail,
});

// 设置背景色
freePoster.setCanvasBackground('red')
// 绘制文本
freePoster.paintText({...})
// 绘制图片
freePoster.paintImage({...}) 
// 绘制shape
freePoster.paintShape({...})   
```

## 

## props

| 字段                  | 类型                                                                                                               | 是否必填 | 描述                                                                             |
|:--------------------|:-----------------------------------------------------------------------------------------------------------------| :---- |--------------------------------------------------------------------------------|
| canvasId            | string                                                                                                           | 否 |                                                                                |
| className           | string                                                                                                           | 否 |                                                                                |
| style               | CSSProperties                                                                                                    | 否 | 默认宽为pxTransform(画布宽),高为pxTransform(画布高)                                        |
| width               | number                                                                                                           | 否 | 画布宽度（rpx）                                                                      |
| height              | number                                                                                                           | 否 | 画布高度（rpx）                                                                      |
| destWidth           | number                                                                                                           | 否 | 输出图片宽度（rpx）                                                                    |
| destHeight         | number                                                                                                           | 否 | 输出图片高度（rpx）                                                                    |
| debug               | boolean                                                                                                          | 否 | 开启调试日志                                                                         |
| fileType            | "png" \| "jpg"                                                                                                    | 否 | 导出图片格式，默认png                                                                   |
| quality             | number                                                                                                           | 否 | 导出图片质量0-1，默认为1，只对jpg生效                                                         |
| backgroundColor     | string                                                                                                           | 否 | 背景色                                                                            |
| renderType          | "image" \| "canvas" | 是                                                                              | 渲染方式，默认是图片方式兼容性好，canvas方式速度快，但是不支持识别二维码,也不支持同层渲染 |
| disableRerender     | boolean                                                                                                          | 否 | 禁用re-render。只有list发生变化才会导致re-render，但是list如果传了函数就会导致优化失效，可以采用disableRerender禁用 |
| showMenuByLongpress | boolean                                                                                                          | 否 | 开启长按图片显示识别小程序码菜单（支持转发、下载、收藏、识别二维码），图片模式时生效                                     |
| downloadLimit       | number                                                                                                           | 否 | 图片并行下载数，范围1-10，默认10                                                            |
| onLongPress         | (url?: string) => void;                                                                                          | 否 | 长按事件，图片模式时接收海报url参数，canvas模式时无参数                                               |
| onRender            | (url?: string) => void;                                                                                          | 否 | 渲染完成事件，图片模式时接收海报url参数，canvas模式时无参数                                             |
| onRenderFail        | (err: any) => void                                                                                               | 否 | 渲染失败事件                                                                         |
| onSave              | (url: string) => void                                                                                            | 否 | 保存成功事件                                                                         |
| onSaveFail          | (err: any) => void                                                                                               | 否 | 保存失败事件                                                                         |
| list                | [PosterItemConfig](https://github.com/lf7817/taro-poster-render/blob/main/src/components/Poster/types.ts#L71)[] \| (instance: FreePoster) => PosterItemConfig[] | 是                                                                              | 图片、文字、图形配置,当为函数时接受FreePoster实例。一般传数组即可，如果要实现上面多段文字联动局中效果，可以改用函数（如果传函数的话需要自己处理re-render的问题） |

list支持三种类型：``image``、``text``、``shape``

image类型

| 字段            | 类型                                                 | 是否必填 | 描述                                                         |
| --------------- | ---------------------------------------------------- | -------- | ------------------------------------------------------------ |
| type            | String                                               | 是       | 固定为image                                                  |
| x               | number                                               | 是       | 左上角x坐标，单位rpx                                         |
| y               | number                                               | 是       | 左上角y坐标，单位rpx                                         |
| sx              | number                                               | 否       | 源图片被截取部分左上角顶点的横坐标，单位rpx，cover模式下生效，默认长边局中显示 |
| sy              | number                                               | 否       | 源图片被截取部分左上角顶点的纵坐标，单位rpx，cover模式下生效，默认长边局中显示 |
| width           | number                                               | 是       | 图片宽，单位rpx                                              |
| height          | number                                               | 是       | 图片高，单位rpx                                              |
| src             | string                                               | 是       | 图片路径，支持https、wxfile协议，暂不支持base64              |
| defaultSrc      | string                                               | 否       | 默认图片，src下载失败采用下载默认图                          |
| backgroundColor | string                                               | 否       | 背景色                                                       |
| radius          | number \|\`${number} ${number} ${number} ${number}\` | 否       | 圆角半径，顺序：左上 -> 右上 -> 右下 -> 左下，如果要绘制圆形，宽高一致，radius设为宽高一半 |
| mode            | "fill" \| "cover" \| "contain"                       | 否       | 图片裁剪方式，默认fill。fill-填充模式，图片会占满绘制区域，contain-保持纵横比缩放图片，使图片的长边能完全显示出来，cover-保持纵横比缩放图片，只保证图片的短边能完全显示出来 |

text类型

| 字段       | 类型                                                         | 是否必填 | 描述                                                         |
| ---------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------ |
| type       | String                                                       | 是       | 固定为text                                                   |
| x          | ((textWidth: number, instance: FreePoster) => number) \| number; | 是       | 左上角x坐标，单位rpx。当为函数时参数为text宽度，可以根据文字宽度动态计算x坐标 |
| y          | number                                                       | 是       | 左上角y坐标，单位rpx                                         |
| width      | ((textWidth: number, instance: FreePoster) => number) \| number; | 是       | 文字宽，单位rpx，当为函数时参数为text宽度                    |
| height     | number                                                       | 是       | 文字高，单位rpx                                              |
| text       | string                                                       | 是       | 文字内容                                                     |
| textAlign  | "left" \| "center" \| "right"                                | 否       | 文字对齐方式，注意这里跟css文字对齐方式不一样，请仔细[查看文档](https://developers.weixin.qq.com/miniprogram/dev/api/canvas/CanvasContext.setTextAlign.html) |
| fontWeight | "normal" ｜ "bold"                                           | 否       |                                                              |
| color      | string                                                       | 是       | 字体颜色                                                     |
| fontSize   | number                                                       | 是       | 字体大小，单位rpx                                            |
| fontStyle  | "normal" \| "italic" \| "oblique"                            | 否       |                                                              |
| fontFamily | string                                                       | 否       |                                                              |
| lineHeight | number                                                       | 否       | 行高，单位rpx                                                |
| baseLine   | "top" \| "bottom" \| "middle" \| "normal"                    | 是       | baseLine                                                     |
| opacity    | number                                                       | 否       | 字体透明度                                                   |
| lineNum    | number                                                       | 否       | 行数，默认1行，超出自动显示...                               |

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

| 方法              | 类型                             | 描述                     |
| ----------------- | -------------------------------- | ------------------------ |
| savePosterToPhoto | (url: string) => Promise<string> | 保存到相册，返回图片路径 |
| preview           | () => Promise<void>              | 预览图片                 |

## FreePoster实例方法

| 方法             | 类型                                                         | 描述                                                         |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| measureTextWidth | (text: string, options?: { fontSize: number; fontWeight?: string; fontStyle?: string; fontFamily?: string }) => number | 测量文字大小。如果要测量的文字字体大小与当前渲染文字大小不一致，需要传入第二个参数，指定fontSize |



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
- 生成图片模糊？那就把画布搞大点