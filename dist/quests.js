"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuest = createQuest;
exports.generateRandomQuest = generateRandomQuest;
exports.parseCategory = parseCategory;
exports.parseDifficulty = parseDifficulty;
const questIdeas = {
    focus: [
        "Work 25 minutes without checking your phone",
        "Plan your next 3 tasks",
        "Clean up your desktop for 10 minutes",
        "Finish one annoying task you've been delaying"
    ],
    health: [
        "Take a 15-minute walk",
        "Drink 2 glasses of water right now",
        "Stretch for 5 minutes",
        "Do 20 bodyweight squats"
    ],
    social: [
        "Send a kind message to a friend",
        "Reply to one unanswered message",
        "Thank someone for something specific",
        "Invite someone for coffee this week"
    ],
    learning: [
        "Read 10 pages of a book",
        "Watch one useful tutorial",
        "Take notes on one thing you learned today",
        "Practice a skill for 20 minutes"
    ],
    creativity: [
        "Write a short paragraph about your day",
        "Sketch something in under 10 minutes",
        "Brainstorm 10 ideas",
        "Make a tiny playlist for your current mood"
    ],
    order: [
        "Organize one drawer or folder",
        "Delete 20 useless files or photos",
        "Wash dishes immediately",
        "Prepare tomorrow's outfit or workspace"
    ]
};
const categories = Object.keys(questIdeas);
function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}
function randomDifficulty() {
    const value = Math.floor(Math.random() * 3) + 1;
    return value;
}
function createQuest(params) {
    return {
        id: `q_${Math.random().toString(36).slice(2, 10)}`,
        title: params.title,
        category: params.category,
        difficulty: params.difficulty,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
}
function generateRandomQuest() {
    const category = randomItem(categories);
    const title = randomItem(questIdeas[category]);
    return createQuest({
        title,
        category,
        difficulty: randomDifficulty()
    });
}
function parseCategory(input) {
    const normalized = (input ?? "focus").trim().toLowerCase();
    if (categories.includes(normalized)) {
        return normalized;
    }
    throw new Error(`Unknown category: ${input}. Available: ${categories.join(", ")}`);
}
function parseDifficulty(input) {
    const value = Number(input ?? 1);
    if (value === 1 || value === 2 || value === 3) {
        return value;
    }
    throw new Error("Difficulty must be 1, 2, or 3.");
}
