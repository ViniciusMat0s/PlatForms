import { createBand, createQuestion, createQuestionnaire, createScale } from './questionnaireSchema.js';
import { createQuestionnaireId } from '../lib/scoring.js';

const fivePointLikert = createScale({
  id: 'likert-5',
  labels: ['Nunca', 'Quase Nunca', 'Às Vezes', 'Frequentemente', 'Sempre'],
});

const threePointFrequency = createScale({
  id: 'frequency-3',
  labels: ['Quase sempre', 'Quase nunca', 'Raramente'],
});

const resilienceScale = createScale({
  id: 'resilience-5',
  labels: ['Concordo Totalmente', 'Concordo Pouco', 'Discordo Muito', 'Discordo Pouco', 'Discordo Totalmente'],
});

const automaticThoughtsScale = createScale({
  id: 'automatic-thoughts-4',
  labels: ['Raramente', 'De vez em quando', 'Frequentemente', 'Sempre'],
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
  createQuestionnaire({
    id: createQuestionnaireId('Projeto Cuidando do Cuidador - Protocolo de Atenção – Concentração – Saúde Mental'),
    code: 'projeto-cuidando-do-cuidador',
    title: 'Projeto Cuidando do Cuidador - Protocolo de Atenção – Concentração – Saúde Mental',
    subtitle: 'Atenção, concentração e autocuidado.',
    audience: 'Adulto',
    domain: 'Saúde mental',
    source: 'Documento enviado pelo usuário',
    status: 'active',
    tags: ['saude-mental', 'autocuidado', 'atencao'],
    scale: threePointFrequency,
    bands: defaultBands,
    scoring: { type: 'mean_scaled', reverseQuestions: [] },
    questions: [
      q('cc-1', 'Costumo fazer uma coisa por vez.'),
      q('cc-2', 'Procuro estar realmente focado (a) em cada atividade que executo'),
      q('cc-3', 'Sinto disposição ao acordar.'),
      q('cc-4', 'Pratico atividade física pelo menos três vezes na semana.'),
      q('cc-5', 'Busco constantemente aprender algo novo.'),
      q('cc-6', 'Quando converso com outras pessoas, procuro escutá-las verdadeiramente.'),
      q('cc-7', 'De tempos em tempos, busco conversar com as outras pessoas sobre como me sinto.'),
      q('cc-8', 'Conheço minhas dificuldades e fraquezas e também minhas forças e fortalezas'),
      q('cc-9', 'Busco desenvolver o que já tenho de bom em mim.'),
      q('cc-10', 'Procuro perdoar as pessoas e não alimentar ressentimentos.'),
      q('cc-11', 'Procuro notar oportunidades de apreciar pequenos momentos em que vejo, sinto e ouço algo agradável e especial.'),
      q('cc-12', 'Tenho o hábito de agradecer o gesto de valor de alguém para comigo.'),
      q('cc-13', 'Procuro me tratar com carinho e respeito.'),
    ],
  }),
  createQuestionnaire({
    id: createQuestionnaireId('Protocolo de Resiliência'),
    code: 'protocolo-de-resiliencia',
    title: 'Protocolo de Resiliência',
    subtitle: 'Avalia adaptação, persistência e capacidade de lidar com desafios.',
    audience: 'Adulto',
    domain: 'Desenvolvimento pessoal',
    source: 'Documento enviado pelo usuário',
    status: 'active',
    tags: ['resiliencia', 'desenvolvimento-pessoal'],
    scale: resilienceScale,
    bands: defaultBands,
    scoring: { type: 'mean_scaled', reverseQuestions: [] },
    questions: [
      q('rs-1', 'Sinto que consigo lidar com várias coisas ao mesmo tempo'),
      q('rs-2', 'A confiança em mim próprio(a) ajuda-me a lidar com tempos difíceis?'),
      q('rs-3', 'Normalmente consigo olhar para uma situação com várias perspectivas?'),
      q('rs-4', 'Quando estou numa situação difícil, normalmente consigo encontrar uma solução?'),
      q('rs-5', 'Tenho energia suficiente para fazer o que deve ser feito?'),
      q('rs-6', 'Manter-me interessado(a) nas atividades do dia a dia é importante para mim?'),
      q('rs-7', 'Sinto-me orgulhosa(o) por ter alcançado objetivos na minha vida?'),
      q('rs-8', 'Sou determinado(a).'),
      q('rs-9', 'Mantenho-me interessado(a) nas coisas'),
      q('rs-10', 'A minha vida tem um propósito.'),
      q('rs-11', 'Vivo um dia de cada vez'),
      q('rs-12', 'Eu não fico obcecado(a) com coisas que não posso resolver.'),
      q('rs-13', 'Sou capaz de depender de mim próprio(a) do que qualquer outra pessoa.'),
    ],
  }),
  createQuestionnaire({
    id: createQuestionnaireId('Escala de Pensamentos Automáticos'),
    code: 'escala-de-pensamentos-automaticos',
    title: 'Escala de Pensamentos Automáticos',
    subtitle: 'Lista de pensamentos automáticos negativos frequentes.',
    audience: 'Adulto',
    domain: 'Cognição',
    source: 'Documento enviado pelo usuário',
    status: 'active',
    tags: ['pensamentos-automaticos', 'cognicao'],
    scale: automaticThoughtsScale,
    bands: defaultBands,
    scoring: { type: 'mean_scaled', reverseQuestions: [] },
    questions: [
      q('pa-1', 'Eu me odeio'),
      q('pa-2', 'Eu sou um fracasso'),
      q('pa-3', 'Não sirvo pra nada'),
      q('pa-4', 'Nada mais da certo pra mim'),
      q('pa-5', 'Eu transformei minha vida em uma grande bagunça'),
      q('pa-6', 'Eu pareço um idiota'),
      q('pa-7', 'Tem alguma coisa muito errada comigo'),
      q('pa-8', 'Eu nunca serei tão bom quanto as outras pessoas'),
      q('pa-9', 'Eu não consigo fazer nada direito'),
      q('pa-10', 'Eu sempre levo a culpa por coisas que não faço'),
      q('pa-11', 'Eu nunca vou superar meus problemas'),
      q('pa-12', 'Eu estou ficando louco'),
      q('pa-13', 'É minha culpa se as coisas deram errado'),
      q('pa-14', 'Eu vou parecer um bobão'),
    ],
  }),
];
