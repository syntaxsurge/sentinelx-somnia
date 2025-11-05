/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actionIntents from "../actionIntents.js";
import type * as apiKeys from "../apiKeys.js";
import type * as docChunks from "../docChunks.js";
import type * as guardianOperators from "../guardianOperators.js";
import type * as incidents from "../incidents.js";
import type * as monitors from "../monitors.js";
import type * as telemetry from "../telemetry.js";
import type * as tenants from "../tenants.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  actionIntents: typeof actionIntents;
  apiKeys: typeof apiKeys;
  docChunks: typeof docChunks;
  guardianOperators: typeof guardianOperators;
  incidents: typeof incidents;
  monitors: typeof monitors;
  telemetry: typeof telemetry;
  tenants: typeof tenants;
  users: typeof users;
  webhooks: typeof webhooks;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
