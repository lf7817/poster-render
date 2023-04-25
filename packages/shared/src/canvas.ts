import {
  CommonParams,
  DownloadImageOptions,
  DrawImageOptions,
  DrawLineOptions,
  DrawRectOptions,
  DrawTextOptions,
  MeasureTextOptions,
  Radius,
  PosterItemConfig,
  PreloadImageItem,
} from "./types";

/**
 * 绘制线
 * @param ctx
 * @param options
 */
export async function drawLine(common: CommonParams, options: DrawLineOptions) {
  const { ctx } = common;
  ctx.save();
  ctx.setLineDash(options.lineDash || []);
  ctx.lineWidth = options.lineWidth;
  ctx.strokeStyle = options.color;
  ctx.lineCap = options.lineCap || "butt";
  ctx.lineDashOffset = options.lineDashOffset ?? 0.0;
  ctx.beginPath();
  ctx.moveTo(options.x, options.y);
  ctx.lineTo(options.destX, options.destY);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/**
 * 绘制矩形
 * @param ctx
 * @param options
 */
export async function drawRect(common: CommonParams, options: DrawRectOptions) {
  const { ctx } = common;
  const radius = normalizeRadius(options.radius);
  const { x, y, width, height, borderWidth, borderColor, backgroundColor } =
    options;

  ctx.save();
  ctx.setLineDash(options.lineDash ?? []);
  ctx.lineDashOffset = options.lineDashOffset ?? 0.0;
  ctx.beginPath();
  ctx.moveTo(x + radius.topLeft, y);
  // 绘制上边
  ctx.lineTo(x + width - radius.topRight, y);
  // 绘制右上角圆弧
  ctx.arcTo(x + width, y, x + width, y + radius.topRight, radius.topRight);
  // 绘制右边
  ctx.lineTo(x + width, y + height - radius.bottomRight);
  // 绘制右下角圆弧
  ctx.arcTo(
    x + width,
    y + height,
    x + width - radius.bottomRight,
    y + height,
    radius.bottomRight
  );
  // 绘制下边
  ctx.lineTo(x + radius.bottomLeft, y + height);
  // 绘制左下角圆弧
  ctx.arcTo(
    x,
    y + height,
    x,
    y + height - radius.bottomLeft,
    radius.bottomLeft
  );
  // 绘制左边
  ctx.lineTo(x, y + radius.topLeft);
  // 绘制左上角圆弧
  ctx.arcTo(x, y, x + radius.topLeft, y, radius.topLeft);
  ctx.closePath();

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fill();
  }

  if (borderColor && borderWidth) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 解析圆角半径
 * @param radius
 * @desc 老版本canvas圆角半径小于2的话安卓会出问题，新版本待测
 */
function normalizeRadius(radius: Radius = 2) {
  if (typeof radius === "number") {
    return {
      topLeft: Math.max(radius, 2),
      topRight: Math.max(radius, 2),
      bottomLeft: Math.max(radius, 2),
      bottomRight: Math.max(radius, 2),
    };
  }
  if (Array.isArray(radius)) {
    // TODO: 验证安卓新版canvas圆角半径小于2的问题
    return {
      topLeft: Math.max(radius[0], 2),
      topRight: Math.max(radius[1], 2),
      bottomRight: Math.max(radius[2], 2),
      bottomLeft: Math.max(radius[3], 2),
    };
  }
  return {
    topLeft: 2,
    topRight: 2,
    bottomLeft: 2,
    bottomRight: 2,
  };
}

/**
 * 图片缓存
 */
const imageCache = new Map<string, any>();

/**
 * 下载图片
 * @param options
 */
export async function downloadImage<R = any>(
  options: DownloadImageOptions
): Promise<R | undefined> {
  return new Promise((resolve) => {
    const isWeb = !!document && !options.canvas.createImage;
    const image = isWeb ? new Image() : options.canvas.createImage();

    if (isWeb) {
      // 解决web端跨域问题
      image.setAttribute("crossOrigin", "Anonymous");
    }

    image.onload = () => resolve(image);

    image.onerror = () => {
      // 真机下不要打印base64,会导致控制台卡死
      if (!options.src.startsWith("data:image")) {
        console.error("[poster-render]: downloadImage error", options.src);
      }
      // TODO base64下载失败时转成临时文件
      resolve(undefined);
    };

    image.src = options.src;

    if (options.src.startsWith("data:image") && !options.cacheKey) {
      console.warn("[poster-render]: 使用base64图片时建议指定cacheKey");
    }
  });
}

/**
 * 加载图片
 * @param options
 */
export async function loadImage<R = any>(
  options: DownloadImageOptions
): Promise<R | undefined> {
  if (!options.src) {
    return Promise.resolve(undefined);
  }

  const cacheKey = options.cacheKey ?? options.src;

  if (imageCache.has(cacheKey)) {
    return Promise.resolve(imageCache.get(cacheKey));
  }

  const img = await downloadImage(options);

  if (img) {
    imageCache.set(options.cacheKey ?? options.src, img);
  }

  return img;
}

/**
 * 绘制图片
 */
export async function drawImage(
  common: CommonParams,
  options: DrawImageOptions
) {
  const { ctx, canvas } = common;
  let image = await loadImage({
    ctx,
    canvas,
    src: options.src,
    cacheKey: options.cacheKey,
  });

  if (!image && options.defaultSrc) {
    image = await loadImage({
      ctx,
      canvas,
      src: options.defaultSrc,
      cacheKey: options.cacheKey,
    });
  }

  if (!image) {
    console.info(`图片下载失败，跳过渲染!`);
    return;
  }

  ctx.save();
  // 绘制区域
  await drawRect(common, options);
  // 裁剪
  ctx.clip();
  // 绘制图片
  await fitImage(ctx, image, options);
  ctx.restore();
}

/**
 * 图片处理
 * @see https://www.cnblogs.com/AIonTheRoad/p/14063041.html
 * @param options
 */
async function fitImage(
  ctx: CanvasRenderingContext2D,
  image: any,
  options: DrawImageOptions
) {
  const mode = options.mode || "fill";
  // 图片宽高比
  const imageRatio = image.width / image.height;
  // 绘制区域宽高比
  const rectRatio = options.width / options.height;
  let sw: number,
    sh: number,
    sx: number,
    sy: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number;

  if (mode === "contain") {
    if (imageRatio <= rectRatio) {
      dh = options.height;
      dw = dh * imageRatio;
      dx = options.x + (options.width - dw) / 2;
      dy = options.y;
    } else {
      dw = options.width;
      dh = dw / imageRatio;
      dx = options.x;
      dy = options.y + (options.height - dh) / 2;
    }
    ctx.drawImage(image as CanvasImageSource, dx, dy, dw, dh);
  } else if (mode === "cover") {
    if (imageRatio <= rectRatio) {
      sw = image.width;
      sh = sw / rectRatio;
      sx = 0;
      sy = (image.height - sh) / 2;
    } else {
      sh = image.height;
      sw = sh * rectRatio;
      sx = (image.width - sw) / 2;
      sy = 0;
    }
    ctx.drawImage(
      image as CanvasImageSource,
      options.sx ?? sx,
      options.sy ?? sy,
      sw,
      sh,
      options.x,
      options.y,
      options.width,
      options.height
    );
  } else {
    ctx.drawImage(
      image as CanvasImageSource,
      options.x,
      options.y,
      options.width,
      options.height
    );
  }
}

/**
 * 测量文字信息
 * @param ctx
 * @param text
 * @param options
 */
function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  options?: MeasureTextOptions
): TextMetrics {
  ctx.save();

  if (options) {
    const {
      fontStyle = "normal",
      fontFamily = "normal",
      fontWeight = "normal",
      fontSize,
      baseLine = "top",
    } = options;
    ctx.textBaseline = baseLine;
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  }

  const textMetrics = ctx.measureText(text);
  ctx.restore();

  return textMetrics;
}

