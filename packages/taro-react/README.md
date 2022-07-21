# @poster-render/taro-react

通过配置的方式渲染海报，无需了解canvas语法。采用canvas2d api封装，支持同层渲染，支持微信/企微、支付宝、头条、h5

## 安装

```bash
npm install @poster-render/taro-react
```

## 使用

```tsx
import { FC, useRef } from "react";
import { pxTransform } from "@tarojs/taro";
import { PosterRender, PosterRenderRef } from "@poster-render/taro-react";

const Index: FC = () => {
  const posterRender = useRef<PosterRenderRef>(null);

  return (
    <PosterRender
      ref={posterRender}
      canvasId="taro-poster-render"
      renderType={"canvas"}
      canvasWidth={644}
      canvasHeight={1104}
      debug
      style={{
        width: pxTransform(644),
        height: pxTransform(1104),
      }}
      onRender={() => console.log("onRender")}
      onLongTap={() => posterRender.current?.savePosterToPhoto())}
      onRenderFail={(err) => console.error("onRenderFail", err?.message)}
      onSave={(url) => console.log("onSave", url)}
      onSaveFail={(err) => console.error("onSaveFail", err?.message)}
      list={[
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
          type: "line",
          x: 50,
          y: 50,
          destX: 200,
          destY: 50,
          color: "#fff",
          lineWidth: 4,
        },
        {
          type: "text",
          x: 100,
          y: 180,
          width: 150,
          height: 30,
          text: "中二猪猪猪",
          color: "#fff",
          fontSize: 28,
          textAlign: "left",
          baseLine: "top",
          textDecoration: "line-through",
        },
      ]}
    />
  );
};

export default Index;

```

