import React, { FC, useRef } from 'react';
import {QMPoster, QMPosterRef} from '../../components/QMPoster';

const Index: FC = () => {
  const poster = useRef<QMPosterRef>(null);

  return (
    <QMPoster
      ref={poster}
      width={560}
      height={1000}
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
          x: 180,
          y: 250,
          width: 200,
          height: 200,
          fontSize: 36,
          lineNum: 2,
          lineHeight: 36,
          textAlign: 'left',
          color: '#000',
          text: '你好你好你canvas 你好你好你canvas 你好你好你canvas ',
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
