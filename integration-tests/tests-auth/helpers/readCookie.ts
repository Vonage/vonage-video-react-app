import type { BrowserContext, Cookie } from '@playwright/test';

async function readCookie({
  context,
  name,
}: {
  context: BrowserContext;
  name: string;
}): Promise<Cookie | undefined> {
  const cookies = await context.cookies();

  return cookies.find((cookie) => cookie.name === name);
}

export default readCookie;
