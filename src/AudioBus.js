import { decibelToLinear, linearToDecibel, isBrowser } from '@ircam/sc-utils';

class DBParam {
  #param = null;

  constructor(param) {
    this.#param = param;
  }

  get value() {
    return linearToDecibel(this.#param.value);
  }

  set value(value) {
    value = decibelToLinear(value);
    this.#param.value = value;
  }

  setValueAtTime(value, time) {
    value = decibelToLinear(value);
    this.#param.setValueAtTime(value, time);
  }

  linearRampToValueAtTime(value, time) {
    value = decibelToLinear(value);
    this.#param.linearRampToValueAtTime(value, time);
  }

  exponentialRampToValueAtTime(value, time) {
    value = decibelToLinear(value);
    this.#param.exponentialRampToValueAtTime(value, time);
  }

  setTargetAtTime(value, startTime, timeConstant) {
    value = decibelToLinear(value);
    this.#param.setTargetAtTime(value, startTime, timeConstant);
  }

  setValueCurveAtTime(values, startTime, duration) {
    values = values.map(value => decibelToLinear(value));
    this.#param.setValueCurveAtTime(values, startTime, duration);
  }

  cancelScheduledValues(cancelTime) {
    this.#param.cancelScheduledValues(cancelTime);
  }

  cancelAndHoldAtTime(cancelTime) {
    this.#param.cancelAndHoldAtTime(cancelTime);
  }
}

export default function createAudioBus(GainNode) {
  /**
   * Simple mutable audio bus controllable in dB.
   *
   * @param {AudioContext} context - AudioContext in which the audio bus lives
   * @param {object} options
   * @param {number} [options.volume=0] - Initial volume of the audio bus, in dB
   * @param {number} [options.mute=false] - Initial mute value of the audio bus
   */
  class AudioBus extends GainNode {
    static parameters = {
      volume: {
        type: 'float',
        // take a large range so that we can use different ramps
        min: -80,
        max: 24,
        default: 0,
      },
      mute: {
        type: 'boolean',
        default: false,
      },
      label: {
        type: 'string',
        default: 'audio-bus',
      },
    }

    #volumeNode = null;
    #volumeParam = null;
    #muteValue = false;

    constructor(context, {
      volume = 0,
      mute = false,
      label = 'audio-bus',
    } = {}) {
      super(context);

      this.label = label;

      this.#volumeNode = this.context.createGain();
      this.connect(this.#volumeNode);

      this.#volumeParam = new DBParam(this.#volumeNode.gain);
      this.#volumeParam.value = volume;

      // shadow native node connect / disconnect method
      // we can't declare these as method, because we use `this.connect` just above
      this.connect = (dest) => {
        this.#volumeNode.connect(dest);
      }

      this.disconnect = (dest) => {
        this.#volumeNode.disconnect(dest);
      }

      // @todo - should shadow `this.gain` too

      // init values
      this.mute = mute;
    }

    get volume() {
      return this.#volumeParam;
    }

    get mute() {
      return this.#muteValue;
    }

    set mute(value) {
      this.#muteValue = value;

      const gain = this.#muteValue ? 0 : 1;
      this.gain.setTargetAtTime(gain, this.context.currentTime, 0.005);
    }
  }

  return AudioBus;
}
