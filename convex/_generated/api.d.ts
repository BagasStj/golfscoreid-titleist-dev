/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as addTestPlayers from "../addTestPlayers.js";
import type * as calculations from "../calculations.js";
import type * as cleanupOldFields from "../cleanupOldFields.js";
import type * as courses from "../courses.js";
import type * as emailActions from "../emailActions.js";
import type * as emailNotifications from "../emailNotifications.js";
import type * as flights from "../flights.js";
import type * as hiddenHoles from "../hiddenHoles.js";
import type * as leaderboard from "../leaderboard.js";
import type * as migrateClubSets from "../migrateClubSets.js";
import type * as migrateHolesConfig from "../migrateHolesConfig.js";
import type * as monitoring from "../monitoring.js";
import type * as news from "../news.js";
import type * as players from "../players.js";
import type * as runCleanup from "../runCleanup.js";
import type * as scores from "../scores.js";
import type * as seedHelper from "../seedHelper.js";
import type * as seedHolesConfig from "../seedHolesConfig.js";
import type * as seedUsers from "../seedUsers.js";
import type * as seedUsersWithPassword from "../seedUsersWithPassword.js";
import type * as testBackend from "../testBackend.js";
import type * as testLeaderboardMonitoring from "../testLeaderboardMonitoring.js";
import type * as testScoring from "../testScoring.js";
import type * as testScoringIntegration from "../testScoringIntegration.js";
import type * as testTask3Integration from "../testTask3Integration.js";
import type * as testTask3Live from "../testTask3Live.js";
import type * as testTask3Queries from "../testTask3Queries.js";
import type * as tournaments from "../tournaments.js";
import type * as tournamentsTest from "../tournamentsTest.js";
import type * as tournaments_backup from "../tournaments_backup.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addTestPlayers: typeof addTestPlayers;
  calculations: typeof calculations;
  cleanupOldFields: typeof cleanupOldFields;
  courses: typeof courses;
  emailActions: typeof emailActions;
  emailNotifications: typeof emailNotifications;
  flights: typeof flights;
  hiddenHoles: typeof hiddenHoles;
  leaderboard: typeof leaderboard;
  migrateClubSets: typeof migrateClubSets;
  migrateHolesConfig: typeof migrateHolesConfig;
  monitoring: typeof monitoring;
  news: typeof news;
  players: typeof players;
  runCleanup: typeof runCleanup;
  scores: typeof scores;
  seedHelper: typeof seedHelper;
  seedHolesConfig: typeof seedHolesConfig;
  seedUsers: typeof seedUsers;
  seedUsersWithPassword: typeof seedUsersWithPassword;
  testBackend: typeof testBackend;
  testLeaderboardMonitoring: typeof testLeaderboardMonitoring;
  testScoring: typeof testScoring;
  testScoringIntegration: typeof testScoringIntegration;
  testTask3Integration: typeof testTask3Integration;
  testTask3Live: typeof testTask3Live;
  testTask3Queries: typeof testTask3Queries;
  tournaments: typeof tournaments;
  tournamentsTest: typeof tournamentsTest;
  tournaments_backup: typeof tournaments_backup;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
