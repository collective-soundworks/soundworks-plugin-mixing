import { html, css, LitElement } from 'lit';

import '@ircam/sc-components/sc-slider.js';
import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-toggle.js';

class SwMixerTrack extends LitElement {
  static properties = {
    channel: { type: Number },
    name: { type: String },
    volume: { type: Number },
    mute: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 80px;
      background-color: #121212;
      box-sizing: border-box;
      border: 1px solid #343434;
      padding: 4px;
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      flex-direction: column;
    }

    p {
      margin: 0 0 2px;
      height: 20px;
    }

    .name {
      font-style: italic;
    }

    sc-slider {
      width: 100%;
      height: 100%;
      font-size: 10px;
    }

    .mute {
      margin-top: 5px;
      display: flex;
    }

    .mute p {
      font-size: 10px;
      width: 60px;
      height: 20px;
      line-height: 20px;
    }

    .mute sc-toggle {
      width: 40px;
      height: 20px;
    }
  `;

  constructor() {
    super();

    this.unobserve = null;
  }

  render() {
    const classes = {
      track: true,
    };

    return html`
      <div>
        <!-- <p>channel: ${this.channel}</p> -->
        <p class="name">${this.state.get('label')}</p>
      </div>
      <sc-slider
        relative
        min="-80"
        max="12"
        step="1"
        orientation="vertical"
        number-box
        value=${this.state.get('volume')}
        @input=${e => this.state.set({ volume: e.detail.value })}
      ></sc-slider>
      <div class="mute">
        <p>mute:</p>
        <sc-toggle
          ?active=${this.state.get('mute')}
          @change=${e => this.state.set({ mute: e.detail.value })}
        ></sc-toggle>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.unobserve = this.state.onUpdate(() => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.unobserve();
  }
}

if (customElements.get('sw-mixer-track') === undefined) {
  customElements.define('sw-mixer-track', SwMixerTrack);
}
