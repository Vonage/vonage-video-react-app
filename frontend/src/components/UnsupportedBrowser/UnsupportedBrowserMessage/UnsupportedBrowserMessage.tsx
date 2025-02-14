import { ReactElement } from 'react';

/**
 * UnsupportedBrowserMessage Component
 *
 * This component warns users they are using a browser unsupported by the Vonage Video API Reference App.
 * @returns {ReactElement} The UnsupportedBrowserMessage component.
 */
const UnsupportedBrowserMessage = (): ReactElement => {
  const header = 'Your browser is unsupported';
  const message = 'Please use one of our supported browsers.';

  return (
    <div className="h-auto w-[400px] shrink py-4 ps-12 text-left">
      <h2 className="w-9/12 pb-5 text-5xl text-black">{header}</h2>
      <h3 className="text-lg text-slate-500">{message}</h3>
    </div>
  );
};

export default UnsupportedBrowserMessage;
