import type { VideoAction } from './VideoAction';
import type { IVideoOrchestrator } from './IVideoOrchestrator';

export type HandlerConfig<
  Action extends VideoAction,
  Payload = Parameters<IVideoOrchestrator[Action]>[0],
> = {
  /**
   * Define the public input for the web client service.
   */
  selectInput?: (input: Payload) => Partial<Payload>;

  defaults: Partial<Payload> | ((payload: Partial<Payload>) => Partial<Payload>);
};

export default HandlerConfig;
