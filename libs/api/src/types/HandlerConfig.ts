import type { VideoAction } from './VideoAction';
import type { IVideoClient } from './IVideoClient';

export type HandlerConfig<
  Action extends VideoAction,
  Payload = Parameters<IVideoClient[Action]>[0],
> = {
  /**
   * Define the public input for the web client service.
   */
  selectInput?: (input: Payload) => Partial<Payload>;

  defaults: Partial<Payload> | ((payload: Partial<Payload>) => Partial<Payload>);
};

export default HandlerConfig;
