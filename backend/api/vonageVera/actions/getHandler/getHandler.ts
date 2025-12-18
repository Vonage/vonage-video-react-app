import type { Handler } from 'express';
import httpHandler from '@common/routing/httpHandler';
import assertVeraRequest from './helpers/assertVeraRequest';
import ActionExecutor from './ActionExecutor';
import { ActionResult } from './schemas/ActionResult';
import { ActionInput } from '../../types';
import { VeraAction } from './schemas/VeraAction';

type VonageVera = import('../../VonageVera').default;

function getHandler(this: VonageVera): Handler;

function getHandler(this: VonageVera): Handler;

function getHandler(this: VonageVera): Handler {
  type HandlerExtensions = {
    provider: VonageVera;
  };

  const actionExecutor = new ActionExecutor();

  const expressHandler: Handler = httpHandler<unknown, ActionResult<unknown>, unknown>(
    async (req, res) => {
      assertVeraRequest(req);

      const { action, payload } = req.body;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await actionExecutor[action](
        payload as unknown as Parameters<(typeof actionExecutor)[action]>[0]
      );

      return res.json({ message: 'VonageVera is up and running!' });
    }
  );

  const extensions = { provider: this };

  Object.assign(expressHandler, extensions as HandlerExtensions);

  return expressHandler;
}

export default getHandler;
