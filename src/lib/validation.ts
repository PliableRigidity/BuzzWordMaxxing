import { larpifyRequestSchema } from "./schema";

export function validateLarpifyRequest(input: unknown) {
  return larpifyRequestSchema.safeParse(input);
}
