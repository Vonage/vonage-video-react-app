import type { CreateSessionPayload } from '../schemas/CreateSessionPayload.schema';

export type CreateSessionDefaults = Partial<CreateSessionPayload> & {
  isPastStartAllowed?: boolean;
};

export default CreateSessionDefaults;
