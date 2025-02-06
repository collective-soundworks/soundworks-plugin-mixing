import { ClientPlugin } from '@soundworks/core/client.js';

export default class ClientPluginMixing extends ClientPlugin {
  #masterState = null;
  // role controller
  #trackCollection = null;
  // role track
  #trackState = null;
  #trackBus = null;
  #masterBus = null;

  constructor(client, id, options) {
    super(client, id);

    this.options = Object.assign({
      role: null,
      audioContext: null,
      label: null,
    }, options)

    if (!['controller', 'track'].includes(options.role)) {
      throw new TypeError(`Cannot construct ClientPluginMixing: Invalid enum value for option "role" (${options.role}), should be either "controller" or "track"`);
    }

    if (options.role === 'track') {
      // if (!(options.audioContext instanceof AudioContext)) { // this is problematic when working with `npm link`
      if (options.audioContext.constructor.name !== 'AudioContext') {
        throw new Error(`Cannot construct ClientPluginMixing: Invalid value for option "audioContext", should be an instance of AudioContext`);
      }
    }

    this.role = options.role;
    this.audioContext = options.audioContext;
  }

  get masterState() {
    return this.#masterState;
  }

  get trackState() {
    return this.#trackState;
  }

  get trackCollection() {
    return this.#trackCollection;
  }

  get input() {
    return this.#trackBus;
  }

  async start() {
    super.start();

    this.#masterState = await this.client.stateManager.attach(`sw:plugin:${this.id}:master`);

    switch (this.role) {
      case 'controller': {
        this.#trackCollection = await this.client.stateManager.getCollection(`sw:plugin:${this.id}:track`);
        break;
      }
      case 'track': {
        this.#trackState = await this.client.stateManager.create(`sw:plugin:${this.id}:track`, {
          label: typeof this.options.label === 'string' ? this.options.label : `track-${this.client.id}`,
        });

        this.#masterBus = new ClientPluginMixing.AudioBus(this.audioContext, this.#masterState.getValues());
        // @todo - should be able to change output
        this.#masterBus.connect(this.audioContext.destination);
        this.#trackBus = new ClientPluginMixing.AudioBus(this.audioContext, this.#trackState.getValues());
        this.#trackBus.connect(this.#masterBus);

        this.#bindStateToBus(this.#masterState, this.#masterBus);
        this.#bindStateToBus(this.#trackState, this.#trackBus);
        break;
      }
    }
  }

  async stop() {
    super.stop();

    await this.#masterState.detach();

    if (this.#trackCollection) {
      await this.#trackCollection.detach();
    }

    if (this.#trackState ) {
      await this.#trackState.delete();
    }
  }

  #bindStateToBus(state, bus) {
    state.onUpdate(updates => {
      for (let [key, value] of Object.entries(updates)) {
        switch (key) {
          case 'volume':
            bus.volume.setTargetAtTime(value, this.audioContext.currentTime, 0.01);
            break;
          case 'mute':
            bus.mute = value;
            break;
          case 'label':
            bus.label = value;
            break;
        }
      }
    });
  }
}
