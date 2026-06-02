import { createQuestionnaireId } from '../lib/scoring.js';
import { createBand, createQuestion, createQuestionnaire, createScale } from './questionnaireSchema.js';
import { extraQuestionnaires } from './questionnaireExtras.js';

const fivePointLikert = createScale({
  id: 'likert-5',
  labels: ['Nunca', 'Quase Nunca', 'Às Vezes', 'Frequentemente', 'Sempre'],
});

const agreementLikert = createScale({
  id: 'agreement-5',
  labels: ['Discordo totalmente', 'Discordo', 'Nem concordo nem discordo', 'Concordo', 'Concordo totalmente'],
});

const fourPointLikert = createScale({
  id: 'likert-4',
  labels: ['Nunca', 'Raramente', 'Frequentemente', 'Sempre'],
});

const fourPointAgreement = createScale({
  id: 'agreement-4',
  labels: ['Discordo plenamente', 'Discordo', 'Concordo', 'Concordo plenamente'],
});

const threePointFrequency = createScale({
  id: 'frequency-3',
  labels: ['Raramente', 'Às vezes', 'Quase sempre'],
});

function q(id, text, reverse = false, dimension = 'geral') {
  return createQuestion({ id, text, reverse, dimension });
}

export const seedQuestionnaires = [
  createQuestionnaire({
    id: createQuestionnaireId('Regulação Emocional'),
    code: 'regulacao-emocional',
    title: 'Regulação Emocional',
    subtitle: 'Protocolo adulto para avaliar situações que possam ter alterado a sua Regulação Emocional.',
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
      q('re-6', 'Dores e sofrimento sem explicação (p. ex. cabeça, costas, articulações, abdômen, pernas)?'),
      q('re-7', 'Procuro estar realmente focado(a) em cada atividade que executo?'),
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
      q('re-15', 'Se é casado, ou tem namorada(o), consegue reservar momentos a dois?'),
      q('re-16', 'Satisfação e desejo sexual na rotina cotidiana'),
      q('re-17', 'Se tem filhos, consegue reservar momento com eles?'),
      q('re-18', 'Se tem filhos na escola, consegue se envolver na rotina escolar deles?'),
      q('re-19', 'Conheço minhas dificuldades e fraquezas e também minhas forças e fortalezas?'),
      q('re-20', 'Tenho o hábito de agradecer o gesto de valor de alguém para comigo?'),
      q('re-21', 'Procuro me tratar com carinho e respeito?'),
    ],
  }),
  createQuestionnaire({
    id: createQuestionnaireId('Engajamento no Trabalho'),
    code: 'engajamento-no-trabalho',
    title: 'Escala de Engajamento - EQUIPE SAE',
    subtitle: 'LEVANTAMENTO ESCALA DE ENGAJAMENTO.',
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
      q('en-1', 'Repleto cheio de Energia', false, 'vigor'),
      q('en-2', 'Trabalho com Significado e Propósito', false, 'dedicacao'),
      q('en-3', 'O tempo voa no Trabalho', false, 'absorcao'),
      q('en-4', 'Sinto Força, Vigor e Vitalidade.', false, 'vigor'),
      q('en-5', 'Entusiasmado com o Trabalho', false, 'dedicacao'),
      q('en-6', 'Esqueço tudo o que se Passa ao Redor.', false, 'absorcao'),
      q('en-7', 'Trabalho me inspira.', false, 'dedicacao'),
      q('en-8', 'Ao acordar, de manhã vontade de ir Trabalhar.', false, 'vigor'),
      q('en-9', 'Felicidade quando trabalha intensamente.', false, 'dedicacao'),
      q('en-10', 'Orgulho do Trabalho que Realiza.', false, 'dedicacao'),
      q('en-11', 'Envolvimento com o Trabalho que Faz.', false, 'absorcao'),
      q('en-12', 'Posso trabalhar durante longos períodos de tempo.', false, 'absorcao'),
      q('en-13', 'O Trabalho é Desafiador.', false, 'vigor'),
      q('en-14', 'Deixo-me levar pelo Trabalho.', false, 'absorcao'),
      q('en-15', 'Sou mentalmente Resiliente.', false, 'vigor'),
      q('en-16', 'É difícil desligar-me do Trabalho.', true, 'absorcao'),
      q('en-17', 'Sou persistente mesmo quando as coisas não vão Bem.', false, 'vigor'),
    ],
  }),
  createQuestionnaire({
    id: createQuestionnaireId('Autoeficácia'),
    code: 'autoeficacia',
    title: 'Protocolo para avaliar Autoeficácia - EQUIPE ESF C.Novo',
    subtitle: 'Autoeficácia no contexto de trabalho e equipe.',
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
      q('ae-2', 'Me esforçar para ir atrás das normas e procedimentos da organização em que trabalho'),
      q('ae-3', 'Me adaptar às regras propostas pela empresa em que trabalho'),
      q('ae-4', 'Trabalhar com pessoas que têm opiniões diferentes'),
      q('ae-5', 'Trabalhar com pessoas com menos experiência profissional do que eu'),
      q('ae-6', 'Entender e aceitar as críticas construtivas que recebo quando meu desempenho é avaliado'),
      q('ae-7', 'Trabalhar em equipe'),
      q('ae-8', 'Trabalhar com pessoas com mais experiência profissional do que eu'),
      q('ae-9', 'Iniciar minhas funções sem ser cobrado pela chefia'),
      q('ae-10', 'Buscar informações que me possibilitem executar minhas funções de trabalho de forma adequada'),
      q('ae-11', 'Lidar com a maioria dos problemas que aparecem em meu trabalho'),
      q('ae-12', 'Resolver a maioria dos problemas que ocorrem em meu trabalho'),
      q('ae-13', 'Executar o que deve ser feito em meu trabalho'),
      q('ae-14', 'Me comunicar adequadamente com meus colegas de trabalho'),
      q('ae-15', 'Estabelecer boas relações com meus colegas do meu setor de trabalho'),
      q('ae-16', 'Respeitar meus colegas de trabalho'),
      q('ae-17', 'Planejar o que deve ser feito em meu trabalho'),
      q('ae-18', 'Desempenhar da melhor forma possível minhas funções'),
      q('ae-19', 'Me organizar para que meu trabalho não fique atrasado'),
      q('ae-20', 'Administrar meu tempo em relação às minhas funções no trabalho'),
      q('ae-21', 'Estabelecer boas relações com colegas de outros setores'),
      q('ae-22', 'Trabalhar com pessoas mais novas do que eu'),
      q('ae-23', 'Traçar um plano de ação para o meu trabalho'),
    ],
  }),
  ...extraQuestionnaires,
];

