import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const FILES = {
  "index.js": `const http = require("http");
const { router } = require("./routes");
const { loadConfig } = require("./config");

const config = loadConfig();

const server = http.createServer((req, res) => {
  const handler = router(req);
  if (handler) {
    handler(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(config.port, () => {
  console.log("Server running on port " + config.port);
});
`,

  "routes.js": `const { formatResponse, parseBody } = require("./utils");

const routes = {};

function get(path, handler) {
  routes["GET:" + path] = handler;
}

function post(path, handler) {
  routes["POST:" + path] = handler;
}

get("/", (req, res) => {
  formatResponse(res, 200, { message: "Welcome to the API" });
});

get("/health", (req, res) => {
  formatResponse(res, 200, { status: "ok", uptime: process.uptime() });
});

post("/echo", async (req, res) => {
  const body = await parseBody(req);
  formatResponse(res, 200, { echo: body });
});

get("/time", (req, res) => {
  formatResponse(res, 200, { time: new Date().toISOString() });
});

function router(req) {
  const url = new URL(req.url, "http://localhost");
  const key = req.method + ":" + url.pathname;
  return routes[key] || null;
}

module.exports = { router, get, post };
`,

  "utils.js": `function formatResponse(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(body);
      }
    });
    req.on("error", reject);
  });
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = { formatResponse, parseBody, generateId, clamp, deepClone };
`,

  "config.js": `const defaults = {
  port: 3000,
  env: "development",
  logLevel: "info",
  maxConnections: 100,
  timeout: 30000,
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  rateLimit: {
    windowMs: 60000,
    max: 100,
  },
};

function loadConfig() {
  const env = process.env.NODE_ENV || defaults.env;
  return {
    ...defaults,
    env,
    port: parseInt(process.env.PORT, 10) || defaults.port,
    logLevel: process.env.LOG_LEVEL || defaults.logLevel,
  };
}

function validateConfig(config) {
  if (typeof config.port !== "number" || config.port < 1 || config.port > 65535) {
    throw new Error("Invalid port: " + config.port);
  }
  if (!["development", "staging", "production"].includes(config.env)) {
    throw new Error("Invalid env: " + config.env);
  }
  return true;
}

module.exports = { loadConfig, validateConfig, defaults };
`,

  "middleware.js": `function logger(req, res, next) {
  const start = Date.now();
  const original = res.end.bind(res);
  res.end = function (...args) {
    const duration = Date.now() - start;
    console.log(req.method + " " + req.url + " " + res.statusCode + " " + duration + "ms");
    original(...args);
  };
  if (next) next();
}

function cors(options) {
  return function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", options.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", (options.methods || ["GET"]).join(", "));
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (next) next();
  };
}

function rateLimit(options) {
  const hits = new Map();
  return function (req, res, next) {
    const ip = req.socket.remoteAddress;
    const now = Date.now();
    const record = hits.get(ip) || { count: 0, start: now };
    if (now - record.start > options.windowMs) {
      record.count = 0;
      record.start = now;
    }
    record.count++;
    hits.set(ip, record);
    if (record.count > options.max) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Too many requests" }));
      return;
    }
    if (next) next();
  };
}

module.exports = { logger, cors, rateLimit };
`,
};

export function seed(workspaceDir) {
  if (!existsSync(workspaceDir)) {
    mkdirSync(workspaceDir, { recursive: true });
  }

  for (const [filename, content] of Object.entries(FILES)) {
    const filepath = join(workspaceDir, filename);
    if (!existsSync(filepath)) {
      writeFileSync(filepath, content);
    }
  }
}
