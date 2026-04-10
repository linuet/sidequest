import { promises as fs } from "fs";
import path from "path";
import { Quest, QuestStore } from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "sidequests.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    const initial: QuestStore = { quests: [] };
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
  }
}

export async function readStore(): Promise<QuestStore> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as QuestStore;
}

export async function writeStore(store: QuestStore): Promise<void> {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export async function addQuest(quest: Quest): Promise<void> {
  const store = await readStore();
  store.quests.push(quest);
  await writeStore(store);
}

export async function updateQuest(
  questId: string,
  updater: (quest: Quest) => Quest
): Promise<Quest | null> {
  const store = await readStore();
  const index = store.quests.findIndex((quest) => quest.id === questId);

  if (index === -1) {
    return null;
  }

  const updated = updater(store.quests[index]);
  store.quests[index] = updated;
  await writeStore(store);
  return updated;
}

export async function removeQuest(questId: string): Promise<boolean> {
  const store = await readStore();
  const next = store.quests.filter((quest) => quest.id !== questId);

  if (next.length === store.quests.length) {
    return false;
  }

  store.quests = next;
  await writeStore(store);
  return true;
}

export async function clearCompleted(): Promise<number> {
  const store = await readStore();
  const before = store.quests.length;
  store.quests = store.quests.filter((quest) => !quest.completedAt);
  await writeStore(store);
  return before - store.quests.length;
}
