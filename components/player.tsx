import React from 'react'
import ReactPlayer from 'react-player'
import path from 'path'
import fs from 'fs';


export const Player = ({ url }: { url: string }) => {
  const ref = React.createRef<ReactPlayer>()
  return (
    <div>
      <ReactPlayer
        ref={ref}
        url={url}
        playing={false}
        controls={true}
        config={{ file: { attributes: { id: 'audio-element' } } }}
        width='320px'
        height='50px'
      />
    </div>
  )
}

const soundsDirectory = '/sounds';

export const getSoundDataPath = async (slug: string) => {
  const soundData = path.join(soundsDirectory, `${slug}.mp3`);
  return fs.existsSync(path.join(process.cwd(), 'public', soundData)) ? soundData : '';
};
