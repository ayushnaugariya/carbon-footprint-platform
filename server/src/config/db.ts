import fs from 'fs';
import path from 'path';
import { config } from './env';
import type { UserRecord } from '../models/userModel';
import type { FootprintEntryRecord } from '../models/footprintModel';
import type { CompletedActionRecord } from '../models/actionModel';

/**
 * Lightweight, dependency-free persistence layer.
 *
 * Why not a real database driver? Native SQLite bindings (e.g. better-sqlite3)
 * require a compiled binary per platform/Node version, which is a common
 * source of "works on my machine" failures in unfamiliar environments
 * (CI runners, judges' machines, restricted networks). For this project's
 * scale - a handful of small, mostly-append-only collections per user - an
 * in-memory store with atomic JSON-file persistence gives the same
 * durability guarantees we need without that fragility, and keeps every
 * data-access path easy to read, test, and reason about.
 *
 * All collections are kept in memory as Maps (O(1) lookup by id) and
 * mirrored to a single JSON file on disk after every write, so data
 * survives process restarts. In the test environment, persistence to disk
 * is skipped entirely and the store lives only in memory for the duration
 * of the test process.
 */

interface StoreShape {
  users: UserRecord[];
  footprintEntries: FootprintEntryRecord[];
  completedActions: CompletedActionRecord[];
}

class JsonStore {
  private users = new Map<string, UserRecord>();
  private usersByEmail = new Map<string, string>(); // email -> id
  private footprintEntries: FootprintEntryRecord[] = [];
  private completedActions: CompletedActionRecord[] = [];
  private readonly filePath: string;
  private readonly persistToDisk: boolean;

  constructor(filePath: string, persistToDisk: boolean) {
    this.filePath = filePath;
    this.persistToDisk = persistToDisk;
    this.load();
  }

  private load(): void {
    if (!this.persistToDisk || !fs.existsSync(this.filePath)) return;

    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as StoreShape;
      for (const user of parsed.users ?? []) {
        this.users.set(user.id, user);
        if (user.email) this.usersByEmail.set(user.email, user.id);
      }
      this.footprintEntries = parsed.footprintEntries ?? [];
      this.completedActions = parsed.completedActions ?? [];
    } catch (err) {
      // A corrupted or unreadable data file should not crash startup -
      // start fresh instead, but make the issue visible in logs.
      // eslint-disable-next-line no-console
      console.error(`Warning: failed to load existing data file at ${this.filePath}, starting with an empty store.`, err);
    }
  }

  private persist(): void {
    if (!this.persistToDisk) return;

    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const snapshot: StoreShape = {
      users: [...this.users.values()],
      footprintEntries: this.footprintEntries,
      completedActions: this.completedActions
    };

    // Write to a temp file then rename, so a crash mid-write can never
    // leave behind a half-written, corrupted data file.
    const tmpPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(snapshot), 'utf-8');
    fs.renameSync(tmpPath, this.filePath);
  }

  // --- Users ---
  insertUser(user: UserRecord): void {
    this.users.set(user.id, user);
    if (user.email) this.usersByEmail.set(user.email, user.id);
    this.persist();
  }

  getUserById(id: string): UserRecord | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): UserRecord | undefined {
    const id = this.usersByEmail.get(email);
    return id ? this.users.get(id) : undefined;
  }

  // --- Footprint entries ---
  insertFootprintEntry(entry: FootprintEntryRecord): void {
    this.footprintEntries.push(entry);
    this.persist();
  }

  getFootprintEntriesForUser(userId: string, limit: number): FootprintEntryRecord[] {
    return this.footprintEntries
      .filter((e) => e.user_id === userId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .slice(0, limit);
  }

  getLatestFootprintEntryForUser(userId: string): FootprintEntryRecord | undefined {
    const entries = this.footprintEntries.filter((e) => e.user_id === userId);
    if (entries.length === 0) return undefined;
    return entries.reduce((latest, e) => (e.created_at > latest.created_at ? e : latest));
  }

  // --- Completed actions ---
  insertCompletedAction(action: CompletedActionRecord): void {
    this.completedActions.push(action);
    this.persist();
  }

  getCompletedActionsForUser(userId: string): CompletedActionRecord[] {
    return this.completedActions
      .filter((a) => a.user_id === userId)
      .sort((a, b) => b.completed_at.localeCompare(a.completed_at));
  }

  getTotalSavingsForUser(userId: string): number {
    return this.completedActions
      .filter((a) => a.user_id === userId)
      .reduce((sum, a) => sum + a.estimated_savings_kg, 0);
  }

  /** Wipes all in-memory data. Used for test isolation. */
  reset(): void {
    this.users.clear();
    this.usersByEmail.clear();
    this.footprintEntries = [];
    this.completedActions = [];
  }
}

let storeInstance: JsonStore | null = null;

export function getStore(): JsonStore {
  if (storeInstance) return storeInstance;
  const persistToDisk = config.nodeEnv !== 'test';
  storeInstance = new JsonStore(config.dbPath, persistToDisk);
  return storeInstance;
}

/** Resets the store. Used in test teardown so each test file starts clean. */
export function closeDb(): void {
  if (storeInstance) {
    storeInstance.reset();
  }
  storeInstance = null;
}
