import { z } from 'zod';
import { FacingMode } from '../types';

export const FacingModeSchema = z.enum([
  FacingMode.user,
  FacingMode.environment,
  FacingMode.unknown,
]);
