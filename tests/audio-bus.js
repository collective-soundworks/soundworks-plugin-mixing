import { AudioContext } from 'node-web-audio-api';
import { sleep } from '@ircam/sc-utils';

import AudioBus from '../src/AudioBus.js';

const audioContext = new AudioContext();
const audioBus = new AudioBus(audioContext);
audioBus.connect(audioContext.destination);

const src = audioContext.createOscillator();
src.frequency.value = 200;
src.connect(audioBus);
src.start();

await sleep(1);
console.log('-20 db');
audioBus.volume.value = -20;

await sleep(1);
console.log('-40 db');
audioBus.volume.setTargetAtTime(-40, audioContext.currentTime, 0.01);

await sleep(1);
console.log('0 db');
audioBus.volume.setValueAtTime(0, audioContext.currentTime);

await sleep(1);
console.log('mute');
audioBus.mute = true;

await sleep(1);
console.log('unmute');
audioBus.mute = false;

await sleep(1);
console.log('close context');
audioContext.close();

