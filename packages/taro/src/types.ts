export interface PosterRenderCoreOptions {
  id: string;
  /**
   * 画布宽度
   */
  width: number;
  /**
   * 画布高度
   * canvas2d高度不能超过4096，超过会报错
   */
  height: number;
  /**
   * 是否开启调试模式
   */
  debug?: boolean;
  /**
   * 导出图片格式
   */
  fileType?: "png" | "jpg";
  /**
   * 图片质量 0-1，只对jpg生效
   */
  quality?: number;
  /**
   * 输出的图片的宽度
   */
  destWidth?: number;
  /**
   * 输出的图片的高度
   */
  destHeight?: number;
  /**
   * 指定dpr
   * @desc 默认会启用高清方案，画布最终会被放大dpr倍（默认为系统dpr），
   * 但是某些场景画布太大会报错，或者画布太大导致生成图片太慢，这种情况可以
   * 指定dpr调整画布大小解决问题；
   * 支付宝小程序不支持，固定为1，安卓下企微dpr为3时生成图片会报错，固定为1
   * 如果画布高度乘以dpr超过4096,则会取消放大
   */
  dpr?: number;
  /**
   * 保存到相册成功回调
   */
  onSave?: (url: string) => void;
  /**
   * 保存到相册失败回调
   */
  onSaveFail?: (err?: any) => void;
  /**
   * 渲染成功回调
   */
  onRender?: (url?: string) => void;
  /**
   * 渲染失败回调
   */
  onRenderFail?: (err?: any) => void;
}
