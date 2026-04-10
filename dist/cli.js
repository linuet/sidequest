"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCli = runCli;
const storage_1 = require("./storage");
const quests_1 = require("./quests");
function difficultyBar(value) {
    return "★".repeat(value) + "☆".repeat(3 - value);
}
function formatQuest(quest) {
    const status = quest.completedAt ? "✅ done" : "🕒 open";
    return `${quest.id} | ${status} | [${quest.category}] | ${difficultyBar(quest.difficulty)} | ${quest.title}`;
}
function printHelp() {
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
async function commandSeed(countInput) {
    const count = Math.max(1, Math.min(20, Number(countInput ?? 3) || 3));
    for (let index = 0; index < count; index += 1) {
        await (0, storage_1.addQuest)((0, quests_1.generateRandomQuest)());
    }
    console.log(`Generated ${count} quest(s).`);
}
async function commandAdd(args) {
    if (args.length === 0) {
        throw new Error("Provide a title for the quest.");
    }
    const title = args[0];
    const category = (0, quests_1.parseCategory)(args[1]);
    const difficulty = (0, quests_1.parseDifficulty)(args[2]);
    const quest = (0, quests_1.createQuest)({ title, category, difficulty });
    await (0, storage_1.addQuest)(quest);
    console.log(`Added quest: ${formatQuest(quest)}`);
}
async function commandList() {
    const store = await (0, storage_1.readStore)();
    if (store.quests.length === 0) {
        console.log("No quests yet. Try: seed 3");
        return;
    }
    console.log("\nYour side quests:\n");
    for (const quest of store.quests) {
        console.log(formatQuest(quest));
    }
}
async function commandDone(id) {
    if (!id) {
        throw new Error("Provide a quest id.");
    }
    const updated = await (0, storage_1.updateQuest)(id, (quest) => ({
        ...quest,
        completedAt: quest.completedAt ?? new Date().toISOString()
    }));
    if (!updated) {
        console.log(`Quest not found: ${id}`);
        return;
    }
    console.log(`Completed: ${formatQuest(updated)}`);
}
async function commandRemove(id) {
    if (!id) {
        throw new Error("Provide a quest id.");
    }
    const removed = await (0, storage_1.removeQuest)(id);
    console.log(removed ? `Removed ${id}` : `Quest not found: ${id}`);
}
async function commandStats() {
    const store = await (0, storage_1.readStore)();
    const total = store.quests.length;
    const completed = store.quests.filter((quest) => Boolean(quest.completedAt)).length;
    const open = total - completed;
    const byCategory = store.quests.reduce((acc, quest) => {
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
async function commandClearCompleted() {
    const removedCount = await (0, storage_1.clearCompleted)();
    console.log(`Cleared ${removedCount} completed quest(s).`);
}
async function runCli(argv) {
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
