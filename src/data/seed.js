import { createBand, createQuestion, createQuestionnaire, createScale } from './questionnaireSchema.js';
import { createQuestionnaireId } from '../lib/scoring.js';

const fivePointLikert = createScale({
  id: 'likert-5',
  labels: ['Nunca', 'Quase Nunca', 'Às Vezes', 'Frequentemente', 'Sempre'],
});

const defaultBands = [
  createBand(0, 19, 'Muito baixo'),
  createBand(20, 39, 'Baixo'),
  createBand(40, 59, 'Moderado'),
  createBand(60, 79, 'Alto'),
  createBand(80, 100, 'Muito alto'),
];

function q(id, text, reverse = false, dimension = 'geral') {
  return createQuestion({ id, text, reverse, dimension });
}

export const seedQuestionnaires = [
  createQuestionnaire({
    id: createQuestionnaireId('Protocolo adulto para avaliar situações que possam ter alterado a sua Regulação Emocional.'),
    code: 'regulacao-emocional',
    title: 'Protocolo adulto para avaliar situações que possam ter alterado a sua Regulação Emocional.',
    subtitle: 'Regulação Emocional',
    audience: 'Adulto',
    domain: 'Saúde mental',
    source: 'Documento enviado pelo usuário',
    status: 'active',
    tags: ['saude-mental', 'adulto', 'regulacao-emocional'],
    scale: fivePointLikert,
    bands: defaultBands,
    scoring: { type: 'mean_scaled', reverseQuestions: [] },
    questions: [
      q('re-1', 'Pouco interesse em fazer as coisas?'),
      q('re-2', 'Costumo fazer uma coisa por vez?'),
      q('re-3', 'Sentiu-se desanimado, ou sem esperança?'),
      q('re-4', 'Pensamento de ferir a si mesmo?'),
      q('re-5', 'Sentiu-se mais irritado, mal-humorado ou zangado do que o usual?'),
      q('re-6', 'Dores e sofrimento sem explicação (p. ex. cabeça, costas, articulações, abdômen, pernas..)?'),
      q('re-7', 'Procuro estar realmente focado (a) em cada atividade que executo?'),
      q('re-8', 'Encontra dificuldade para dormir?'),
      q('re-9', 'Quando converso com as outras pessoas, procuro escutá-las verdadeiramente?'),
      q('re-10', 'De tempos em tempos, busco conversar com as outras pessoas sobre como me sinto?'),
      q('re-11', 'Sentiu-se nervoso, ansioso, assustado, preocupado ou tenso?'),
      q('re-12', 'Consegue realizar algum tipo de atividade física?'),
      q('re-13', 'Consegue organizar suas refeições e se alimentar de maneira saudável?'),
      q(
        're-14',
        'Quando está de folga, consegue fazer coisas simples? (caminhada, chimarrão, encontrar amigos, refeições em família)',
      ),
      q('re-15', 'Se é casado, ou tem namorada (o), consegue reservar momentos a dois?'),
      q('re-16', 'Satisfação e desejo sexual na rotina cotidiana'),
      q('re-17', 'Se tem filhos, consegue reservar momento com eles?'),
      q('re-18', 'Se tem filhos na escola, consegue se envolver na rotina escolar deles?'),
      q('re-19', 'Conheço minhas dificuldades e fraquezas e também minhas forças e fortalezas?'),
      q('re-20', 'Tenho o hábito de agradecer o gesto de valor de alguém para comigo?'),
      q('re-21', 'Procuro me tratar com carinho e respeito?'),
    ],
  }),
];
