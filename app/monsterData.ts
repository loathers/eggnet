import { createClient, Monster } from "data-of-loathing";

import { priorities } from "~/priorities.js";

export interface MonsterData {
  id: number;
  name: string;
  image: string[];
  wiki: string | null;
  nocopy: boolean;
  eggs: number;
  priority: number;
}

// eggs is per-request database state, merged in by the loader
type CachedMonsterData = Omit<MonsterData, "eggs">;

const client = createClient();
const TTL = 1000 * 60 * 60;

let cache: { data: CachedMonsterData[]; fetchedAt: number } | null = null;
let inflight: Promise<CachedMonsterData[]> | null = null;

function refresh(): Promise<CachedMonsterData[]> {
  return (inflight ??= (async () => {
    try {
      await client.load();
      const monsters = await client.query.findAll(Monster);
      const data = monsters.map((m) => ({
        id: m.id,
        name: m.name,
        image: m.image,
        wiki: m.wiki ?? null,
        nocopy: m.nocopy,
        priority: priorities[m.id] ?? 0,
      }));
      // Release the hydrated entities from the ORM's identity map
      client.query.clear();
      cache = { data, fetchedAt: Date.now() };
      return data;
    } catch (error) {
      // Serve stale data if a refresh fails
      if (cache) {
        console.warn("Failed to refresh monster data, serving stale:", error);
        return cache.data;
      }
      throw error;
    } finally {
      inflight = null;
    }
  })());
}

export async function getMonsterData(): Promise<CachedMonsterData[]> {
  if (cache) {
    // Serve stale data immediately and revalidate in the background
    if (Date.now() - cache.fetchedAt >= TTL) refresh();
    return cache.data;
  }

  return refresh();
}
