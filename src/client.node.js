import ClientPluginMixing from './ClientPluginMixing.js';
import createAudioBus from './AudioBus.js';
import { GainNode } from 'node-web-audio-api';

// @todo - remove this workaround once we have a proper isomorphic-web-audio-api package
const AudioBus = createAudioBus(GainNode);
ClientPluginMixing.AudioBus = AudioBus;

export default ClientPluginMixing;

