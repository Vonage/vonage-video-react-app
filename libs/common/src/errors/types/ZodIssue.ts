type ZodIssue = {
  code: string;
  path: (string | number)[];
  message: string;
  expected?: string;
  received?: string;
};

export type { ZodIssue };
