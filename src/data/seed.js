import { createQuestionnaireId } from '../lib/scoring';

const fivePointLikert = {
  id: 'likert-5',
  labels: ['Nunca', 'Quase Nunca', 'Às Vezes', 'Frequentemente', 'Sempre'],
  values: [0, 1, 2, 3, 4],
};

const agreementLikert = {
  id: 'agreement-5',
  labels: ['Discordo totalmente', 'Discordo', 'Nem concordo nem discordo', 'Concordo', 'Concordo totalmente'],
  values: [0, 1, 2, 3, 4],
};

function q(id, text, reverse = false) {
  return { id, text, reverse };
}

export const seedQuestionnaires = [
  {
    id: createQuestionnaireId('Regulação Emocional'),
    title: 'Regulação Emocional',
    subtitle: 'Protocolo adulto para avaliar situações que possam ter alterado a regulação emocional.',
    audience: 'Adulto',
    domain: 'Saúde mental',
    source: 'Documento de levantamento enviado pelo usuário',
    scale: fivePointLikert,
    bands: [
      { min: 0, max: 19, label: 'Muito baixo' },
      { min: 20, max: 39, label: 'Baixo' },
      { min: 40, max: 59, label: 'Moderado' },
      { min: 60, max: 79, label: 'Alto' },
      { min: 80, max: 100, label: 'Muito alto' },
    ],
    questions: [
      q('re-1', 'Pouco interesse em fazer as coisas?'),
      q('re-2', 'Costumo fazer uma coisa por vez?'),
      q('re-3', 'Sentiu-se desanimado, ou sem esperança?'),
      q('re-4', 'Pensamento de ferir a si mesmo?'),
      q('re-5', 'Sentiu-se mais irritado, mal-humorado ou zangado do que o usual?'),
    ],
  },
  {
    id: createQuestionnaireId('Engajamento no Trabalho'),
    title: 'Engajamento no Trabalho',
    subtitle: 'Mede energia, dedicação e imersão no trabalho.',
    audience: 'Adulto',
    domain: 'Trabalho e bem-estar',
    source: 'Documento de levantamento enviado pelo usuário',
    scale: agreementLikert,
    bands: [
      { min: 0, max: 19, label: 'Muito baixo' },
      { min: 20, max: 39, label: 'Baixo' },
      { min: 40, max: 59, label: 'Moderado' },
      { min: 60, max: 79, label: 'Alto' },
      { min: 80, max: 100, label: 'Muito alto' },
    ],
    questions: [
      q('en-1', 'Repleto de energia'),
      q('en-2', 'Trabalho com significado e propósito'),
      q('en-3', 'O tempo voa no trabalho'),
      q('en-4', 'Sinto força, vigor e vitalidade'),
      q('en-5', 'Entusiasmado com o trabalho'),
    ],
  },
  {
    id: createQuestionnaireId('Burnout - Sintomas Primários'),
    title: 'Burnout - Sintomas Primários',
    subtitle: 'Versão inicial para acompanhar exaustão e distanciamento mental.',
    audience: 'Adulto',
    domain: 'Saúde mental no trabalho',
    source: 'Documento de levantamento enviado pelo usuário',
    scale: fivePointLikert,
    bands: [
      { min: 0, max: 19, label: 'Muito baixo' },
      { min: 20, max: 39, label: 'Baixo' },
      { min: 40, max: 59, label: 'Moderado' },
      { min: 60, max: 79, label: 'Alto' },
      { min: 80, max: 100, label: 'Muito alto' },
    ],
    questions: [
      q('bu-1', 'No trabalho, sinto-me mentalmente exausto'),
      q('bu-2', 'Tudo o que faço no trabalho exige muito esforço'),
      q('bu-3', 'Acho difícil recuperar minha energia depois de um dia de trabalho'),
      q('bu-4', 'No trabalho sinto-me fisicamente exausto'),
      q('bu-5', 'Ao levantar pela manhã, me falta energia para começar um novo dia'),
    ],
  },
  {
    id: createQuestionnaireId('Autoeficácia'),
    title: 'Autoeficácia',
    subtitle: 'Base inicial para avaliar confiança funcional no trabalho.',
    audience: 'Adulto',
    domain: 'Desempenho e adaptação',
    source: 'Documento de levantamento enviado pelo usuário',
    scale: agreementLikert,
    bands: [
      { min: 0, max: 19, label: 'Muito baixa' },
      { min: 20, max: 39, label: 'Baixa' },
      { min: 40, max: 59, label: 'Moderada' },
      { min: 60, max: 79, label: 'Alta' },
      { min: 80, max: 100, label: 'Muito alta' },
    ],
    questions: [
      q('ae-1', 'Pensar em alternativas para resolver problemas da melhor forma possível'),
      q('ae-2', 'Me adaptar às regras propostas pela empresa em que trabalho'),
      q('ae-3', 'Trabalhar com pessoas que têm opiniões diferentes'),
      q('ae-4', 'Lidar com a maioria dos problemas que aparecem em meu trabalho'),
      q('ae-5', 'Administrar meu tempo em relação às minhas funções no trabalho'),
    ],
  },
];
