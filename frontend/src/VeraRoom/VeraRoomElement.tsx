import ReactDOM from 'react-dom/client';
import VeraRoom from './VeraRoom';
import bridge$, {
  type BridgeAttribute,
  isBridgeAttribute,
  bridgeAttributesMap,
  bridgeAttributes,
  initialState,
} from './stores/bridge';
import type { Any, KebabToCamel } from '@common/types';
import { ShadowStylesProvider } from './providers';
import veraStyles from './styles.css?inline';
import { defer } from 'easy-cancelable-promise';
import { BridgeAPI } from './stores/bridge/types';
import { registerIcon } from '@vonage/vivid';

type BridgeState = ReturnType<BridgeAPI['getState']>;
type BridgeContext = ReturnType<typeof bridge$.Provider.makeProviderWrapper>['context'];

registerIcon();

class VeraRoomElement extends HTMLElement {
  static tagName = 'vera-room';

  // React root and shadow
  shadow: ShadowRoot;
  mount: HTMLDivElement;
  root?: ReactDOM.Root;
  context?: BridgeContext;
  isBridgeReady = defer<void>();

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
        overflow: auto;
      }
    `;

    this.shadow.appendChild(hostStyle);
    this.shadow.appendChild(this.mount);
  }

  connectedCallback() {
    if (!this.root) {
      this.renderReactTree();
    }
  }

  renderReactTree() {
    const { wrapper: BridgeProvider, context } = bridge$.Provider.makeProviderWrapper({
      onCreated: () => {
        this.isBridgeReady.resolve();
      },
    });

    this.context = context;
    this.root = ReactDOM.createRoot(this.mount);

    const initialState = this.readInitialAttributes();

    this.root?.render(
      <BridgeProvider value={initialState}>
        <ShadowStylesProvider shadowRoot={this.shadow}>
          <VeraRoom />
        </ShadowStylesProvider>
      </BridgeProvider>
    );
  }

  readInitialAttributes() {
    const initialValue = bridgeAttributes.reduce((acc, name) => {
      const rawValue = this.getAttribute(name);
      if (rawValue === null) return acc;

      const value = VeraRoomElement.tryParseAttribute(name, rawValue);

      return { ...acc, ...value };
    }, initialState()) as BridgeState;

    return initialValue;
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = undefined;
  }

  static get observedAttributes() {
    return bridgeAttributes;
  }

  async attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown) {
    if (oldValue === newValue || !isBridgeAttribute(name)) return;
    if (newValue === null) return;

    const updates = VeraRoomElement.tryParseAttribute(name, newValue);

    if (this.isBridgeReady.isPending()) {
      await this.isBridgeReady.promise;
    }

    this.context?.current.actions.partialUpdate(updates);
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
