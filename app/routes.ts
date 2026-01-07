import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/status", "routes/status.ts"),
  route("/monsters", "routes/monsters.ts"),
  route("/monster-history/:id", "routes/monster-history.ts"),
] satisfies RouteConfig;
