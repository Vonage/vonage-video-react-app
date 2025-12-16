import type { Handler } from 'express';
export type VonageVera = import('../../VonageVera').default;

function getHandler() {
  const handler: Handler = (req, res) => {
    res.json({ message: 'VonageVera is up and running!' });
  };

  return handler;
}

export default getHandler;
