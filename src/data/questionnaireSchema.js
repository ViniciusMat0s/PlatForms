export const QUESTIONNAIRE_SCHEMA_VERSION = 1;

export function createScale({
  id,
  type = 'likert',
  labels = [],
  values = labels.map((_, index) => index),
  reversed = false,
}) {
  return {
    id,
    type,
    labels,
    values,
    reversed,
  };
}

export function createQuestion({
  id,
  text,
  kind = 'single_choice',
  required = true,
  reverse = false,
  dimension = 'geral',
  helpText = '',
  options = null,
}) {
  return {
    id,
    text,
    kind,
    required,
    reverse,
    dimension,
    helpText,
    options,
  };
}

export function createBand(min, max, label, color = null) {
  return {
    min,
    max,
    label,
    color,
  };
}

export function createQuestionnaire(definition) {
  const now = new Date().toISOString();

  return {
    schemaVersion: QUESTIONNAIRE_SCHEMA_VERSION,
    id: definition.id,
    code: definition.code ?? definition.id,
    title: definition.title,
    subtitle: definition.subtitle ?? '',
    audience: definition.audience ?? 'Geral',
    domain: definition.domain ?? 'Geral',
    source: definition.source ?? 'Local',
    version: definition.version ?? 1,
    status: definition.status ?? 'draft',
    tags: definition.tags ?? [],
    scale: definition.scale,
    bands: definition.bands ?? [],
    scoring: definition.scoring ?? {
      type: 'mean_scaled',
      reverseQuestions: [],
    },
    consent: definition.consent ?? {
      required: false,
      text: '',
    },
    sections: definition.sections ?? [],
    questions: definition.questions ?? [],
    metadata: definition.metadata ?? {
      createdAt: now,
      updatedAt: now,
    },
  };
}
