import { z } from 'zod';

import { idPathParamField } from './common-fields';

export const userIdPathParamSchema = z.object({
  params: z.object({ id: idPathParamField }),
});

