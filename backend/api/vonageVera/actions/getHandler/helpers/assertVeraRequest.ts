import { ApplicationRequest } from '@common/routing/types';
import type { ActionResult } from '../schemas/ActionResult';
import type { VeraActionRequest } from '../schemas';

function assertVeraRequest<T extends ApplicationRequest<unknown, ActionResult<unknown>, unknown>>(
  req: T
): asserts req is T & {
  body: VeraActionRequest;
} {}

export default assertVeraRequest;
