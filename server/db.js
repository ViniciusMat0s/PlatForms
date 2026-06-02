import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { seedQuestionnaires } from '../src/data/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'forms.sqlite');
const LEGACY_DB_PATH = path.join(DATA_DIR, 'db.json');

let database = null;
let initializationPromise = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const canonicalQuestionnaires = [...seedQuestionnaires];
const canonicalQuestionnaireIds = new Set(canonicalQuestionnaires.map((questionnaire) => questionnaire.id));

function normalizeRole(role) {
  if (role === 'admin') return role;
  return null;
}

function createSeedDb() {
  const now = new Date().toISOString();

  return {
    questionnaires: clone(canonicalQuestionnaires).map((questionnaire) => ({
      ...questionnaire,
      metadata: {
        ...questionnaire.metadata,
        createdAt: questionnaire.metadata?.createdAt ?? now,
        updatedAt: questionnaire.metadata?.updatedAt ?? now,
      },
    })),
    responses: [],
    users: [
      {
        id: 'user-admin',
        name: 'Ronice',
        email: 'ronice',
        password: 'roniceadmin',
        role: 'admin',
      },
    ],
    sessions: [],
  };
}

function normalizeQuestionnaires(existingQuestionnaires = []) {
  const existingById = new Map(existingQuestionnaires.map((item) => [item.id, item]));

  return canonicalQuestionnaires.map((questionnaire) => {
    const existing = existingById.get(questionnaire.id);

    if (!existing) {
      return questionnaire;
    }

    return {
      ...questionnaire,
      metadata: {
        ...questionnaire.metadata,
        ...(existing.metadata ?? {}),
        createdAt: existing.metadata?.createdAt ?? questionnaire.metadata?.createdAt,
        updatedAt: existing.metadata?.updatedAt ?? questionnaire.metadata?.updatedAt,
      },
    };
  });
}

function mergeUsers(existingUsers, defaultUsers) {
  const map = new Map(defaultUsers.map((user) => [user.id, { ...user }]));

  for (const user of existingUsers) {
    const normalizedRole = normalizeRole(user.role);
    if (!normalizedRole) continue;

    if (user.id === 'user-admin') {
      map.set(user.id, {
        ...map.get(user.id),
        ...user,
        id: 'user-admin',
        name: 'Ronice',
        email: 'ronice',
        password: 'roniceadmin',
        role: 'admin',
      });
      continue;
    }

    map.set(user.id, {
      ...user,
      role: normalizedRole,
    });
  }

  return Array.from(map.values());
}

function normalizeDatabase(db) {
  const seed = createSeedDb();
  const questionnaires = normalizeQuestionnaires(db.questionnaires ?? seed.questionnaires);
  const users = mergeUsers(db.users ?? [], seed.users);
  const responses = Array.isArray(db.responses)
    ? db.responses.filter((response) => canonicalQuestionnaireIds.has(response.questionnaireId))
    : [];
  const userIds = new Set(users.map((user) => user.id));
  const sessions = Array.isArray(db.sessions) ? db.sessions.filter((session) => userIds.has(session.userId)) : [];

  return {
    questionnaires,
    responses,
    users,
    sessions,
  };
}

function initializeSchema(db) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS questionnaires (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

function openDatabase() {
  if (!database) {
    database = new DatabaseSync(DB_PATH);
    initializeSchema(database);
  }

  return database;
}

function parseRowPayload(row) {
  return JSON.parse(row.payload);
}

function loadCurrentDatabase(db) {
  const questionnaires = db.prepare('SELECT payload FROM questionnaires ORDER BY rowid ASC').all().map(parseRowPayload);
  const responses = db.prepare('SELECT payload FROM responses ORDER BY rowid ASC').all().map(parseRowPayload);
  const users = db.prepare('SELECT id, name, email, password, role FROM users ORDER BY rowid ASC').all();
  const sessions = db.prepare('SELECT id, userId, createdAt FROM sessions ORDER BY rowid ASC').all();

  return {
    questionnaires,
    responses,
    users,
    sessions,
  };
}

function replaceDatabase(db, nextDatabase) {
  const normalized = normalizeDatabase(nextDatabase);
  const insertQuestionnaire = db.prepare('INSERT INTO questionnaires (id, payload) VALUES (?, ?)');
  const insertResponse = db.prepare('INSERT INTO responses (id, payload) VALUES (?, ?)');
  const insertUser = db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)');
  const insertSession = db.prepare('INSERT INTO sessions (id, userId, createdAt) VALUES (?, ?, ?)');

  db.exec('BEGIN IMMEDIATE TRANSACTION');

  try {
    db.exec(`
      DELETE FROM responses;
      DELETE FROM sessions;
      DELETE FROM users;
      DELETE FROM questionnaires;
    `);

    for (const questionnaire of normalized.questionnaires) {
      insertQuestionnaire.run(questionnaire.id, JSON.stringify(questionnaire));
    }

    for (const response of normalized.responses) {
      const payload = {
        ...response,
        answers: response.answers ?? {},
      };
      insertResponse.run(response.id, JSON.stringify(payload));
    }

    for (const user of normalized.users) {
      insertUser.run(user.id, user.name, user.email, user.password, user.role);
    }

    for (const session of normalized.sessions) {
      insertSession.run(session.id, session.userId, session.createdAt);
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

async function loadLegacyDatabase() {
  try {
    const raw = await fs.readFile(LEGACY_DB_PATH, 'utf8');
    return normalizeDatabase(JSON.parse(raw));
  } catch {
    return createSeedDb();
  }
}

async function ensureInitialized() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await fs.mkdir(DATA_DIR, { recursive: true });

      const db = openDatabase();
      const questionnairesCount = db.prepare('SELECT COUNT(*) AS count FROM questionnaires').get().count;

      if (questionnairesCount === 0) {
        const legacyDatabase = await loadLegacyDatabase();
        replaceDatabase(db, legacyDatabase);
      }
    })();
  }

  await initializationPromise;
}

export async function ensureDatabase() {
  await ensureInitialized();
}

export async function readDatabase() {
  await ensureInitialized();
  const db = openDatabase();
  return loadCurrentDatabase(db);
}

export async function writeDatabase(nextDatabase) {
  await ensureInitialized();
  const db = openDatabase();
  replaceDatabase(db, nextDatabase);
}
