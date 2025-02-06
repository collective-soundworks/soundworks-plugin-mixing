
import { ServerPlugin } from '@soundworks/core/server.js';

// @todo - remove this workaround once we have a proper isomorphic-web-audio-api package
import createAudioBus from './AudioBus.js';
import { GainNode } from 'node-web-audio-api';

const AudioBus = createAudioBus(GainNode);

export default class ServerPluginMixing extends ServerPlugin {
  #masterState = null;

  constructor(server, id, options = {}) {
    super(server, id);

    this.server.stateManager.defineClass(`sw:plugin:${this.id}:master`, AudioBus.parameters);
    this.server.stateManager.defineClass(`sw:plugin:${this.id}:track`, AudioBus.parameters);
  }

  async start() {
    await super.start();

    this.#masterState = await this.server.stateManager.create(`sw:plugin:${this.id}:master`, {
      label: 'master',
    });
  }

  async stop() {
    await super.stop();

    await this.#masterState.delete();
  }
}

