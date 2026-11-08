import { createStart } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth-middleware";

// authMiddleware sends the visitor's Supabase access token with every server-function call.
export const startInstance = createStart(() => ({
  functionMiddleware: [authMiddleware],
}));
