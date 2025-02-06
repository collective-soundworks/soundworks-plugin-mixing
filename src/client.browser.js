import createAudioBus from './AudioBus.js';
import ClientPluginMixing from './ClientPluginMixing.js';

// @todo - remove this workaround once we have a proper isomorphic-web-audio-api package
const AudioBus = createAudioBus(window.GainNode);
ClientPluginMixing.AudioBus = AudioBus;

export default ClientPluginMixing;

