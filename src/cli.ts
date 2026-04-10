import { addQuest, clearCompleted, readStore, removeQuest, updateQuest } from "./storage";
import {
  createQuest,
  generateRandomQuest,
  parseCategory,
  parseDifficulty
} from "./quests";
import { Quest } from "./types";

function difficultyBar(value: 1 | 2 | 3): string {
  return "★".repeat(value) + "☆".repeat(3 - value);
}

function formatQuest(quest: Quest): string {
  const status = quest.completedAt ? "✅ done" : "🕒 open";
  return `${quest.id} | ${status} | [${quest.category}] | ${difficultyBar(
    quest.difficulty
  )} | ${quest.title}`;
}

function printHelp(): void {
  console.log(`
Sidequest CLI

Commands:
  help
  seed [count]
  add <title> [category] [difficulty]
  list
  done <id>
  remove <id>
  stats
  clear-completed
`);
}

async function commandSeed(countInput?: string): Promise<void> {
  const count = Math.max(1, Math.min(20, Number(countInput ?? 3) || 3));

  for (let index = 0; index < count; index += 1) {
    await addQuest(generateRandomQuest());
  }

  console.log(`Generated ${count} quest(s).`);
}

async function commandAdd(args: string[]): Promise<void> {
  if (args.length === 0) {
    throw new Error("Provide a title for the quest.");
  }

  const title = args[0];
  const category = parseCategory(args[1]);
  const difficulty = parseDifficulty(args[2]);

  const quest = createQuest({ title, category, difficulty });
  await addQuest(quest);
  console.log(`Added quest: ${formatQuest(quest)}`);
}

async function commandList(): Promise<void> {
  const store = await readStore();

  if (store.quests.length === 0) {
    console.log("No quests yet. Try: seed 3");
    return;
  }

  console.log("\nYour side quests:\n");
  for (const quest of store.quests) {
    console.log(formatQuest(quest));
  }
}

async function commandDone(id?: string): Promise<void> {
  if (!id) {
    throw new Error("Provide a quest id.");
  }

  const updated = await updateQuest(id, (quest) => ({
    ...quest,
    completedAt: quest.completedAt ?? new Date().toISOString()
  }));

  if (!updated) {
    console.log(`Quest not found: ${id}`);
    return;
  }

  console.log(`Completed: ${formatQuest(updated)}`);
}

async function commandRemove(id?: string): Promise<void> {
  if (!id) {
    throw new Error("Provide a quest id.");
  }

  const removed = await removeQuest(id);
  console.log(removed ? `Removed ${id}` : `Quest not found: ${id}`);
}

async function commandStats(): Promise<void> {
  const store = await readStore();
  const total = store.quests.length;
  const completed = store.quests.filter((quest) => Boolean(quest.completedAt)).length;
  const open = total - completed;

  const byCategory = store.quests.reduce<Record<string, number>>((acc, quest) => {
    acc[quest.category] = (acc[quest.category] ?? 0) + 1;
    return acc;
  }, {});

  console.log("\nStats");
  console.log(`Total: ${total}`);
  console.log(`Open: ${open}`);
  console.log(`Completed: ${completed}`);

  if (total > 0) {
    const completionRate = Math.round((completed / total) * 100);
    console.log(`Completion rate: ${completionRate}%`);
  }

  if (Object.keys(byCategory).length > 0) {
    console.log("By category:");
    for (const [category, value] of Object.entries(byCategory)) {
      console.log(`  - ${category}: ${value}`);
    }
  }
}

async function commandClearCompleted(): Promise<void> {
  const removedCount = await clearCompleted();
  console.log(`Cleared ${removedCount} completed quest(s).`);
}

export async function runCli(argv: string[]): Promise<void> {
  const [command = "help", ...rest] = argv;

  switch (command) {
    case "help":
      printHelp();
      break;
    case "seed":
      await commandSeed(rest[0]);
      break;
    case "add":
      await commandAdd(rest);
      break;
    case "list":
      await commandList();
      break;
    case "done":
      await commandDone(rest[0]);
      break;
    case "remove":
      await commandRemove(rest[0]);
      break;
    case "stats":
      await commandStats();
      break;
    case "clear-completed":
      await commandClearCompleted();
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}
