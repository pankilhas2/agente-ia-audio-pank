import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tts, trilha, volumeVoz, volumeTrilha } = req.body;
  const output = path.resolve(`./public/mixado-${Date.now()}.mp3`);
  const cmd = `ffmpeg -i .${tts} -filter:a "volume=${volumeVoz / 100}" temp_vox.mp3 -y`;
  const trilhaCmd = `ffmpeg -i .${trilha} -filter:a "volume=${volumeTrilha / 100}" temp_trilha.mp3 -y`;
  const mixCmd = `ffmpeg -i temp_vox.mp3 -i temp_trilha.mp3 -filter_complex amix=inputs=2:duration=first:dropout_transition=3 -y ${output}`;

  exec(cmd, () => {
    exec(trilhaCmd, () => {
      exec(mixCmd, () => {
        const file = fs.readFileSync(output);
        res.setHeader('Content-Disposition', 'attachment; filename="audio-final.mp3"');
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(file);
        fs.unlinkSync('temp_vox.mp3');
        fs.unlinkSync('temp_trilha.mp3');
        fs.unlinkSync(output);
      });
    });
  });
}
