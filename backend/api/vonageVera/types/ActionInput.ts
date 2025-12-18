import { VeraActionRequest } from '../actions/getHandler/schemas/VeraActionRequest';

export type ActionInput<A extends VeraActionRequest['action']> = Extract<
  VeraActionRequest,
  { action: A }
>['payload'];

export default ActionInput;
