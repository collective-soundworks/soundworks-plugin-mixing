import { html, css, LitElement } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import './sw-mixer-track.js';

class SwPluginMixing extends LitElement {
  static styles = css`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
    }

    .sep {
      width: 1px;
      background-color: white;
      margin: 0 10px;
    }

    .master-track {
      background-color: var(--sc-color-secondary-3);
    }
  `;

  constructor() {
    super();

    this.plugin;

    this.masterSubscription = null;
    this.tracksSubscription = null;
  }

  render() {
    return html`
      <sw-mixer-track class="master-track" .state=${this.plugin.masterState}></sw-mixer-track>
      <div class="sep"></div>
      ${repeat(this.plugin.trackCollection, state => state.id, (state) => {
        return html`
          <sw-mixer-track .state=${state}></sw-mixer-track>
        `;
      })}
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.plugin.trackCollection.onAttach(() => this.requestUpdate());
    this.plugin.trackCollection.onDetach(() => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

if (customElements.get('sw-plugin-mixing') === undefined) {
  customElements.define('sw-plugin-mixing', SwPluginMixing);
}