/**
 * 计算TextDecoration位置
 * @param options
 */
function calcTextDecorationPosition(
  actualHeight: number,
  options: DrawTextOptions
): number {
  const { fontSize, textDecoration, baseLine = "top" } = options;
  const height = actualHeight || fontSize;
  let deltaY = 0;

  if (baseLine === "top") {
    if (textDecoration === "overline") {
      deltaY = 0;
    } else if (textDecoration === "underline") {
      deltaY = height;
    } else {
      deltaY = height / 2;
    }
  } else if (baseLine === "bottom") {
    if (textDecoration === "overline") {
      deltaY = -height;
    } else if (textDecoration === "underline") {
      deltaY = 0;
    } else {
      deltaY = -height / 2;
    }
  } else {
    if (textDecoration === "overline") {
      deltaY = -height / 2;
    } else if (textDecoration === "underline") {
      deltaY = height / 2;
    } else {
      deltaY = 0;
    }
  }

  return deltaY;
}

export async function drawText(common: CommonParams, options: DrawTextOptions) {
  const { ctx } = common;
  const {
    textAlign = "left",
    opacity = 1,
    lineNum = 1,
    lineHeight = 0,
    baseLine = "top",
    fontWeight = "normal",
    fontStyle = "normal",
    fontFamily = "sans-serif",
    textDecoration,
  } = options;

  ctx.save();
  ctx.beginPath();
  ctx.font = `${fontStyle} ${fontWeight} ${options.fontSize}px ${fontFamily}`;
  ctx.globalAlpha = opacity;
  ctx.fillStyle = options.color;
  ctx.textAlign = textAlign;
  ctx.textBaseline = baseLine;

  let textWidth: number = measureText(ctx, options.text, {
    fontSize: options.fontSize,
    fontFamily,
    fontStyle,
    fontWeight,
    baseLine,
  }).width;
  const width =
    typeof options.width === "number"
      ? options.width
      : options.width(textWidth, (text, options) =>
          measureText(ctx, text, options)
        );
  const x =
    typeof options.x === "number"
      ? options.x
      : options.x(textWidth, (text, options) =>
          measureText(ctx, text, options)
        );

  const textArr: string[] = [];
  if (textWidth > width) {
    // 文本宽度 大于 渲染宽度
    let fillText = "";
    let line = 1;
    for (let i = 0; i <= options.text.length - 1; i++) {
      // 将文字转为数组，一行文字一个元素
      fillText = fillText + options.text[i];
      if (
        measureText(ctx, fillText, {
          fontSize: options.fontSize,
          fontFamily,
          fontStyle,
          fontWeight,
          baseLine,
        }).width >= width
      ) {
        if (line === lineNum) {
          if (i !== options.text.length - 1) {
            fillText = fillText.substring(0, fillText.length - 1) + "...";
          }
        }
        if (line <= lineNum) {
          textArr.push(fillText);
        }
        fillText = "";
        line++;
      } else {
        if (line <= lineNum) {
          if (i === options.text.length - 1) {
            textArr.push(fillText);
          }
        }
      }
    }
    textWidth = width;
  } else {
    textArr.push(options.text);
  }

  textArr.forEach((item, index) => {
    const y = options.y + (lineHeight || options.fontSize) * index;
    ctx.fillText(item, x, y);
    const {
      width,
      actualBoundingBoxAscent = 0,
      actualBoundingBoxDescent = 0,
    } = measureText(ctx, item, {
      fontSize: options.fontSize,
      fontFamily,
      fontStyle,
      fontWeight,
      baseLine,
    });

    const actualHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;

    if (textDecoration) {
      const deltaY = calcTextDecorationPosition(actualHeight, options);
      ctx.moveTo(x, y + deltaY);
      ctx.lineTo(x + width, y + deltaY);
      ctx.lineWidth = options.textDecorationWidth ?? 2;
      ctx.strokeStyle = options.color;
      ctx.stroke();
    }
  });
  ctx.closePath();
  ctx.restore();
  return textWidth;
}

