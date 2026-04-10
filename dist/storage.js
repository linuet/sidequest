"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readStore = readStore;
exports.writeStore = writeStore;
exports.addQuest = addQuest;
exports.updateQuest = updateQuest;
exports.removeQuest = removeQuest;
exports.clearCompleted = clearCompleted;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.resolve(process.cwd(), "data");
const DATA_FILE = path_1.default.join(DATA_DIR, "sidequests.json");
async function ensureStore() {
    await fs_1.promises.mkdir(DATA_DIR, { recursive: true });
    try {
        await fs_1.promises.access(DATA_FILE);
    }
    catch {
        const initial = { quests: [] };
        await fs_1.promises.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
    }
}
async function readStore() {
    await ensureStore();
    const raw = await fs_1.promises.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
}
async function writeStore(store) {
    await ensureStore();
    await fs_1.promises.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}
async function addQuest(quest) {
    const store = await readStore();
    store.quests.push(quest);
    await writeStore(store);
}
async function updateQuest(questId, updater) {
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
async function removeQuest(questId) {
    const store = await readStore();
    const next = store.quests.filter((quest) => quest.id !== questId);
    if (next.length === store.quests.length) {
        return false;
    }
    store.quests = next;
    await writeStore(store);
    return true;
}
async function clearCompleted() {
    const store = await readStore();
    const before = store.quests.length;
    store.quests = store.quests.filter((quest) => !quest.completedAt);
    await writeStore(store);
    return before - store.quests.length;
}
