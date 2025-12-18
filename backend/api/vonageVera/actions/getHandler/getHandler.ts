import type { Handler } from 'express';
import httpHandler from '@common/routing/httpHandler';
import assertVeraRequest from './helpers/assertVeraRequest';
import ActionExecutor from './ActionExecutor';
import { ActionResult } from './schemas/ActionResult';

type VonageVera = import('../../VonageVera').default;

type HandlerExtensions = {
  provider: VonageVera;
  executor: ActionExecutor;
};

type VeraHandler = Handler & HandlerExtensions;

function getHandler(this: VonageVera): VeraHandler;

function getHandler(this: VonageVera): VeraHandler;

function getHandler(this: VonageVera): VeraHandler {
  const { videoProvider } = this;
  const { storageProvider } = this.providerConfig;

  const executor = new ActionExecutor({
    storageProvider,
    videoProvider,
  });

  const expressHandler = httpHandler<unknown, ActionResult<unknown>, unknown>(async (req, res) => {
    assertVeraRequest(req);

    const { action, payload } = req.body;

    const result = await (executor[action] as ActionHandler).call(executor, payload);

    return res.json(result);
  });

  const extensions: HandlerExtensions = { provider: this, executor };

  return Object.assign(expressHandler, extensions);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionHandler = (...args: any[]) => ActionResult<unknown> | Promise<ActionResult<unknown>>;

export default getHandler;
