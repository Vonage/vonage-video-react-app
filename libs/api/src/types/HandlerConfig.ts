import type { VideoAction } from './VideoAction';
import type { IVideoClient } from './IVideoClient';

export type HandlerConfig<
  Action extends VideoAction,
  Input = Parameters<IVideoClient[Action]>[0],
  Defaults = Partial<Omit<Input, 'sessionKey'>>,
> = {
  /**
   * Optional function to transform the input before it's passed to the the videoClient instance.
   */
  transformInput?: (args: { input: unknown; assertInput(input: unknown): Input }) => Partial<Input>;

  /**
   * Optional default values for the specific video action
   */
  addDefaults?: Defaults | ((input: Input) => Defaults);
};

export default HandlerConfig;
