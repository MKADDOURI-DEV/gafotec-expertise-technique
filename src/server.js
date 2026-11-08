// The Worker's entry: TanStack Start's default one.
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

export default { fetch: createStartHandler(defaultStreamHandler) };
