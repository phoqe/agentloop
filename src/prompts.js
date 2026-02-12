import { readdirSync } from "fs";

const STARTERS = [
  "hey can you",
  "could you",
  "can you",
  "yo",
  "ok now",
  "alright,",
  "next up:",
  "one more thing —",
  "also,",
  "hmm actually",
  "i think we need to",
  "let's",
  "go ahead and",
  "would you mind",
  "real quick,",
  "oh wait,",
  "before i forget,",
  "",
  "",
  "",
];

const ADDITIVE = [
  "build out a full {concept} module in a {name}/ folder. want the main implementation, tests, types, readme — the works. go big on this one",
  "add a bunch of CRUD routes for /{path}. like list, get, create, update, delete. make a {name}Service and {name}Repository too with an in-memory store. should be multiple files",
  "create a {concept} library from scratch in {name}/. include a factory, config schema, error classes, and a demo file that actually uses everything. don't hold back on the implementation",
  "write a full test suite for every module in the project. i want happy path, edge cases, error cases, the lot. like 15+ test functions per file minimum",
  "build a CLI tool in cli/ that hooks into every module. argument parsing, help text, colors, at least 8 subcommands. make it feel real",
  "add a complete {domain} utility library. i want like 20+ functions, each properly implemented, not just stubs. put them in {name}.js",
  "create a {concept} and integrate it with the existing codebase. wire it up to the routes and make sure everything actually connects",
  "we need a proper data model layer. create models/ with at least 5 entity classes, validation, serialization, relationships between them. go deep",
];

const REFACTORING = [
  "rewrite everything to use ES6 classes. i want private fields, getters, setters, factory methods, toString, toJSON, clone — the full deal. add a base class too",
  "convert the whole codebase to functional style. pure functions, Object.freeze everywhere, pipe/compose, Result/Option monads, currying. make a fp-utils.js with like 20 helpers",
  "make everything use the builder pattern with method chaining. every public API should be fluent. rewrite all existing code to use the new builders",
  "refactor into a proper layered architecture — controllers/, services/, repositories/, models/, middleware/. move everything, rewrite imports, add error types per layer",
  "rewrite all modules to use observables and event emitters. every state change should fire events. add operators like map, filter, debounce. build an event bus that connects everything",
  "this code is getting messy. split every file that's over 50 lines into smaller modules. create proper directory structure for each domain",
  "convert everything to use async/await properly. add proper error handling, timeouts, retries with backoff on every async operation",
];

const EXPANSION = [
  "add logging everywhere. i mean everywhere — every function entry/exit, args, return values, errors. build a proper Logger with transports and log levels and correlation IDs",
  "build like 10 middleware functions — auth, rate limiting, validation, compression, cors, request IDs, error handling, timing headers, body parsing, the works. wire them into every route",
  "the error handling is weak. create 15+ custom error classes, add try/catch everywhere, add circuit breakers, retry logic with backoff and jitter, dead letter queues, global error reporter",
  "implement a full caching layer — LRU cache, TTL, write-through, cache warming, stats tracking, cache middleware for routes. add a /cache-admin endpoint for management",
  "build a metrics system from scratch. counters, gauges, histograms, timers. instrument every function. add a /metrics endpoint and a health check that tests all components",
  "add input validation to literally every function that takes arguments. use a schema-based approach, create a validator factory, add helpful error messages",
  "add websocket support. create a ws module with connection management, rooms, broadcasts, heartbeats, reconnection logic, message queuing for offline clients",
];

const STRUCTURAL = [
  "restructure the whole thing into a monorepo with packages/ — like core, http, utils, config, cli. each gets its own index.js and internal structure. rewrite all the imports",
  "make this plugin-based. create a plugin loader, registry, lifecycle hooks, plugin config, inter-plugin events. build 5 built-in plugins in their own directories",
  "convert to domain-driven design. bounded contexts, aggregate roots, value objects, domain events, repos. set up 3 contexts — users, orders, inventory — with full implementations",
  "reorganize into a microservices layout — api-gateway, user-service, product-service, notification-service. each with routes, controllers, services, models. add a message bus between them",
  "build a module federation system. dynamic loader, dependency resolver with topological sort, lifecycle management, hot reload simulation, module isolation. refactor everything into loadable modules",
  "move to a feature-based folder structure. each feature gets its own directory with routes, handlers, services, tests, types. should have at least 6 features",
];