/**
 * 提前加载图片
 * @param urls
 */
export async function preloadImage(
  ctx: CanvasRenderingContext2D,
  canvas: any,
  images: PreloadImageItem[]
) {
  const needLoadImages = Array.from(
    new Set(images.filter((item) => !imageCache.has(item.cacheKey ?? item.src)))
  );
  const loadedImages = await Promise.all(
    needLoadImages.map((item) =>
      loadImage({
        ctx,
        canvas,
        src: item.src,
        cacheKey: item.cacheKey,
      })
    )
  );
  return !loadedImages.includes(undefined);
}

/**
 * 清除画布
 * @param common
 */
export function clearCanvas(common: CommonParams) {
  common.ctx.clearRect(0, 0, common.canvas.width, common.canvas.height);
}

/**
 *
 * @param common
 * @param config
 * @returns
 */
export async function renderItem(
  common: CommonParams,
  config: PosterItemConfig
) {
  switch (config.type) {
    case "image":
      return await drawImage(common, config);
    case "text":
      return await drawText(common, config);
    case "line":
      return await drawLine(common, config);
    case "rect":
      return await drawRect(common, config);
    default:
      throw new Error("[poster-render]: Unknown item type");
  }
}

/**
 * 渲染一组数据
 * @param common
 * @param list
 * @returns
 */
export async function render(common: CommonParams, list: PosterItemConfig[]) {
  try {
    for await (const item of list) {
      await renderItem(common, item);
    }
    return true;
  } catch (error) {
    return false;
  }
}
