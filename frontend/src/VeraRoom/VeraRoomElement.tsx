import ReactDOM from 'react-dom/client';
import VeraRoom from './VeraRoom';
import {
  type BridgeAttribute,
  isBridgeAttribute,
  bridgeAttributesMap,
  bridgeAttributes,
} from './stores/bridge';
import { initialState } from './stores/bridge/constants';
import type { Any, KebabToCamel } from '@common/types';
import { ShadowStylesProvider } from './providers';
import veraStyles from './styles.css?inline';

type BridgeProps = ReturnType<typeof initialState>;

class VeraRoomElement extends HTMLElement {
  static tagName = 'vera-room';

  // React root and shadow
  shadow: ShadowRoot;
  mount: HTMLDivElement;
  root?: ReactDOM.Root;

  /**
   * Mirror of the observed HTML attributes as camelCase props.
   * Updated in attributeChangedCallback and passed to <VeraRoom> on every render.
   */
  private bridgeProps: BridgeProps = initialState();

  constructor() {
    super();

    // will use shadow to have isolated css that will not collisions with the target webpage
    this.shadow = this.attachShadow({ mode: 'open' });

    this.mount = document.createElement('div');
    this.mount.classList.add('vera-room-root');

    // Use adoptedStyleSheets for Tailwind CSS (processed by Vite)
    const tailwindSheet = new CSSStyleSheet();
    tailwindSheet.replaceSync(veraStyles);
    this.shadow.adoptedStyleSheets = [tailwindSheet];

    // Additional host-level styles
    const hostStyle = document.createElement('style');
    hostStyle.textContent = `
      :host {
        display: block;
        position: relative;
      }
      .vera-room-root {
        width: 100%;
        height: 100%;
      }
    `;

    this.shadow.appendChild(hostStyle);
    this.shadow.appendChild(this.mount);
  }

  connectedCallback() {
    if (!this.root) {
      this.root = ReactDOM.createRoot(this.mount);
    }

    this.renderReactTree();
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = undefined;
  }

  static get observedAttributes() {
    return bridgeAttributes;
  }

  attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown) {
    if (oldValue === newValue || !isBridgeAttribute(name)) return;

    const updates = VeraRoomElement.tryParseAttribute(name, newValue);

    this.bridgeProps = { ...this.bridgeProps, ...updates };
    this.renderReactTree();
  }

  /**
   * (Re-)renders the React tree with the current bridge props.
   * React's reconciler diffs against the previous render, so this is safe to call on every attribute change.
   */
  private renderReactTree() {
    this.root?.render(
      <ShadowStylesProvider shadowRoot={this.shadow}>
        <VeraRoom {...this.bridgeProps} />
      </ShadowStylesProvider>
    );
  }

  static tryParseAttribute<T extends BridgeAttribute>(
    name: T,
    value: unknown
  ): { [K in KebabToCamel<T>]: Any } {
    const meta = bridgeAttributesMap[name];

    const parsed = (() => {
      switch (meta.type) {
        case 'string':
          return String(value);
        default:
          throw new Error(`Unsupported attribute type for "${name}"`);
      }
    })();

    return { [meta.name]: parsed } as { [K in KebabToCamel<T>]: Any };
  }
}

// Define the custom element
customElements.define(VeraRoomElement.tagName, VeraRoomElement);

export default VeraRoomElement;
