import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createQuestionnaireId } from '../src/lib/scoring.js';
import { seedQuestionnaires } from '../src/data/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createSeedDb() {
  const now = new Date().toISOString();

  return {
    questionnaires: clone(seedQuestionnaires).map((questionnaire) => ({
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
        name: 'Administrador',
        email: 'admin@local',
        password: 'admin123',
        role: 'admin',
      },
    ],
    sessions: [],
  };
}

export async function ensureDatabase() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(createSeedDb(), null, 2), 'utf8');
  }
}

export async function readDatabase() {
  await ensureDatabase();
  const raw = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

export async function writeDatabase(db) {
  await ensureDatabase();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

export function createQuestionnaireFromInput(input) {
  const now = new Date().toISOString();
  const title = input.title ?? 'Novo questionário';

  return {
    id: input.id ?? createQuestionnaireId(title),
    code: input.code ?? input.id ?? createQuestionnaireId(title),
    title,
    subtitle: input.subtitle ?? '',
    audience: input.audience ?? 'Geral',
    domain: input.domain ?? 'Geral',
    source: input.source ?? 'API',
    version: input.version ?? 1,
    status: input.status ?? 'draft',
    tags: Array.isArray(input.tags) ? input.tags : [],
    scale: input.scale,
    bands: Array.isArray(input.bands) ? input.bands : [],
    scoring: input.scoring ?? { type: 'mean_scaled', reverseQuestions: [] },
    consent: input.consent ?? { required: false, text: '' },
    sections: Array.isArray(input.sections) ? input.sections : [],
    questions: Array.isArray(input.questions) ? input.questions : [],
    metadata: {
      createdAt: input.metadata?.createdAt ?? now,
      updatedAt: now,
    },
  };
}