const FOLLOWUPS = [
  "actually that last change was good but can you expand on it more? add more edge cases and make the implementations more thorough",
  "nice, now add comprehensive tests for everything you just wrote. cover all the branches",
  "ok that's a start but i want this way more fleshed out. add error handling, validation, logging to everything you just added",
  "good, now create a demo/example file that exercises all the new code you added. show every feature being used",
  "looks decent. now add JSDoc to every public function and create a types.js with all the type definitions",
  "alright now wire up everything you just built with the rest of the project. update all the existing files to use the new stuff",
];

const ALL_TEMPLATES = [
  ...ADDITIVE.map((t) => ({ template: t, category: "additive" })),
  ...REFACTORING.map((t) => ({ template: t, category: "refactoring" })),
  ...EXPANSION.map((t) => ({ template: t, category: "expansion" })),
  ...STRUCTURAL.map((t) => ({ template: t, category: "structural" })),
];

const CONCEPTS = [
  "linked list",
  "pub/sub event bus",
  "state machine",
  "priority queue",
  "LRU cache",
  "observable store",
  "middleware pipeline",
  "command dispatcher",
  "circuit breaker",
  "dependency injection container",
  "job scheduler",
  "streaming data pipeline",
  "graph data structure",
  "binary search tree",
  "bloom filter",
];

const DOMAINS = [
  "string manipulation",
  "array transformations",
  "date/time formatting",
  "deep object operations",
  "math and statistics",
  "encoding and hashing",
  "url parsing and building",
  "color conversion",
  "file path utilities",
];

const NAMES = [
  "scheduler",
  "transformer",
  "pipeline",
  "registry",
  "dispatcher",
  "analyzer",
  "serializer",
  "aggregator",
  "emitter",
  "resolver",
  "orchestrator",
  "processor",
  "gateway",
  "broker",
  "handler",
];

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const PATHS = [
  "users",
  "items",
  "stats",
  "logs",
  "tasks",
  "events",
  "metrics",
  "settings",
  "status",
  "debug",
  "webhooks",
  "notifications",
  "workflows",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function listWorkspaceFiles(workspaceDir) {
  try {
    return readdirSync(workspaceDir)
      .filter((f) => f.endsWith(".js"))
      .map((f) => f);
  } catch {
    return ["index.js", "routes.js", "utils.js", "config.js"];
  }
}

function fillTemplate(template, workspaceDir) {
  const files = listWorkspaceFiles(workspaceDir);
  return template
    .replace("{file}", pick(files))
    .replace("{name}", pick(NAMES))
    .replace("{concept}", pick(CONCEPTS))
    .replace("{domain}", pick(DOMAINS))
    .replace("{method}", pick(METHODS))
    .replace("{path}", pick(PATHS));
}

function addTypos(text) {
  if (Math.random() > 0.3) return text;
  const words = text.split(" ");
  const idx = Math.floor(Math.random() * words.length);
  const word = words[idx];
  if (word.length < 4) return text;
  const charIdx = Math.floor(Math.random() * (word.length - 1)) + 1;
  words[idx] = word.slice(0, charIdx) + word[charIdx + 1] + word[charIdx] + word.slice(charIdx + 2);
  return words.join(" ");
}

let lastCategory = null;
let cycleCount = 0;

export function nextPrompt(workspaceDir) {
  cycleCount++;

  if (cycleCount > 1 && Math.random() < 0.25) {
    const prompt = pick(FOLLOWUPS);
    return { prompt, category: "followup" };
  }

  let candidates = ALL_TEMPLATES;
  if (lastCategory) {
    const other = candidates.filter((c) => c.category !== lastCategory);
    if (other.length > 0) candidates = other;
  }

  const chosen = pick(candidates);
  lastCategory = chosen.category;

  const starter = pick(STARTERS);
  const body = fillTemplate(chosen.template, workspaceDir);
  const raw = starter ? `${starter} ${body}` : body;
  const prompt = addTypos(raw);

  return { prompt, category: chosen.category };
}

export function humanDelay() {
  const r = Math.random();
  if (r < 0.4) return Math.floor(Math.random() * 3000) + 500;
  if (r < 0.7) return Math.floor(Math.random() * 8000) + 3000;
  if (r < 0.9) return Math.floor(Math.random() * 20000) + 8000;
  return Math.floor(Math.random() * 45000) + 20000;
}
