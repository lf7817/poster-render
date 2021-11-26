import Taro from "@tarojs/taro";
import React, {FC, useEffect, useRef, useState} from 'react';
import {QMPoster, QMPosterRef} from '../../components/QMPoster';

const Index: FC = () => {
  const poster = useRef<QMPosterRef>(null);
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    setInterval(() => setCounter(Math.random()), 3000)
  }, [])

  console.log(counter)

  return (
    <QMPoster
      style={{marginLeft: Taro.pxTransform(55)}}
      width={644}
      height={1104}
      ref={poster}
      debug
      quality={1}
      showMenuByLongpress
      onLongPress={() => poster.current?.savePosterToPhoto()}
      onRender={(url) => console.log('onRender', url)}
      onSave={(url) => console.log('onSave', url)}
      list={[
        {
          type: 'image',
          x: 0,
          y: 0,
          width: 644,
          height: 1104,
          src: 'https://img.1000.com/shumou/interaction/bg3.png',
          radius: '100 100 0 0'
        },
        {
          type: 'image',
          x: 294,
          y: 30,
          width: 96,
          height: 96,
          radius: 48,
          src: 'https://img.1000.com/shumou/interaction/avatar.png',
        },
        {
          type: 'text',
          x: 200,
          y: 180,
          width: 100,
          height: 30,
          text: '啊实打实',
          color: '#fff',
          fontSize: 28,
          baseLine: 'normal',
        },
        {
          type: 'text',
          x: 316,
          y: 180,
          width: 200,
          height: 30,
          text: '的助力邀请',
          color: '#FEEE93',
          fontSize: 28,
          baseLine: 'normal',
        },
        {
          type: 'image',
          x: 70,
          y: 240,
          width: 508,
          height: 68,
          src: 'https://img.1000.com/shumou/interaction/text.png',
        },
        {
          type: 'image',
          x: 60,
          y: 380,
          width: 590,
          height: 354,
          src: 'https://img.1000.com/shumou/interaction/img2.png',
        },
        {
          type: 'shape',
          x: 22,
          y: 760,
          width: 600,
          height: 320,
          fillStyle: '#fff',
          radius: 20,
          strokeStyle: "#000",
          lineWidth: 10
        },
        {
          type: 'shape',
          x: 100,
          y: 800,
          width: 100,
          height: 100,
          fillStyle: 'red',
          radius: 50,
          strokeStyle: "yellow",
          lineWidth: 10
        },
      ]}
    />
  );
};

export default Index;