如果不喜欢我的封装可以使用[@poster-render/taro - npm (npmjs.com)](https://www.npmjs.com/package/@poster-render/taro)，以api的方式自己封装react组件或vue组件

## props

基础props

| 字段                  | 类型                                                                                                               | 是否必填 | 描述                                                                             |
|:--------------------|:-----------------------------------------------------------------------------------------------------------------| :---- |--------------------------------------------------------------------------------|
| className | string                                                                                                     | 否 |  |
| style | React.CSSProperties                                                                                        | 否 |  |
| canvasId | String                                                       | 否 | 默认“poster-render”，当有多个canvas时，需要指定canvasId，否则默认为第一个canvas |
| canvasWidth   | number                                                                                                           | 是 | 画布宽度, 注意不是css width                                                 |
| canvasHeight     | number                                                                                                           | 是 | 画布高度, 高度不要超过4096（报错）， 注意不是css height                                |
| destWidth           | number                                                                                                           | 否 | 输出图片宽度                                                                    |
| destHeight         | number                                                                                                           | 否 | 输出图片高度                                                                    |
| debug               | boolean                                                                                                          | 否 | 开启调试日志                                                                         |
| fileType            | "png" \| "jpg"                                                                                                    | 否 | 导出图片格式，默认png                                                                   |
| quality             | number                                                                                                           | 否 | 导出图片质量0-1，默认为1，只对jpg生效                                                         |
| dpr                 | number                                                       | 否       | 指定dpr，默认会启用高清方案，画布最终会被放大dpr倍（默认为系统dpr），但是某些场景画布太大会报错，或者画布太大导致生成图片太慢，这种情况可以指定dpr调整画布大小解决问题；支付宝小程序不支持，固定为1，安卓下企微dpr为3时生成图片会报错，固定为1，另外，如果画布高度乘以dpr超过4096,则会取消放大 |
| renderType          | "image" \| "canvas" | 是                                                                              | 渲染方式，默认是canvas, 新版canvas2d支持同层渲染（模拟器可能不支持），推荐canvas2d，如果想要实现长按海报识别二维码场景可以改为image，同时启用showMenuByLongpress |
| disableRerender     | boolean                                                                                                          | 否 | 禁用re-render。只有list发生变化才会导致re-render，但是list如果传了函数或者字体x或者width为函数时就会导致优化失效，可以采用disableRerender禁用 |
| list            | PosterItemConfig[] \| (instance: PosterRenderCore) => PosterItemConfig[] | 是       | 图片、文字、图形配置,当为函数时接受PosterRenderCore实例。一般传数组即可，如果要实现上面多段文字联动局中效果，可以改用函数（如果传函数的话需要自己处理re-render的问题） |
| onSave          | (url: string) => void                                        | 否       | 保存成功事件                                                 |
| onSaveFail      | (err?: any) => void                                          | 否       | 保存失败事件                                                 |
| onRenderFail    | (err?: any) => void                                          | 否       | 渲染失败事件                                                 |

renderType = "canvas"时

| 字段      | 类型           | 是否必填 | 描述         |
| :-------- | :------------- | :------- | ------------ |
| onLongTap | () **=>** void | 否       | 长按事件     |
| onRender  | () **=>** void | 否       | 渲染成功回调 |

renderType = "image"时

| 字段                | 类型                      | 是否必填 | 描述                                                         |
| :------------------ | :------------------------ | :------- | ------------------------------------------------------------ |
| onLongTap           | (url: string) **=>** void | 否       | 长按事件                                                     |
| onRender            | (url: string) **=>** void | 否       | 渲染成功回调                                                 |
| showMenuByLongpress | Boolean                   | 否       | 开启长按图片显示识别小程序码菜单（支持转发、下载、收藏、识别二维码），微信生效（企微不支持） |

list支持四种原子类型：``image``、``text``、``rect``、``line``，复杂的效果可用通过相互组合实现，自由发挥吧（如果有无法实现的场景请一定要给我提个issue，我会尽快支持的）

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

line类型(PaintLine)

| 字段      | 类型   | 是否必填 | 描述       |
| --------- | ------ | -------- | ---------- |
| type      | String | 是       | 固定为line |
| x         | number | 是       | 起始点x    |
| y         | number | 是       | 起始点y    |
| destX     | number | 是       | 目标点x    |
| destY     | number | 是       | 目标点y    |
| color     | string | 否       | 线颜色     |
| lineWidth | number | 否       | 线款       |

## 实例方法

| 方法              | 类型                               | 描述                     |
| ----------------- | ---------------------------------- | ------------------------ |
| savePosterToPhoto | () => Promise<string \| undefined> | 保存到相册，返回图片路径 |
| preview           | () => Promise<void>                | 预览图片                 |
| render            |                                    (config?: PosterItemConfig[] \| ((instance: PosterRenderCore) => PosterItemConfig[])) => Promise<void>| 渲染方法                 |

## PosterRenderCore实例方法

参考[@poster-render/taro - npm (npmjs.com)](https://www.npmjs.com/package/@poster-render/taro)

## 注意

- 建议renderType传canvas，canvas2d支持同层渲染了（模拟器不一定支持），当要实现长按识别二维码场景场景时可以使用image方式，同时启用showMenuByLongpress

- renderType为image时会先展示canvas，图片生成后会盖在canvas上面，至于为啥这样做，ios下如果把canvas移出可视区域会导致图片模糊，暂时先这么处理吧，有好的方案可以给我提个issue

- canvas没有层级，后渲染的可能会盖住之前的内容，所以list要注意顺序，这里使用了`for await...of`特性实现“同步”渲染

- 小程序图片域名要提前配置到下载白名单

- 建议预加载图，否则图片会按顺序下载，增加渲染时长

- 受网路影响图片可能会下载失败，这里做了两次下载重试

- canvas宽高跟css宽高不是一个概念不要搞混了

- 微信小程序canvas2d 画布高度不能超过4096（其他小程序没测试），所以初始化时画布超过4096会抛错

- 默认渲染会开启高清模式，即画布会放大dpr倍，但是放大后画布尺寸可能会超限，所以，检测到画布高度超过4096后会取消高清模式，避免报错

- 部分安卓手机企微下会报“canvasToTempFilePath:fail:convert native buffer parameter fail. native buffer exceed size limit.”，查了下说是高清方案引起的，dpr超过3都会出现该问题，为了不报错，安卓手机企微下默认不启用高清模式，如果觉着海报不清楚，可以手动指定dpr

- 生成海报模糊？采用高清图、画布调大点、调高dpr（注意渲染速度，自己权衡吧）

- 支付宝小程序要启用基础库2.0

- 如果想要兼容其他小程序可以给我提个issue



## 2.x升级到3.x

```bash
# 卸载2.x版本包
npm uninstall taro-poster-render
# 安装3.x版本包
npm install @poster-render/taro-react
```

有较大的break changes，但功能没怎么变，基本上就是修改了下api，字段名，对照新文档即可迁移