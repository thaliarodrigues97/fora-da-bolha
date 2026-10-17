// Perguntas editoriais, sem coleta de respostas ou envio automático ao chat.
export const topics = [
  ['Diálogo', 'O que você gostaria que o outro lado entendesse melhor sobre você?'],
  ['Diálogo', 'Qual experiência pessoal mais influenciou sua visão política?'],
  ['Diálogo', 'Qual convicção sua seria mais difícil de mudar? O que poderia fazer você reconsiderá-la?'],
  ['Diálogo', 'Você já defendeu uma ideia e depois percebeu que ela prejudicava alguém? O que mudou?'],
  ['Diálogo', 'Qual é a crítica mais justa que alguém do outro lado poderia fazer ao seu posicionamento?'],
  ['Sexualidade', 'Como conciliar convicções pessoais sobre sexualidade com o respeito aos direitos de quem vive de outra forma?'],
  ['Sexualidade', 'O que diferencia discordar de uma ideia de discriminar uma pessoa por sua orientação sexual?'],
  ['Sexualidade', 'Como família e escola poderiam conversar sobre sexualidade de maneira adequada à idade, sem medo nem constrangimento?'],
  ['Sexualidade', 'Como você reagiria se alguém próximo revelasse uma orientação sexual diferente da que você imaginava? O que guiaria sua reação?'],
  ['Sexualidade', 'Quais aspectos da vida íntima deveriam ficar fora das decisões do Estado? Como você define esse limite?'],
  ['Corrupção', 'Você cobraria de um político em quem votou a mesma responsabilização que cobra de um adversário? Como colocaria isso em prática?'],
  ['Corrupção', 'Como distinguir uma acusação usada como arma política de uma denúncia que precisa ser investigada?'],
  ['Corrupção', 'Uma boa gestão em algumas áreas pode compensar um caso de corrupção? Como você chega à sua resposta?'],
  ['Corrupção', 'Que mudança dificultaria a corrupção sem depender apenas da honestidade de quem está no poder?'],
  ['Corrupção', 'Você enxerga relação entre pequenos favorecimentos do cotidiano e a corrupção política? Onde estão as diferenças?'],
  ['Religião', 'Como garantir liberdade religiosa também para quem segue uma religião minoritária ou não tem religião?'],
  ['Religião', 'Em que momento uma crítica a uma crença se transforma em intolerância contra quem acredita nela?'],
  ['Religião', 'Como um representante eleito pode seguir sua fé e, ao mesmo tempo, representar pessoas de outras crenças?'],
  ['Religião', 'O que você faria ao presenciar intolerância contra uma religião com a qual não se identifica?'],
  ['Religião', 'Quando valores religiosos influenciam uma proposta de lei, quais argumentos deveriam sustentar a decisão pública?'],
  ['Gênero e família', 'Quais expectativas sobre homens e mulheres você aprendeu na infância e hoje questiona?'],
  ['Gênero e família', 'O que torna uma família um espaço de cuidado, independentemente de sua composição?'],
  ['Gênero e família', 'Como conversar sobre identidade de gênero sem reduzir a pessoa a um rótulo ou presumir sua experiência?'],
  ['Gênero e família', 'Que responsabilidades de cuidado deveriam ser divididas entre família, empregadores e Estado?'],
  ['Gênero e família', 'Como você diferencia uma tradição que deseja preservar de uma expectativa que limita a liberdade de outra pessoa?'],
  ['Desigualdade', 'Até que ponto o sucesso de alguém depende de esforço individual e das oportunidades que essa pessoa recebeu?'],
  ['Desigualdade', 'Que experiência faria você reconsiderar sua opinião sobre políticas de transferência de renda?'],
  ['Desigualdade', 'Como uma política de cotas deveria ser avaliada? Quais resultados e dificuldades você consideraria?'],
  ['Desigualdade', 'O que seria uma contribuição justa em impostos para pessoas com rendas e patrimônios muito diferentes?'],
  ['Desigualdade', 'Como discutir racismo levando a sério experiências diferentes da sua, inclusive quando você não percebeu o problema?'],
  ['Segurança pública', 'O que uma política de segurança precisa entregar além de prisões para ser considerada bem-sucedida?'],
  ['Segurança pública', 'Como proteger a população e os profissionais de segurança sem abrir mão da responsabilização por abusos?'],
  ['Segurança pública', 'Qual deveria ser o equilíbrio entre punição, reparação às vítimas e reintegração de quem comete um crime?'],
  ['Segurança pública', 'Que evidências fariam você mudar de opinião sobre facilitar ou restringir o acesso a armas?'],
  ['Segurança pública', 'Como você avaliaria uma mudança na política de drogas? Quais consequências precisariam ser acompanhadas?'],
  ['Educação', 'Como ensinar pensamento crítico sem pedir que estudantes adotem a posição política de quem ensina?'],
  ['Educação', 'Como decidir quais assuntos controversos devem ser discutidos na escola e de que maneira?'],
  ['Educação', 'Em quais decisões sobre a educação de uma criança família e escola deveriam ter mais autonomia? Como resolver conflitos?'],
  ['Educação', 'O que deveria ser prioridade se uma escola tivesse poucos recursos: infraestrutura, professores, permanência ou outra necessidade? Por quê?'],
  ['Educação', 'Como você gostaria que a escola apresentasse um período histórico sobre o qual sua família tem uma opinião forte?'],
  ['Democracia', 'Você defenderia o direito de manifestação de um grupo cujas ideias rejeita? Quais limites aplicaria a todos?'],
  ['Democracia', 'Como você reagiria se uma regra criada para limitar seus adversários fosse aplicada ao seu próprio grupo?'],
  ['Democracia', 'O que faz você confiar em uma instituição mesmo quando ela toma uma decisão contrária ao que você deseja?'],
  ['Democracia', 'Como uma sociedade pode tomar decisões quando a maioria e uma minoria discordam sobre direitos fundamentais?'],
  ['Democracia', 'Quais atitudes você considera inaceitáveis em uma liderança política, mesmo quando concorda com suas propostas?'],
  ['Saúde e autonomia', 'Como você pensa o conflito entre autonomia sobre o próprio corpo, proteção da vida e convicções sobre aborto?'],
  ['Saúde e autonomia', 'Como equilibrar decisões individuais e proteção coletiva quando uma escolha de saúde afeta outras pessoas?'],
  ['Saúde e autonomia', 'Quando os recursos da saúde são limitados, quais critérios deveriam definir as prioridades de atendimento?'],
  ['Saúde e autonomia', 'Como apoiar uma pessoa em sofrimento psíquico sem tratar sua situação como falta de esforço ou fraqueza?'],
  ['Saúde e autonomia', 'Que cuidados uma política pública precisa ter ao lidar com decisões pessoais profundamente ligadas à religião e à consciência?'],
  ['Meio ambiente', 'Como distribuir os custos de proteger o ambiente entre consumidores, empresas e governo?'],
  ['Meio ambiente', 'Como decidir quando um projeto promete empregos, mas também traz riscos ambientais à comunidade?'],
  ['Meio ambiente', 'Como incluir povos indígenas e comunidades locais nas decisões que afetam seus territórios?'],
  ['Meio ambiente', 'Que responsabilidades temos com pessoas que ainda não nasceram ao decidir sobre recursos naturais?'],
  ['Meio ambiente', 'O que faria uma proposta ambiental parecer justa para alguém que depende economicamente da atividade que será restringida?'],
  ['Internet e informação', 'Qual foi a última vez que você verificou uma informação que favorecia o seu próprio lado? O que encontrou?'],
  ['Internet e informação', 'Como combater ameaças e desinformação na internet sem dar poder excessivo a quem decide o que pode circular?'],
  ['Internet e informação', 'Que sinais fazem você confiar em uma fonte de informação? Você aplica os mesmos critérios a todas?'],
  ['Internet e informação', 'Você já compartilhou algo e depois descobriu que estava errado? Como lidou com isso?'],
  ['Internet e informação', 'Em que momento responsabilizar alguém por uma fala vira uma punição desproporcional? Como distinguir os casos?']
].map(([theme, question]) => ({theme, question}));

export function createTopicPicker() {
  let remaining = [], activeTheme, lastQuestion;
  return (theme = '') => {
    const options = topics.filter(topic => !theme || topic.theme === theme);
    if (!options.length) return null;
    if (theme !== activeTheme || !remaining.length) {
      activeTheme = theme;
      remaining = [...options];
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      if (remaining.length > 1 && remaining[remaining.length - 1].question === lastQuestion) {
        [remaining[0], remaining[remaining.length - 1]] = [remaining[remaining.length - 1], remaining[0]];
      }
    }
    const topic = remaining.pop();
    lastQuestion = topic.question;
    return {...topic, total: options.length};
  };
}
