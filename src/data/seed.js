import { createQuestionnaireId } from '../lib/scoring';
import { createBand, createQuestion, createQuestionnaire, createScale } from './questionnaireSchema';

const fivePointLikert = createScale({
  id: 'likert-5',
  labels: ['Nunca', 'Quase Nunca', 'Às Vezes', 'Frequentemente', 'Sempre'],
});

const agreementLikert = createScale({
  id: 'agreement-5',
  labels: ['Discordo totalmente', 'Discordo', 'Nem concordo nem discordo', 'Concordo', 'Concordo totalmente'],
});

function q(id, text, reverse = false, dimension = 'geral') {
  return createQuestion({ id, text, reverse, dimension });
}

export const seedQuestionnaires = [
  createQuestionnaire({
    id: createQuestionnaireId('Regulação Emocional'),
    code: 'regulacao-emocional',
    title: 'Regulação Emocional',
    subtitle: 'Protocolo adulto para avaliar situações que possam ter alterado a regulação emocional.',
    audience: 'Adulto',
    domain: 'Saúde mental',
    source: 'Documento de levantamento enviado pelo usuário',
    status: 'active',
    tags: ['saude-mental', 'adulto'],
    scale: fivePointLikert,
    bands: [
      createBand(0, 19, 'Muito baixo'),
      createBand(20, 39, 'Baixo'),
      createBand(40, 59, 'Moderado'),
      createBand(60, 79, 'Alto'),
      createBand(80, 100, 'Muito alto'),
    ],
    scoring: {
      type: 'mean_scaled',
      reverseQuestions: [],
    },
    questions: [
      q('re-1', 'Pouco interesse em fazer as coisas?'),
      q('re-2', 'Costumo fazer uma coisa por vez?'),
      q('re-3', 'Sentiu-se desanimado, ou sem esperança?'),
      q('re-4', 'Pensamento de ferir a si mesmo?'),
      q('re-5', 'Sentiu-se mais irritado, mal-humorado ou zangado do que o usual?'),
    ],
  }),
  createQuestionnaire({
    id: createQuestionnaireId('Engajamento no Trabalho'),
    code: 'engajamento-no-trabalho',
    title: 'Engajamento no Trabalho',
    subtitle: 'Mede energia, dedicação e imersão no trabalho.',
    audience: 'Adulto',
    domain: 'Trabalho e bem-estar',
    source: 'Documento de levantamento enviado pelo usuário',
    status: 'active',
    tags: ['trabalho', 'engajamento'],
    scale: agreementLikert,
    bands: [
      createBand(0, 19, 'Muito baixo'),
      createBand(20, 39, 'Baixo'),
      createBand(40, 59, 'Moderado'),
      createBand(60, 79, 'Alto'),
      createBand(80, 100, 'Muito alto'),
    ],
    scoring: {
      type: 'mean_scaled',
      reverseQuestions: [],
    },
    questions: [
      q('en-1', 'Repleto de energia', false, 'vigor'),
      q('en-2', 'Trabalho com significado e propósito', false, 'dedicacao'),
      q('en-3', 'O tempo voa no trabalho', false, 'absorcao'),
      q('en-4', 'Sinto força, vigor e vitalidade', false, 'vigor'),
      q('en-5', 'Entusiasmado com o trabalho', false, 'dedicacao'),
    ],
  }),
  createQuestionnaire({
    id: createQuestionnaireId('Burnout - Sintomas Primários'),
    code: 'burnout-sintomas-primarios',
    title: 'Burnout - Sintomas Primários',
    subtitle: 'Versão inicial para acompanhar exaustão e distanciamento mental.',
    audience: 'Adulto',
    domain: 'Saúde mental no trabalho',
    source: 'Documento de levantamento enviado pelo usuário',
    status: 'active',
    tags: ['burnout', 'trabalho'],
    scale: fivePointLikert,
    bands: [
      createBand(0, 19, 'Muito baixo'),
      createBand(20, 39, 'Baixo'),
      createBand(40, 59, 'Moderado'),
      createBand(60, 79, 'Alto'),
      createBand(80, 100, 'Muito alto'),
    ],
    scoring: {
      type: 'mean_scaled',
      reverseQuestions: [],
    },
    questions: [
      q('bu-1', 'No trabalho, sinto-me mentalmente exausto', false, 'exaustao'),
      q('bu-2', 'Tudo o que faço no trabalho exige muito esforço', false, 'exaustao'),
      q('bu-3', 'Acho difícil recuperar minha energia depois de um dia de trabalho', false, 'exaustao'),
      q('bu-4', 'No trabalho sinto-me fisicamente exausto', false, 'exaustao'),
      q('bu-5', 'Ao levantar pela manhã, me falta energia para começar um novo dia', false, 'exaustao'),
    ],
  }),
  createQuestionnaire({
    id: createQuestionnaireId('Autoeficácia'),
    code: 'autoeficacia',
    title: 'Autoeficácia',
    subtitle: 'Base inicial para avaliar confiança funcional no trabalho.',
    audience: 'Adulto',
    domain: 'Desempenho e adaptação',
    source: 'Documento de levantamento enviado pelo usuário',
    status: 'active',
    tags: ['autoeficacia', 'trabalho'],
    scale: agreementLikert,
    bands: [
      createBand(0, 19, 'Muito baixa'),
      createBand(20, 39, 'Baixa'),
      createBand(40, 59, 'Moderada'),
      createBand(60, 79, 'Alta'),
      createBand(80, 100, 'Muito alta'),
    ],
    scoring: {
      type: 'mean_scaled',
      reverseQuestions: [],
    },
    questions: [
      q('ae-1', 'Pensar em alternativas para resolver problemas da melhor forma possível'),
      q('ae-2', 'Me adaptar às regras propostas pela empresa em que trabalho'),
      q('ae-3', 'Trabalhar com pessoas que têm opiniões diferentes'),
      q('ae-4', 'Lidar com a maioria dos problemas que aparecem em meu trabalho'),
      q('ae-5', 'Administrar meu tempo em relação às minhas funções no trabalho'),
    ],
  }),
];
