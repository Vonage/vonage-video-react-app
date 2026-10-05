export type HttpErrorLike = Error & {
  code: unknown;

  config: {
    data: unknown;
    headers: Record<string, unknown>;
    method: string;
    type: string;
    url: string;
  };

  response: {
    body: unknown;
    bodyUsed: boolean;
    headers: Record<string, unknown>;
    ok: boolean;
    redirected: boolean;
    size: number;
    status: number;
    statusText: string;
    timeout: number;
    url: string;
  };
};
