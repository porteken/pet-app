import { setupServer } from "msw/node";

import { handlers } from "./handlers";

export const server = setupServer(...handlers);

export const startMockServer = () => {
  server.listen({
    onUnhandledRequest: "error",
  });
};

export const resetMockServer = () => {
  server.resetHandlers();
};

export const stopMockServer = () => {
  server.close();
};
