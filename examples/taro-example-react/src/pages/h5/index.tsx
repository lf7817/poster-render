import {FC} from "react";
import {View} from "@tarojs/components";
import Taro from "@tarojs/taro";

const h5: FC = () => {
  console.log(Taro.getSystemInfoSync())
  return <View>hell</View>
}

export default h5;
