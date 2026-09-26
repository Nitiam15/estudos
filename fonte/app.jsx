const { useState, useEffect, useMemo, useCallback, useRef } = React;
const APP_VERSION = "1.5.0";

/* ============================================================
   PLANEJAMENTO DE ESTUDOS — residência 2027
   Cronograma: MEDPlanner | MEDCURSO 2026 (Notion)
   Bônus: Estatísticas de Aula Bônus USP-SP e Unifesp (2021-2025)
   Capacidade medida em PONTOS por semana:
   aula 5 · bônus 3 · questões 2 · revisão (flashcards) 1
   ============================================================ */

const C = {
  base: "#0F151B", surface: "#1A232C", ink: "#E7EDF2", ink2: "#8FA0AE",
  line: "#2E3A45", teal: "#58B3AC", tealSoft: "#16302E", tealClaro: "#7FC4BE",
  red: "#E0796A", redSoft: "#331F1C", amber: "#D9A83E", amberSoft: "#332A18",
  star: "#D6A83C", card: "#6AA3D8", noite: "#202B36", pend: "#3B4956", falta: "#8C3A31",
};
const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";
const AREAS = { "CLÍNICA": "#4FB3AB", "CIRURGIA": "#6AA3D8", "PEDIATRIA": "#D97BA0", "GO": "#A78BD0", "PREVENTIVA": "#83BC6C" };
const areaColor = (a) => AREAS[a] || C.ink2;

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
// "hoje" sempre no horário de São Paulo, qualquer que seja o fuso do aparelho
const FUSO = "America/Sao_Paulo";
const hojeISO = () => {
  try { return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
  catch { return iso(new Date()); }
};
const fmt = (s) => parse(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
const fmtCurto = (s) => parse(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
// a semana de estudo começa no sábado, acompanhando a liberação das aulas do Medcurso
const sabado = (s) => { const d = parse(s); return addDays(s, -((d.getDay() + 1) % 7)); };
const rotuloSemana = (s) => `${fmt(s)} a ${fmt(addDays(s, 6))}`;

/* ---------- pesos ---------- */
const PESO = { aula: 5, bonus: 3, questoes: 2, revisao: 1 };
const NOME_TIPO = { aula: "Aula", bonus: "Aula bônus", questoes: "Questões pós-aula", revisao: "Revisão · flashcards" };

/* ---------- escada nativa do Medcurso ---------- */
const ESCADA = [
  { nome: "Aula", dias: 0, tipo: "aula" },
  { nome: "Questões pós-aula", dias: 2, tipo: "questoes" },
  { nome: "Revisão 1 semana", dias: 7, tipo: "revisao" },
  { nome: "Revisão 1 mês", dias: 30, tipo: "revisao" },
  { nome: "Revisão 2 meses", dias: 60, tipo: "revisao" },
  { nome: "Revisão 4 meses", dias: 120, tipo: "revisao" },
  { nome: "Revisão 6 meses", dias: 180, tipo: "revisao" },
];
const CONCLUIDO = 7;
const TRILHAS = { A: [25, 20, 15, 10, 5], B: [15, 10, 10, 5, 5], C: [10, 10, 5, 5, 5], ND: [10, 10, 5, 5, 5] };
const qEtapa = (t, e) => (e < 1 ? 0 : (TRILHAS[t] || TRILHAS.ND)[Math.min(e - 1, 4)]);

/* ---------- cronograma ---------- */
const CRONO = [
  ["01","GO","Ciclo menstrual e anticoncepção","A"],["01","CLÍNICA","Glomerulopatias I (nefrítica, GNRP)","C"],
  ["02","GO","Amenorreia e ovário policístico","A"],["02","CLÍNICA","Glomerulopatias II (síndrome nefrótica)","C"],
  ["03","CIRURGIA","Trauma I: avaliação inicial e trauma de tórax","C"],["03","CIRURGIA","Trauma II: abdome, pelve e TCE","A"],
  ["04","CLÍNICA","Distúrbio hidroeletrolítico","C"],["04","GO","Diagnóstico de gravidez e pré-natal","A"],
  ["05","CLÍNICA","Insuficiência renal","C"],["05","CLÍNICA","Distúrbio ácido-básico","C"],
  ["06","PREVENTIVA","Medidas de saúde coletiva","A"],["06","PEDIATRIA","Neonatologia I","A"],
  ["08","PREVENTIVA","Estudos epidemiológicos","A"],["08","CIRURGIA","Urologia","B"],
  ["09","PEDIATRIA","Neonatologia II","A"],["09","CLÍNICA","Introdução à reumatologia e artrites","C"],
  ["10","CLÍNICA","Gota; febre reumática","C"],["10","PREVENTIVA","Epidemiologia clínica","A"],
  ["11","CIRURGIA","Queimadura e cirurgia plástica","B"],["11","GO","Assistência ao parto e parto prematuro","A"],
  ["12","CLÍNICA","Colagenoses","C"],["12","PREVENTIVA","Vigilância da saúde","A"],
  ["13","PREVENTIVA","Saúde do trabalhador + ética médica","ND"],["13","CIRURGIA","Cirurgia pediátrica","A"],
  ["14","PEDIATRIA","Aleitamento materno","A"],["14","CLÍNICA","Vasculites","C"],
  ["15","CLÍNICA","Anemias I (ferropriva, megaloblástica)","C"],["15","PEDIATRIA","Crescimento, desenvolvimento e puberdade","A"],
  ["16","CLÍNICA","Leucemias agudas e crônicas","C"],["16","CLÍNICA","Anemias II (hemolíticas, falciforme)","C"],
  ["17","CIRURGIA","Pré-operatório, risco cirúrgico e complicações","A"],["17","CLÍNICA","Linfomas e mieloma múltiplo","C"],
  ["18","CLÍNICA","Distúrbios da hemostasia","C"],["18","CIRURGIA","Hérnias da parede abdominal","ND"],
  ["19","CLÍNICA","Doenças do esôfago","B"],["19","GO","Sangramento uterino anormal, endometriose e infertilidade","A"],
  ["20","CLÍNICA","Doenças clínicas do intestino","B"],["20","CLÍNICA","Doenças do estômago","B"],
  ["21","CLÍNICA","Doenças cirúrgicas do intestino I","A"],["21","GO","Sangramentos na gravidez I","B"],
  ["22","GO","Sangramentos na gravidez II e DHP","B"],["22","CLÍNICA","Doenças cirúrgicas do intestino II","A"],
  ["23","CLÍNICA","Doença das vias biliares","A"],["23","CLÍNICA","Pancreatite e câncer de pâncreas","A"],
  ["24","CLÍNICA","Hepatologia; hepatites virais","C"],["24","CLÍNICA","Cirrose e suas causas","C"],
  ["25","CLÍNICA","Cirrose: complicações e hipertensão porta","C"],["25","GO","Climatério, distopia e incontinência","A"],
  ["26","CLÍNICA","Arritmias I (taquiarritmias)","B"],["26","PEDIATRIA","Desnutrição e baixa estatura","A"],
  ["27","CLÍNICA","Arritmias II (bradiarritmias) + PCR","B"],["27","PEDIATRIA","Imunização","A"],
  ["28","GO","Doença das mamas e ovários","A"],["28","CLÍNICA","Insuficiência cardíaca","B"],
  ["29","CLÍNICA","Valvopatias","B"],["29","CLÍNICA","HAS e crise hipertensiva","B"],
  ["30","PEDIATRIA","Diarreia aguda e desidratação","B"],["30","CLÍNICA","Doença arterial coronariana: IAM e angina","B"],
  ["31","PREVENTIVA","SUS I: histórico e legislação","A"],["31","GO","Lesões precursoras, câncer de colo e endométrio","A"],
  ["32","CLÍNICA","Tireoide","C"],["32","PREVENTIVA","SUS II: atenção básica e financiamento","A"],
  ["33","PEDIATRIA","Infecções respiratórias agudas I","B"],["33","CLÍNICA","Doenças da suprarrenal","B"],
  ["34","CLÍNICA","Diabetes mellitus","A"],["34","PEDIATRIA","Infecções respiratórias agudas II","B"],
  ["35","GO","Distúrbios hipertensivos da gestação, DM e gemelaridade","A"],["35","CLÍNICA","Asma e DPOC","A"],
  ["36","CLÍNICA","Câncer de pulmão, TEP","B"],["36","PEDIATRIA","Nefrologia pediátrica","A"],
  ["37","CLÍNICA","Pneumonia e complicações","B"],["37","CLÍNICA","Tuberculose","B"],
  ["38","CLÍNICA","AIDS","B"],["38","CLÍNICA","Parasitoses intestinais","C"],
  ["39","CLÍNICA","Endocardite infecciosa / meningite","B"],["39","GO","Sofrimento fetal, fórcipe e puerpério","A"],
  ["40","GO","Infecções sexualmente transmissíveis","A"],["40","CLÍNICA","Síndromes febris","B"],
  ["41","CLÍNICA","Neurologia I (cefaleias, epilepsias)","A"],["41","CLÍNICA","Neurologia II (AVE)","B"],
  ["42","PEDIATRIA","Doenças exantemáticas","A"],["42","CLÍNICA","Neurologia III (demência, Parkinson)","B"],
  ["43","CIRURGIA","Oftalmologia","C"],["43","CLÍNICA","Psiquiatria I","B"],["43","CLÍNICA","Psiquiatria II","B"],
  ["44","CIRURGIA","Especialidade cirúrgica I","A"],["44","CIRURGIA","Especialidade cirúrgica II","A"],
  ["45","CLÍNICA","Dermatologia I","B"],["45","CLÍNICA","Dermatologia II","B"],
  ["46","CIRURGIA","Ortopedia I","C"],["46","CIRURGIA","Ortopedia II","C"],
];

/* ---------- aulas bônus: [nome, ★USP-SP, ★Unifesp, semanaEstimada] ---------- */
const BONUS = {
  "01": [["Incongruência de gênero",0,0],["Síndrome pré-menstrual e SDPM",0,0],["Alport",0,0]],
  "03": [["Trauma cervical",0,0],["Trauma abdominal: lesões específicas",1,1],["Lesões de extremidades",0,0],
         ["Trauma diafragmático",1,2,1],["Lesão renal",1,1,1],["Trauma da coluna vertebral e raquimedular",0,2,1]],
  "04": [["Hipernatremia",0,0],["Aconselhamento genético pré-natal",0,0]],
  "05": [["Terapia de substituição renal: HD e DP",0,3],["Terapia de substituição renal: transplante",0,0],["Relação delta-delta",0,0]],
  "06": [["Outros indicadores e Censo 2022",0,0],["Triagem neonatal",3,2],["Exame físico neonatal",0,0]],
  "08": [["Testes estatísticos",0,3],["Estudos descritivos e metanálise",0,0],["Fases do ensaio clínico",1,0],
         ["Medidas de tendência central e dispersão",0,0],["Verossimilhança e testes múltiplos",0,0],["Curva ROC e ponto de corte",0,0],
         ["Câncer de rim",0,0],["Câncer de bexiga",0,1],["Câncer de testículo",0,0],["Hipogonadismo masculino e testosterona",0,2],["Disfunção erétil",0,0]],
  "09": [["Enterocolite necrosante",0,0],["Neonatologia: miscelânea",1,0],["Doenças do trato gastrointestinal (PED)",0,1,1],["AINEs e glicocorticoides",0,0]],
  "10": [["Fibromialgia",0,0],["Artrite séptica",2,1],["Anatomia da hipófise e hipotálamo",0,2,1]],
  "11": [["REMIT",0,0],["Suporte nutricional",1,0],["Cirurgia plástica",1,2],["Estudo do motor",2,0],["Mecanismo de parto",0,0],["Cesariana",0,0]],
  "12": [["Amiloidoses",0,0],["Síndrome de Sjögren",0,0],["Doença mista do tecido conjuntivo",0,0],
         ["Glossário de doenças infecciosas",1,0],["Processo epidêmico",3,0]],
  "13": [["Saúde do trabalhador: saturnismo, hidrargirismo, benzenismo",0,0],
         ["Cirurgia pediátrica: gastrointestinal",3,3],["Cirurgia pediátrica: geniturinário",0,1],["Miopatias inflamatórias idiopáticas",1,0,1]],
  "14": [["Alimentação complementar",0,0]],
  "15": [["Mielodisplasia",0,0],["Anemia sideroblástica",0,0],["Distúrbios puberais",0,0]],
  "16": [["Porfiria",0,0],["Hemoglobinúria paroxística noturna",0,0],["Talassemias",0,1]],
  "17": [["Anestesiologia",3,3],["Fios de sutura",0,1],["Profilaxia de TEP e TVP",0,0],["Fístulas digestivas e deiscência",3,0,1]],
  "18": [["Hemotransfusão",1,0],["Hemofilias",0,0],["Trombofilias",0,0],
         ["Hérnias: abordagem laparoscópica",3,0],["Outras hérnias",0,0],["Hérnias na infância",0,0]],
  "19": [["Perfuração esofágica (Boerhaave)",0,0],["Esofagites",0,0],["Infertilidade",1,2],["Dismenorreia e pólipos endometriais",1,0]],
  "20": [["Colite pseudomembranosa",0,0],["Síndrome do intestino irritável",0,0],["Hemorragia digestiva alta",1,0],
         ["GIST",0,0],["Linfoma gástrico",0,0],["Síndrome de Zollinger-Ellison",1,0]],
  "21": [["Ingestão de corpo estranho",1,0]],
  "22": [["Hemorragia digestiva baixa",0,0],["Tumores carcinoides",0,0],["Tumores do apêndice",0,0],["Câncer de canal anal",0,0]],
  "23": [["Neoplasias das vias biliares",0,0],["Lesão iatrogênica da via biliar",0,0],["Cistos de via biliar",0,0],
         ["Colangite esclerosante primária",0,0],["Tumores neuroendócrinos do pâncreas",0,0],["Neoplasias císticas do pâncreas",0,0]],
  "24": [["Insuficiência hepática aguda",0,0],["Hepatite medicamentosa",0,0]],
  "25": [["Abscesso hepático bacteriano",0,0],["Tumores hepáticos benignos",0,0],["Tumores hepáticos malignos",1,0],
         ["Osteoporose",1,0],["Fístulas genitais e bexiga dolorosa",0,0],["Anatomia em GO: pelve e assoalho",0,0]],
  "26": [["Bloqueios de ramo",0,0],["Carência de micronutrientes",0,0],["Síndromes genéticas",0,0]],
  "27": [["Marca-passo: conceitos básicos",1,0],["Marca-passo: funcionamento do definitivo",1,0],["Síncope",0,0],
         ["Profilaxia para raiva",0,0],["Profilaxia para tétano acidental",0,0]],
  "28": [["Choque: monitorização hemodinâmica e perfusional",1,1],["Choque: tratamento",1,1],["Choque em pediatria",2,0],
         ["Insuficiência cardíaca aguda",0,0],["Hipertensão pulmonar",0,0],["Cardiomiopatia dilatada",0,0],
         ["Cardiomiopatia hipertrófica",0,0],["Cardiomiopatia restritiva",0,0],["Takotsubo",0,0]],
  "30": [["Constipação na infância",0,1],["Diarreia crônica",0,1],["Complicações pós-IAM",0,1],["Pericardiopatias",1,0]],
  "31": [["Receitas médicas",0,1],["Decreto 7.508",0,1],["Câncer de vulva",0,0],["Síndrome do eutireoideo doente",0,1,1]],
  "32": [["Método clínico centrado na pessoa",2,0],["Método SOAP",2,0],["Saúde suplementar",2,0,1],
         ["Instrumentos de AB: tipos de família",0,0],["Instrumentos de AB: ciclo de vida familiar",0,0],
         ["Instrumentos de AB: Apgar familiar, Practice e Firo",0,0],["Escala de Coelho-Savassi",0,0],["Genograma e ecomapa",0,0],
         ["Hipotireoidismo congênito",0,0]],
  "33": [["Rinite alérgica",0,0],["Estridor crônico e corpo estranho",0,0],["Epistaxe",0,0],
         ["Hipófise e hipotálamo",0,2],["Síndromes endócrinas: coma mixedematoso",0,1,1],["Hiperparatireoidismo primário",1,0,1]],
  "34": [["Hipoglicemia",0,0],["Doença renal do diabetes",0,0],["Retinopatia diabética",0,0],
         ["Neuropatia diabética e pé diabético",0,0],["Dislipidemia",0,0],["Fibrose cística",0,0]],
  "35": [["Ventilação mecânica",3,0],["Capnografia",3,0],["Síndrome do desconforto respiratório agudo",3,0],
         ["Insuficiência respiratória",0,1],["USG de tórax",0,0],["Provas de função pulmonar",0,0],
         ["Doenças intercorrentes na gestação",3,3]],
  "36": [["Nódulo pulmonar solitário",0,3],["PALS / PCR na infância",3,0],["Anafilaxia",0,2],
         ["Embolia gordurosa",0,0],["Tumores do mediastino",0,0],["Pneumopatias intersticiais difusas",0,0],
         ["Sarcoidose",0,0],["Hemoptise",0,0],["Cardiopatias congênitas",0,0],["Hipertensão arterial na infância",0,0]],
  "37": [["Derrame pleural",1,1],["Influenza",0,0],["Aspergilose",0,0],["Histoplasmose",0,0],["Paracoccidioidomicose",0,0]],
  "38": [["HIV na infância",0,0],["HTLV",0,0],["Citomegalovírus",0,0],["Esquistossomose",0,0],
         ["Toxoplasmose",0,0],["Acidente por animais peçonhentos",0,0]],
  "39": [["Sepse e choque séptico",1,1],["Meningoencefalite herpética",1,0],["Abscesso cerebral",1,0],
         ["Infecção relacionada a cateter",0,0],["ITU",0,0],["Distúrbios do humor e tromboembolismo",3,3]],
  "40": [["Febre tifoide",0,0],["Malária",0,0],["Febre maculosa brasileira",0,0],["Covid-19",0,0],
         ["Febre do Oropouche",0,0],["Doença de Chagas",0,0],["Leishmaniose visceral",0,0]],
  "41": [["Cuidados paliativos",3,1],["Coma",2,0],["Hipertensão intracraniana",2,0],
         ["Hipertermia maligna",0,1],["Doenças da placa motora",0,1],["Distrofias musculares",0,0],
         ["Hérnia de disco",0,0],["Transtornos do neurodesenvolvimento",0,0]],
  "42": [["Prevenção de acidentes e maus-tratos na infância",0,3],["Erros inatos da imunidade",1,0],
         ["Febre sem sinais de localização",0,0],["Tumores abdominais na infância",0,0],
         ["Trombose venosa cerebral",0,0],["Ataque isquêmico transitório",0,0],["Tumores do SNC",0,0],["Vertigem",0,0]],
  "43": [["Intoxicações exógenas",0,1],["Crise aguda de glaucoma",0,1,1],["Suicídio",0,0]],
  "44": [["Cirurgia de cabeça e pescoço",1,0],["Cisto pilonidal",0,0]],
  "45": [["Herpes-zóster",1,0],["Piodermites",1,0],["Acne vulgar",0,0],["Mpox",0,0],["Angioedema hereditário",0,0]],
  "46": [["Doenças periarticulares",0,1,1]],
};

const DEFAULT_CFG = {
  dataProva: "2027-10-24", nomeProva: "Prova alvo (data provisória)",
  pontosSemana: 40, tetoAdiado: 0.30, janelaRedistribuicao: 3,
  maxRevisoes: 6, maxBonus: 3,
  fimCronograma: "2026-11-20",     // última aula do extensivo
  fimPrimario: "2026-12-06",       // fim do planejamento em carga cheia
  fimReduzido: "2027-01-10",       // até aqui, carga reduzida
  reducao: 0.33,
  semanaAtual: 38, semanaBaseSeg: "2026-09-19",   // semana do extensivo e o sábado em que ela começou
  pendentesForcados: [],                                   // nenhuma aula anterior em aberto
  // aula assistida, questões e revisões pendentes ("semana" ou "semana|área")
  somenteAulas: ["33|PEDIATRIA", "34|PEDIATRIA", "35", "36", "37"],
  bancaFoco: "ambas", incluirBaixaPrioridade: true, semanasAdiamentoBonus: 4,
  ankiMapa: {}, ankiAuto: true,
  provisorio: true,
};

const KEY = "estudos:v9";
const load = async (k, f) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch { return f; } };
const save = async (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

const inicioSemana = (n, cfg, hoje) => addDays(hoje, -7 * (cfg.semanaAtual - n));

function seed(cfg, hoje) {
  const soAula = cfg.somenteAulas || [];
  return CRONO.map(([semana, area, tema, tier], i) => {
    const n = Number(semana);
    const forcado = cfg.pendentesForcados.includes(semana + "|" + area);
    let etapa = 0, dataAula = null;
    if (forcado) {
      etapa = 0;                                   // nem a aula foi vista
    } else if (soAula.includes(semana) || soAula.includes(semana + "|" + area)) {
      dataAula = inicioSemana(n, cfg, hoje);
      etapa = 1;                                   // aula vista, questões pendentes
    } else if (n < cfg.semanaAtual) {
      dataAula = inicioSemana(n, cfg, hoje);
      let ult = 0;
      for (let k = 1; k <= 6; k++) if (diffDays(dataAula, hoje) >= ESCADA[k].dias) ult = k;
      etapa = Math.min(ult + 1, CONCLUIDO);
    }
    return { id: "b" + i, semana, area, tema, tier, etapa, dataAula };
  });
}
// semanas do extensivo, em ordem (a base do MEDPlanner não tem a 07)
const ORDEM_SEMANAS = [...new Set(CRONO.map((c) => Number(c[0])))].sort((a, b) => a - b);
const semanaDepoisDe = (n, passos) => {
  const i = ORDEM_SEMANAS.indexOf(Number(n));
  return ORDEM_SEMANAS[Math.min(ORDEM_SEMANAS.length - 1, Math.max(0, (i < 0 ? 0 : i) + passos))];
};

const seedBonus = () => {
  const out = [];
  Object.entries(BONUS).forEach(([semana, l]) => l.forEach(([nome, usp, uni, est], j) =>
    out.push({ id: "x" + semana + "_" + j, semana, nome, usp, uni, extra: !!est, feito: false })));
  return out;
};
// avança um tema até depois da etapa "ate", guardando o estado anterior de cada etapa pulada
function avancarBloco(b, ate, hoje) {
  if (b.etapa > ate) return b;
  const hist = { ...(b.hist || {}) };
  for (let e = b.etapa; e <= ate; e++) hist[e] = { u: b.dataUltima || null, a: b.dataAula || null };
  return { ...b, etapa: Math.min(ate + 1, CONCLUIDO), dataAula: b.dataAula || hoje, dataUltima: hoje, hist };
}
// volta um tema para a etapa "et", restaurando as datas que ele tinha antes de concluí-la
function voltarBloco(b, et) {
  if (b.etapa <= et) return b;
  const hist = { ...(b.hist || {}) }, h = hist[et];
  Object.keys(hist).forEach((k) => { if (Number(k) >= et) delete hist[k]; });
  return h ? { ...b, etapa: et, dataUltima: h.u, dataAula: h.a, hist } : { ...b, etapa: et, hist };
}
const pesoBonus = (b, cfg) => cfg.bancaFoco === "usp" ? b.usp : cfg.bancaFoco === "unifesp" ? b.uni : Math.max(b.usp, b.uni);

/* ============================================================
   MOTOR — capacidade em pontos, alocação semanal
   ============================================================ */
function fatorCarga(seg, cfg) {
  if (seg < cfg.fimPrimario) return 1;
  if (seg < cfg.fimReduzido) return 1 - cfg.reducao;
  return 1;
}

function construir(blocos, bonus, cfg, hoje, adiados, fora = new Set(), bonusAdiado = {}) {
  const seg0 = sabado(hoje);
  const nAdi = (id) => adiados[id] || 0;

  const aulas = [], questoes = [], revisoes = [];
  const mk = (b, e, extra) => ({ ...b, id: b.id + ":" + e, blocoId: b.id, etapaItem: e,
    rotulo: ESCADA[e].nome, questoes: qEtapa(b.tier, e), ...extra });
  blocos.forEach((b) => {
    if (b.etapa >= CONCLUIDO) return;
    if (b.etapa === 0) {
      // a aula e as suas questões entram juntas na mesma semana
      aulas.push(mk(b, 0, { tipo: "aula", peso: PESO.aula, ordem: Number(b.semana), questoes: 0,
        atrasada: Number(b.semana) < cfg.semanaAtual,
        par: mk(b, 1, { tipo: "questoes", peso: PESO.questoes }) }));
    } else {
      const p = ESCADA[b.etapa];
      const venc = addDays(b.dataUltima || b.dataAula || hoje, p.dias);
      const it = mk(b, b.etapa, { venc, atraso: Math.max(0, diffDays(venc, hoje)) });
      if (p.tipo === "questoes") questoes.push({ ...it, tipo: "questoes", peso: PESO.questoes });
      else revisoes.push({ ...it, tipo: "revisao", peso: PESO.revisao });
    }
  });

  const bns = bonus.filter((x) => !x.feito && (cfg.incluirBaixaPrioridade || pesoBonus(x, cfg) >= 2))
    .map((x) => { const e = pesoBonus(x, cfg);
      return { ...x, tipo: "bonus", peso: PESO.bonus, tema: x.nome, area: "CLÍNICA", estrelas: e, baixa: e <= 1,
        rotulo: e >= 2 ? "Aula bônus " + "★".repeat(e) : "Aula bônus · baixa prioridade" }; })
    .sort((a, b) => b.estrelas - a.estrelas || Number(a.semana) - Number(b.semana));

  const marcar = (l) => l.map((i) => ({ ...i, adiado: nAdi(i.id) }));
  const todos = [...marcar(aulas), ...marcar(questoes), ...marcar(revisoes), ...marcar(bns)];
  const adiada = todos.filter((i) => i.adiado > 0).sort((a, b) => b.adiado - a.adiado || b.peso - a.peso);
  const rest = todos.filter((i) => i.adiado === 0);
  const fAulas = rest.filter((i) => i.tipo === "aula").sort((a, b) => (b.atrasada - a.atrasada) || a.ordem - b.ordem);
  const fQuest = rest.filter((i) => i.tipo === "questoes").sort((a, b) => a.venc.localeCompare(b.venc));
  const fRev = rest.filter((i) => i.tipo === "revisao").sort((a, b) => a.venc.localeCompare(b.venc));
  const fBonus = rest.filter((i) => i.tipo === "bonus");

  // cada aula pertence à sua semana do extensivo; as pendentes de semanas anteriores caem na semana 0
  const idxSemana = (n) => { const i = ORDEM_SEMANAS.indexOf(Number(n)); return i < 0 ? 0 : i; };
  const baseIdx = idxSemana(cfg.semanaAtual);
  const alvoDaAula = (b) => Math.max(0, idxSemana(b.semana) - baseIdx);

  const semanas = [];
  const bucket = (i) => {
    while (semanas.length <= i) {
      const seg = addDays(seg0, 7 * semanas.length);
      const f = fatorCarga(seg, cfg);
      semanas.push({ seg, cap: Math.max(3, Math.round(cfg.pontosSemana * f)), fator: f,
        maxRev: Math.max(1, Math.round(cfg.maxRevisoes * f)), maxBns: Math.max(1, Math.round(cfg.maxBonus * f)),
        itens: [], pontos: 0, pAdi: 0, nRev: 0, nBns: 0 });
    }
    return semanas[i];
  };
  bucket(0);
  const semanaDe = (data) => Math.max(0, Math.floor(diffDays(seg0, sabado(data)) / 7));

  const por = (it, iMin, adi) => {
    let i = iMin, g = 0;
    while (g++ < 800) {
      const b = bucket(i);
      const cabePontos = b.pontos + it.peso <= b.cap + 0.01;
      const cabeAdi = !adi || b.pAdi + it.peso <= b.cap * cfg.tetoAdiado + 0.01;
      const cabeTipo = (it.tipo !== "revisao" || b.nRev < b.maxRev) && (it.tipo !== "bonus" || b.nBns < b.maxBns);
      if (cabePontos && cabeAdi && cabeTipo) break;
      i++;
    }
    const b = bucket(i);
    const { par, ...limpo } = it;
    b.itens.push({ ...limpo, seg: b.seg });
    b.pontos += it.peso; if (adi) b.pAdi += it.peso;
    if (it.tipo === "revisao") b.nRev++; if (it.tipo === "bonus") b.nBns++;
    return i;
  };

  const janela = Math.max(1, cfg.janelaRedistribuicao);
  const min0 = (it) => (fora.has(it.id) ? 1 : 0);

  // A aula de uma semana do extensivo nunca sai da sua semana: entra primeiro e acima do
  // limite de pontos. Pendências e revisões é que escorrem para as semanas seguintes.
  const fixar = (it, i) => {
    const b = bucket(i);
    const { par, ...limpo } = it;
    b.itens.push({ ...limpo, seg: b.seg }); b.pontos += it.peso;
    return i;
  };
  const naPropriaSemana = (a) => idxSemana(a.semana) - baseIdx >= 0;
  const pares = [];   // [questões, semana mínima] — nunca antes da semana da própria aula

  // 1º) as aulas de cada semana ocupam o seu lugar e reservam os pontos delas
  [...fAulas, ...adiada.filter((it) => it.tipo === "aula")].filter(naPropriaSemana)
    .forEach((a) => { const i = fixar(a, Math.max(min0(a), alvoDaAula(a))); if (a.par) pares.push([a.par, i]); });

  // 2º) aulas atrasadas de semanas anteriores, que disputam espaço como as demais pendências
  [...adiada.filter((it) => it.tipo === "aula" && !naPropriaSemana(it)), ...fAulas.filter((a) => !naPropriaSemana(a))]
    .forEach((a) => { const i = por(a, min0(a), !!a.adiado); if (a.par) pares.push([a.par, i]); });

  // 3º) revisões e questões já vencidas vêm antes do que ainda nem foi visto
  fRev.forEach((r) => por(r, Math.max(min0(r), r.venc <= hoje ? 0 : semanaDe(r.venc)), false));
  fQuest.forEach((q) => por(q, Math.max(min0(q), q.venc <= hoje ? 0 : semanaDe(q.venc)), false));
  adiada.filter((it) => it.tipo !== "aula")
    .forEach((it, k) => por(it, Math.max(min0(it), k % janela), true));

  // 4º) as questões das aulas novas, a partir da semana em que a aula acontece
  pares.forEach(([q, iAula]) => por(q, Math.max(min0(q), iAula), false));
  fBonus.forEach((b) => {
    const ate = bonusAdiado[b.id];                       // trocada: só volta a partir dessa semana
    const iAdiado = ate ? Math.max(0, Math.ceil(diffDays(seg0, ate) / 7)) : 0;
    por(b, Math.max(min0(b), iAdiado), false);
  });

  const ordem = { aula: 0, questoes: 1, revisao: 2, bonus: 3 };
  semanas.forEach((s) => s.itens.sort((a, b) => b.adiado - a.adiado || ordem[a.tipo] - ordem[b.tipo]
    || Number(a.semana) - Number(b.semana)));

  let terminoAulas = seg0;
  semanas.forEach((s) => { if (s.itens.some((x) => x.tipo === "aula")) terminoAulas = addDays(s.seg, 6); });

  return { semanas, aulas: fAulas.concat(adiada.filter((a) => a.tipo === "aula")), terminoAulas,
    atrasadas: [...fQuest, ...fRev].filter((r) => r.atraso > 0).length,
    totalAdiadas: adiada.length };
}

/* ============================================================
   SINCRONIZAÇÃO — Firebase (Firestore com cache offline)
   O app funciona sempre no aparelho. Com o Firebase configurado e
   login feito, cada alteração é enviada só como diferença (campo a
   campo), o que evita que um aparelho apague o que o outro marcou.
   ============================================================ */
const FB_VER = "10.14.1";
const FB_URL = (m) => `https://www.gstatic.com/firebasejs/${FB_VER}/firebase-${m}.js`;

// estado persistido -> formato da nuvem
function paraNuvem(st) {
  const blocos = {};
  st.blocos.forEach((b) => { blocos[b.id] = { etapa: b.etapa, dataAula: b.dataAula || null, dataUltima: b.dataUltima || null, hist: b.hist || {} }; });
  const bonus = {};
  st.bonus.forEach((x) => { bonus[x.id] = !!x.feito; });
  return { cfg: st.cfg, blocos, bonus, registro: st.registro, adiados: st.adiados, excluidos: st.excluidos,
    anki: st.anki || {}, bonusAdiado: st.bonusAdiado || {} };
}
// formato da nuvem -> estado do app (dados fixos vêm do código)
function daNuvem(d) {
  const cfg = { ...DEFAULT_CFG, ...(d.cfg || {}) };
  const rb = d.blocos || {};
  const blocos = CRONO.map(([semana, area, tema, tier], i) => {
    const id = "b" + i, r = rb[id] || {};
    return { id, semana, area, tema, tier, etapa: r.etapa ?? 0, dataAula: r.dataAula ?? null, dataUltima: r.dataUltima ?? null, hist: r.hist || {} };
  });
  const rx = d.bonus || {};
  const bonus = seedBonus().map((x) => ({ ...x, feito: !!rx[x.id] }));
  const registro = {};
  Object.entries(d.registro || {}).forEach(([k, r]) => {
    registro[k] = { planejados: r.planejados || [], feitos: r.feitos || [], fechada: !!r.fechada, auto: r.auto || {}, manual: r.manual || {} };
  });
  return { cfg, blocos, bonus, registro, adiados: d.adiados || {}, excluidos: d.excluidos || {},
    anki: d.anki || {}, bonusAdiado: d.bonusAdiado || {} };
}
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// diferença entre dois estados em formato de nuvem -> patch para setDoc(merge)
function diferenca(ant, nov, F) {
  const p = {}; let n = 0;
  const put = (k, sub, v) => { (p[k] ||= {})[sub] = v; n++; };
  Object.keys({ ...ant.cfg, ...nov.cfg }).forEach((k) => {
    if (!igual(ant.cfg[k], nov.cfg[k])) put("cfg", k, nov.cfg[k] === undefined ? F.deleteField() : nov.cfg[k]);
  });
  Object.keys(nov.blocos).forEach((id) => { if (!igual(ant.blocos[id], nov.blocos[id])) put("blocos", id, nov.blocos[id]); });
  Object.keys(nov.bonus).forEach((id) => { if (ant.bonus[id] !== nov.bonus[id]) put("bonus", id, nov.bonus[id]); });
  Object.keys({ ...ant.adiados, ...nov.adiados }).forEach((id) => {
    if (ant.adiados[id] !== nov.adiados[id]) put("adiados", id, nov.adiados[id] === undefined ? F.deleteField() : nov.adiados[id]);
  });
  Object.keys(nov.anki || {}).forEach((id) => { if (!igual((ant.anki || {})[id], nov.anki[id])) put("anki", id, nov.anki[id]); });
  Object.keys({ ...(ant.bonusAdiado || {}), ...(nov.bonusAdiado || {}) }).forEach((id) => {
    const va = (ant.bonusAdiado || {})[id], vb = (nov.bonusAdiado || {})[id];
    if (va !== vb) put("bonusAdiado", id, vb === undefined ? F.deleteField() : vb);
  });
  Object.keys(nov.excluidos).forEach((k) => {
    const a = ant.excluidos[k] || [], b = nov.excluidos[k] || [];
    const add = b.filter((x) => !a.includes(x));
    if (add.length) put("excluidos", k, F.arrayUnion(...add));
  });
  Object.keys(nov.registro).forEach((k) => {
    const a = ant.registro[k], b = nov.registro[k], r = {};
    const mapas = (x, y) => {           // auto e manual: mapas id → valor, gravados campo a campo
      ["auto", "manual"].forEach((m) => {
        const va = (x && x[m]) || {}, vb = y[m] || {}, sub = {};
        Object.keys({ ...va, ...vb }).forEach((id) => { if (va[id] !== vb[id]) sub[id] = vb[id] === undefined ? F.deleteField() : vb[id]; });
        if (Object.keys(sub).length) r[m] = sub;
      });
    };
    if (!a) {
      r.planejados = b.planejados; r.fechada = b.fechada;
      if (b.feitos.length) r.feitos = F.arrayUnion(...b.feitos);
      mapas(null, b);
    } else {
      mapas(a, b);
      if (!igual(a.planejados, b.planejados)) r.planejados = b.planejados;
      if (a.fechada !== b.fechada) r.fechada = b.fechada;
      const add = b.feitos.filter((x) => !a.feitos.includes(x));
      const rem = a.feitos.filter((x) => !b.feitos.includes(x));
      if (add.length && rem.length) r.feitos = b.feitos;
      else if (add.length) r.feitos = F.arrayUnion(...add);
      else if (rem.length) r.feitos = F.arrayRemove(...rem);
    }
    if (Object.keys(r).length) put("registro", k, r);
  });
  return n ? p : null;
}
const VAZIO_NUVEM = { cfg: {}, blocos: {}, bonus: {}, registro: {}, adiados: {}, excluidos: {}, anki: {}, bonusAdiado: {} };

const Sync = {
  status: "local", user: null, erro: "", pendente: false,
  _ouvintes: new Set(), _fb: null, _db: null, _auth: null, _unsub: null, _ref: null,
  _ultimo: null, _aoReceber: null, _obterLocal: null,
  on(fn) { this._ouvintes.add(fn); return () => this._ouvintes.delete(fn); },
  _emit() { const s = { status: this.status, user: this.user, erro: this.erro, pendente: this.pendente };
    this._ouvintes.forEach((f) => f(s)); },
  _set(o) { Object.assign(this, o); this._emit(); },

  async iniciar({ aoReceber, obterLocal }) {
    this._aoReceber = aoReceber; this._obterLocal = obterLocal;
    const conf = window.FIREBASE_CONFIG;
    if (!conf || !conf.apiKey) { this._set({ status: "local" }); return; }
    this._set({ status: "conectando" });
    try {
      const [app, auth, fs] = await Promise.all([import(FB_URL("app")), import(FB_URL("auth")), import(FB_URL("firestore"))]);
      this._fb = { ...app, ...auth, ...fs };
      const fbApp = app.initializeApp(conf);
      this._db = fs.initializeFirestore(fbApp, {
        localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) });
      this._auth = auth.getAuth(fbApp);
      auth.onAuthStateChanged(this._auth, (u) => this._aoLogar(u));
    } catch (e) {
      this._set({ status: "indisponivel", erro: "Não foi possível carregar o Firebase. Abra o app uma vez com internet." });
    }
  },

  _aoLogar(u) {
    if (this._unsub) { this._unsub(); this._unsub = null; }
    if (!u) { this._set({ user: null, status: "deslogado" }); return; }
    const F = this._fb;
    this._ref = F.doc(this._db, "usuarios", u.uid, "estado", "app");
    this._set({ user: { uid: u.uid, email: u.email || "", nome: u.displayName || "" }, status: "sincronizando" });
    const chaveVinculo = "estudos:vinculo";
    this._unsub = F.onSnapshot(this._ref, { includeMetadataChanges: true }, async (snap) => {
      const pend = snap.metadata.hasPendingWrites;
      const st = () => this._set({ pendente: pend,
        status: !navigator.onLine ? "offline" : pend ? "enviando" : snap.metadata.fromCache ? "sincronizando" : "sincronizado" });
      if (!snap.exists()) {
        if (snap.metadata.fromCache) { st(); return; }          // ainda não sabemos se existe na nuvem
        // primeira vez nesta conta: envia o estado deste aparelho
        const local = paraNuvem(this._obterLocal());
        this._ultimo = local; lsSet(chaveVinculo, u.uid);
        await F.setDoc(this._ref, { ...diferenca(VAZIO_NUVEM, local, F), atualizadoEm: Date.now() }, { merge: true });
        return;
      }
      if (lsGet(chaveVinculo) !== u.uid) {
        // aparelho entrando numa conta que já tem dados
        if (snap.metadata.fromCache) { st(); return; }
        const local = paraNuvem(this._obterLocal());
        const remoto = paraNuvem(daNuvem(snap.data()));
        lsSet(chaveVinculo, u.uid);
        if (!igual(local, remoto) && !window.confirm(
          "Esta conta já tem progresso salvo na nuvem.\n\nOK: usar o progresso da nuvem neste aparelho.\n" +
          "Cancelar: substituir a nuvem pelo progresso deste aparelho.")) {
          this._ultimo = local;
          const p = diferenca(remoto, local, F);
          if (p) await F.setDoc(this._ref, { ...p, atualizadoEm: Date.now() }, { merge: true });
          return;
        }
      }
      const est = daNuvem(snap.data());
      if (pend) {
        // eco das nossas próprias gravações ainda não confirmadas: não reaplica
        if (!this._ultimo) this._ultimo = paraNuvem(est);
        st(); return;
      }
      this._ultimo = paraNuvem(est);
      this._aoReceber(est);
      st();
    }, (e) => this._set({ status: "erro", erro: e.code || String(e) }));
  },

  enviar(estado) {
    if (!this._ref || !this._ultimo || !this.user) return;
    const nov = paraNuvem(estado);
    const p = diferenca(this._ultimo, nov, this._fb);
    this._ultimo = nov;
    if (!p) return;
    this._set({ pendente: true, status: navigator.onLine ? "enviando" : "offline" });
    this._fb.setDoc(this._ref, { ...p, atualizadoEm: Date.now() }, { merge: true })
      .catch((e) => this._set({ status: "erro", erro: e.code || String(e) }));
  },

  async entrarGoogle() {
    const F = this._fb; if (!F) return;
    try { await F.signInWithPopup(this._auth, new F.GoogleAuthProvider()); }
    catch (e) { this._set({ erro: traduzErro(e) }); }
  },
  async entrarEmail(email, senha, criar) {
    const F = this._fb; if (!F) return;
    try {
      if (criar) await F.createUserWithEmailAndPassword(this._auth, email, senha);
      else await F.signInWithEmailAndPassword(this._auth, email, senha);
    } catch (e) { this._set({ erro: traduzErro(e) }); }
  },
  async sair() { if (this._auth) { await this._fb.signOut(this._auth); lsSet("estudos:vinculo", ""); } },
};
function traduzErro(e) {
  const c = e && e.code || "";
  const m = {
    "auth/popup-blocked": "O navegador bloqueou a janela de login. Permita pop-ups ou use e-mail e senha.",
    "auth/popup-closed-by-user": "Janela de login fechada antes de concluir.",
    "auth/unauthorized-domain": "Este endereço não está autorizado no Firebase (Authentication → Configurações → Domínios autorizados).",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/user-not-found": "Conta não encontrada. Use \"Criar conta\".",
    "auth/email-already-in-use": "Já existe conta com este e-mail. Use \"Entrar\".",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/network-request-failed": "Sem conexão. O login precisa de internet uma única vez.",
    "auth/operation-not-allowed": "Este método de login não está ativado no Firebase.",
  };
  return m[c] || (c ? `Erro: ${c}` : "Erro desconhecido.");
}
function useSync() {
  const [s, setS] = useState({ status: Sync.status, user: Sync.user, erro: Sync.erro, pendente: Sync.pendente });
  useEffect(() => Sync.on(setS), []);
  useEffect(() => {
    const f = () => Sync._set({ status: Sync.user ? (navigator.onLine ? (Sync.pendente ? "enviando" : "sincronizado") : "offline") : Sync.status });
    window.addEventListener("online", f); window.addEventListener("offline", f);
    return () => { window.removeEventListener("online", f); window.removeEventListener("offline", f); };
  }, []);
  return s;
}

/* ============================================================
   ANKI — leitura pelo AnkiConnect (Anki de computador aberto)
   A associação tema → baralhos e a última leitura sincronizam pelo
   Firebase; a leitura em si só acontece no aparelho que tem o Anki.
   ============================================================ */
const ANKI_LOCAL = "estudos:anki-local";
const ankiLocal = () => { try { return { ativo: false, url: "http://127.0.0.1:8765", baralhos: [], ...JSON.parse(lsGet(ANKI_LOCAL) || "{}") }; } catch { return { ativo: false, url: "http://127.0.0.1:8765", baralhos: [] }; } };
const salvarAnkiLocal = (o) => lsSet(ANKI_LOCAL, JSON.stringify(o));

const Anki = {
  async chamar(url, action, params = {}) {
    let r;
    try {
      // corpo como texto simples: evita a requisição prévia de CORS
      r = await fetch(url, { method: "POST", body: JSON.stringify({ action, version: 6, params }) });
    } catch {
      throw new Error("Anki não encontrado. Abra o Anki no computador e confira o AnkiConnect (veja o LEIA-ME).");
    }
    const j = await r.json();
    if (j.error) throw new Error("AnkiConnect: " + j.error);
    return j.result;
  },
  async baralhos(url) {
    const nomes = await this.chamar(url, "deckNames");
    // só baralhos-folha (sem subbaralhos), que correspondem aos tópicos
    return nomes.filter((n) => n !== "Default" && !nomes.some((m) => m.startsWith(n + "::"))).sort();
  },
  async ler(url, mapa, diasSemana) {
    const ids = Object.keys(mapa).filter((k) => (mapa[k] || []).length);
    if (!ids.length) return {};
    const esc = (d) => d.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const acoes = [];
    ids.forEach((id) => {
      const q = "(" + mapa[id].map((d) => `deck:"${esc(d)}"`).join(" OR ") + ")";
      acoes.push({ action: "findCards", params: { query: q } });
      acoes.push({ action: "findCards", params: { query: q + " is:due" } });
      acoes.push({ action: "findCards", params: { query: q + " rated:" + diasSemana } });
    });
    const res = await this.chamar(url, "multi", { actions: acoes });
    const val = (x) => (Array.isArray(x) ? x : x && Array.isArray(x.result) ? x.result : []);
    const agora = Date.now(), out = {};
    ids.forEach((id, i) => {
      out[id] = { total: val(res[3 * i]).length, pend: val(res[3 * i + 1]).length, rev: val(res[3 * i + 2]).length, em: agora };
    });
    return out;
  },
};

// associação automática por semelhança de nomes (tema do cronograma × nome do baralho)
// títulos completos do MEDPlanner, usados só para comparar com os nomes dos baralhos
const TITULO_ORIGINAL = {
  "Amenorreia e ovário policístico": "Amenorreia e Ovário Policístico",
  "Diagnóstico de gravidez e pré-natal": "Diagnóstico de Gravidez, Modificações do Organismo Materno e Pré-Natal",
  "Assistência ao parto e parto prematuro": "Assistência Clínica ao Parto e Parto Prematuro",
  "Saúde do trabalhador + ética médica": "Saúde do Trabalhador e Ética Médica",
  "Crescimento, desenvolvimento e puberdade": "Crescimento e Desenvolvimento Normais; Puberdade Normal",
  "Anemias II (hemolíticas, falciforme)": "Anemia II Anemias Hemolíticas Anemia Falciforme",
  "Pré-operatório, risco cirúrgico e complicações": "Preparo Pré-Operatório, Risco Cirúrgico e Complicações em Cirurgia",
  "Doenças cirúrgicas do intestino I": "Doenças Cirúrgicas do Intestino I Vascular e Obstrução",
  "Doenças cirúrgicas do intestino II": "Doenças Cirúrgicas do Intestino II Diverticulose, Polipose, Câncer e Apendicite",
  "Sangramentos na gravidez II e DHP": "Sangramentos na Gravidez II e Doença Hemolítica Perinatal",
  "Pancreatite e câncer de pâncreas": "Pancreatite Aguda e Crônica, Câncer de Pâncreas",
  "Hepatologia; hepatites virais": "Introdução à Hepatologia; Hepatites Virais",
  "Cirrose: complicações e hipertensão porta": "Cirrose e suas Complicações, Hipertensão Porta, Ascite, Encefalopatia",
  "Climatério, distopia e incontinência": "Climatério, Distopia e Incontinência Urinária",
  "Desnutrição e baixa estatura": "Distúrbios do Crescimento: Desnutrição e Baixa Estatura",
  "HAS e crise hipertensiva": "Hipertensão Arterial Sistêmica; Crise Hipertensiva",
  "Doença arterial coronariana: IAM e angina": "Doença Arterial Coronariana: IAM e Angina",
  "SUS I: histórico e legislação": "SUS I Evolução Histórica e Legislação",
  "SUS II: atenção básica e financiamento": "SUS II Atenção Básica e Financiamento",
  "Distúrbios hipertensivos da gestação, DM e gemelaridade": "Distúrbios Hipertensivos da Gestação, Diabetes e Gemelaridade",
  "Sofrimento fetal, fórcipe e puerpério": "Sofrimento Fetal, Avaliação da Vitalidade Fetal, Fórcipe e Puerpério",
  "AIDS": "AIDS HIV",
};
// matéria do baralho (nível acima do tópico) → grande área do cronograma; evita misturar áreas
const MATERIA_AREA = { ginecologia: "GO", obstetricia: "GO", pediatria: "PEDIATRIA", preventiva: "PREVENTIVA",
  cirurgia: "CIRURGIA", urologia: "CIRURGIA", ortopedia: "CIRURGIA", oftalmologia: "CIRURGIA",
  nefrologia: "CLÍNICA", reumatologia: "CLÍNICA", hematologia: "CLÍNICA", gastroenterologia: "CLÍNICA",
  cardiologia: "CLÍNICA", hepatologia: "CLÍNICA", endocrinologia: "CLÍNICA", pneumologia: "CLÍNICA",
  infectologia: "CLÍNICA", neurologia: "CLÍNICA", psiquiatria: "CLÍNICA", dermatologia: "CLÍNICA" };
const areaDoBaralho = (d) => {
  const partes = d.split("::").slice(0, -1).reverse();
  for (const p of partes) {
    const t = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().split(/\s+/)[0];
    if (MATERIA_AREA[t]) return MATERIA_AREA[t];
  }
  return null;
};
const GENERICAS = new Set(("de da do das dos e a o as os na no nas nos em com para por sua seu suas seus " +
  "doenca doencas sindrome sindromes disturbio disturbios parte introducao complicacoes causas tratamento " +
  "geral aula resumo normal normais agudo aguda cronico cronica suas").split(" "));
const SINONIMOS = { sop: "ovario policistico", tiroide: "tireoide", has: "hipertensao arterial sistemica",
  op: "operatorio", imunizacao: "vacinacao", sus: "sistema unico saude", iam: "infarto", gestacional: "gravidez",
  tep: "tromboembolismo pulmonar", dpoc: "dpoc", ist: "infeccoes sexualmente transmissiveis", pcr: "parada cardiorrespiratoria", base: "basico", disabsortivas: "diarreia cronica" };
const ROMANOS = new Set(["i", "ii", "iii", "iv", "v"]);
const tokens = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, " ").trim().split(" ")
  .flatMap((t) => (SINONIMOS[t] ? SINONIMOS[t].split(" ") : [t]))
  .filter((t) => t && !GENERICAS.has(t));
// mesma palavra, plural ou flexão próxima (ex.: mama/mamas, anticoncepção/anticoncepcionais)
const mesmo = (a, b) => {
  if (a === b) return true;
  if (a.length >= 7 && b.length >= 7) return a.slice(0, 7) === b.slice(0, 7);
  const [c, l] = a.length <= b.length ? [a, b] : [b, a];
  return c.length >= 4 && l.startsWith(c) && l.length - c.length <= 2;
};
// Pontuação = fração do nome do baralho coberta pela aula, com peso maior para palavras raras
// (palavras que aparecem em muitas aulas, como "clínica" ou "câncer", pesam pouco).
function associarAutomatico(blocos, baralhos) {
  const textos = blocos.map((b) => {
    const t = [...new Set([...tokens(b.tema), ...tokens(TITULO_ORIGINAL[b.tema] || "")])];
    return { b, romanos: t.filter((x) => ROMANOS.has(x)), pal: t.filter((x) => !ROMANOS.has(x)) };
  });
  const N = textos.length;
  // palavras raras pesam mais; palavras que não aparecem em nenhuma aula não ajudam a escolher e pesam o mínimo
  const peso = (u) => { const df = textos.filter((x) => x.pal.some((t) => mesmo(t, u))).length;
    return df === 0 ? 0.2 : Math.log(1 + N / df); };
  const mapa = {};
  baralhos.forEach((d) => {
    const B = tokens(d.split("::").pop());
    const rB = B.filter((t) => ROMANOS.has(t)), pal = [...new Set(B.filter((t) => !ROMANOS.has(t)))];
    if (!pal.length) return;
    const pesos = pal.map(peso), totalPeso = pesos.reduce((a, x) => a + x, 0);
    const area = areaDoBaralho(d);
    const notas = textos.map((x) => {
      if (area && x.b.area !== area) return [x.b, 0];
      if (rB.length && x.romanos.length && rB.join() !== x.romanos.join()) return [x.b, 0];
      const cob = pal.reduce((a, u, k) => a + (x.pal.some((t) => mesmo(t, u)) ? pesos[k] : 0), 0) / totalPeso;
      return [x.b, cob];
    });
    const max = Math.max(0, ...notas.map((x) => x[1]));
    if (max < 0.5) return;
    notas.filter((x) => x[1] >= max - 0.001).forEach(([b]) => { (mapa[b.id] ||= []); if (!mapa[b.id].includes(d)) mapa[b.id].push(d); });
  });
  return mapa;
}
const ehAndroid = () => /Android/i.test(navigator.userAgent || "");
const ABRIR_ANKIDROID = "intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.ichi2.anki;end";
const horaCurta = (ms) => new Date(ms).toLocaleString("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/* ============================================================
   ATUALIZAÇÃO — service worker + version.json
   ============================================================ */
const Atualizador = {
  reg: null, esperando: null, _ouvintes: new Set(),
  on(fn) { this._ouvintes.add(fn); return () => this._ouvintes.delete(fn); },
  _emit() { this._ouvintes.forEach((f) => f(!!this.esperando)); },
  async registrar() {
    if (!("serviceWorker" in navigator)) return;
    try {
      this.reg = await navigator.serviceWorker.register("./sw.js");
      const vigiar = (w) => w && w.addEventListener("statechange", () => {
        if (w.state === "installed" && navigator.serviceWorker.controller) { this.esperando = w; this._emit(); }
      });
      if (this.reg.waiting && navigator.serviceWorker.controller) { this.esperando = this.reg.waiting; this._emit(); }
      this.reg.addEventListener("updatefound", () => vigiar(this.reg.installing));
      let recarregou = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => { if (!recarregou) { recarregou = true; location.reload(); } });
      setInterval(() => this.reg && this.reg.update().catch(() => {}), 60 * 60 * 1000);
    } catch {}
  },
  aplicar() { if (this.esperando) this.esperando.postMessage("PULAR_ESPERA"); },
  async verificar() {
    let remota = null;
    try { remota = await (await fetch("./version.json?t=" + Date.now(), { cache: "no-store" })).json(); } catch {}
    try { if (this.reg) await this.reg.update(); } catch {}
    return remota;
  },
};
function useAtualizacao() {
  const [tem, setTem] = useState(!!Atualizador.esperando);
  useEffect(() => Atualizador.on(setTem), []);
  return tem;
}

/* ============================================================ */
function App() {
  const [pronto, setPronto] = useState(false);
  const [blocos, setBlocos] = useState([]);
  const [bonus, setBonus] = useState([]);
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [registro, setRegistro] = useState({});
  const [adiados, setAdiados] = useState({});
  const [excluidos, setExcluidos] = useState({});
  const [anki, setAnki] = useState({});
  const [bonusAdiado, setBonusAdiado] = useState({});
  const [aba, setAba] = useState("semana");
  const hoje = hojeISO();
  const segAtual = sabado(hoje);

  const sync = useSync();
  const temAtualizacao = useAtualizacao();
  const atual = useRef(null);
  atual.current = { blocos, bonus, cfg, registro, adiados, excluidos, anki, bonusAdiado };

  const aplicarEstado = useCallback((d) => {
    setCfg(d.cfg); setBlocos(d.blocos); setBonus(d.bonus);
    setRegistro(d.registro); setAdiados(d.adiados); setExcluidos(d.excluidos); setAnki(d.anki || {});
    setBonusAdiado(d.bonusAdiado || {});
  }, []);

  useEffect(() => {
    (async () => {
      const d = await load(KEY, null);
      const c = { ...DEFAULT_CFG, ...(d?.cfg || {}) };
      setCfg(c);
      setBlocos(d?.blocos?.length ? d.blocos : seed(c, hoje));
      setBonus(d?.bonus?.length ? d.bonus : seedBonus());
      setRegistro(d?.registro || {}); setAdiados(d?.adiados || {}); setExcluidos(d?.excluidos || {}); setAnki(d?.anki || {}); setBonusAdiado(d?.bonusAdiado || {});
      setPronto(true);
    })();
    Atualizador.registrar();
  }, []);
  useEffect(() => {
    if (!pronto) return;
    Sync.iniciar({ aoReceber: aplicarEstado, obterLocal: () => atual.current });
  }, [pronto]);
  useEffect(() => {
    if (!pronto) return;
    const est = { blocos, bonus, cfg, registro, adiados, excluidos, anki, bonusAdiado };
    save(KEY, est);
    Sync.enviar(est);
  }, [blocos, bonus, cfg, registro, adiados, excluidos, anki, bonusAdiado, pronto]);

  useEffect(() => {
    if (!pronto) return;
    const abertas = Object.keys(registro).filter((k) => k < segAtual && !registro[k].fechada);
    if (!abertas.length) return;
    const nAd = { ...adiados }, nReg = { ...registro };
    abertas.forEach((k) => {
      registro[k].planejados.forEach((p) => { if (!registro[k].feitos.includes(p.id)) nAd[p.id] = (nAd[p.id] || 0) + 1; });
      nReg[k] = { ...registro[k], fechada: true };
    });
    setAdiados(nAd); setRegistro(nReg);
  }, [pronto, segAtual, registro, adiados]);

  const fora = useMemo(() => new Set(excluidos[segAtual] || []), [excluidos, segAtual]);
  const plano = useMemo(() => construir(blocos, bonus, cfg, hoje, adiados, fora, bonusAdiado),
    [blocos, bonus, cfg, hoje, adiados, fora, bonusAdiado]);
  const sem0 = plano.semanas[0];

  useEffect(() => {
    if (!pronto || !sem0 || registro[segAtual]) return;
    setRegistro((r) => ({ ...r, [segAtual]: {
      planejados: sem0.itens.map((i) => ({ id: i.id, tipo: i.tipo, tema: i.tema, rotulo: i.rotulo, peso: i.peso, semana: i.semana })),
      feitos: [], fechada: false } }));
  }, [pronto, segAtual, sem0, registro]);

  // origem: "manual" (toque do usuário) ou "auto" (leitura do Anki)
  const concluir = useCallback((item, origem = "manual") => {
    setRegistro((r) => {
      const s = r[segAtual] || { planejados: [], feitos: [], fechada: false };
      const auto = { ...(s.auto || {}) }, manual = { ...(s.manual || {}) };
      if (item.tipo === "revisao") {
        if (origem === "auto") { auto[item.id] = Date.now(); delete manual[item.id]; }
        else { manual[item.id] = { v: true }; delete auto[item.id]; }
      }
      if (s.feitos.includes(item.id)) return { ...r, [segAtual]: { ...s, auto, manual } };
      // marcar também degraus anteriores da mesma aula que estejam no checklist
      const antes = item.blocoId ? s.planejados
        .filter((p) => String(p.id).startsWith(item.blocoId + ":")
          && Number(String(p.id).split(":")[1]) < item.etapaItem && !s.feitos.includes(p.id))
        .map((p) => p.id) : [];
      return { ...r, [segAtual]: { ...s, auto, manual, feitos: [...s.feitos, ...antes, item.id] } };
    });
    setAdiados((a) => { if (!a[item.id]) return a; const n = { ...a }; delete n[item.id]; return n; });
    if (item.tipo === "bonus") setBonus((bs) => bs.map((x) => x.id === item.id ? { ...x, feito: true } : x));
    else setBlocos((bs) => bs.map((b) => (b.id === item.blocoId ? avancarBloco(b, item.etapaItem, hoje) : b)));
  }, [segAtual, hoje]);

  // modo: "pendencia" devolve ao checklist da semana; "remover" tira a meta desta semana
  const desfazer = useCallback((entrada, modo, origem = "manual") => {
    setRegistro((r) => {
      const s = r[segAtual]; if (!s) return r;
      const feitos = s.feitos.filter((x) => x !== entrada.id);
      const planejados = modo === "remover" ? s.planejados.filter((p) => p.id !== entrada.id) : s.planejados;
      const auto = { ...(s.auto || {}) }, manual = { ...(s.manual || {}) };
      delete auto[entrada.id];
      if (entrada.tipo === "revisao") {
        // desmarcação manual vale até haver revisão nova no Anki daquele baralho
        const st = (atual.current.anki || {})[String(entrada.id).split(":")[0]];
        if (origem === "manual") manual[entrada.id] = { v: false, rev: st ? st.rev : 0 }; else delete manual[entrada.id];
      }
      return { ...r, [segAtual]: { ...s, feitos, planejados, auto, manual } };
    });
    if (modo === "remover") setExcluidos((e) => ({ ...e, [segAtual]: [...(e[segAtual] || []), entrada.id] }));
    if (entrada.tipo === "bonus") setBonus((bs) => bs.map((x) => x.id === entrada.id ? { ...x, feito: false } : x));
    else {
      const [blocoId, e] = String(entrada.id).split(":");
      const et = Number(e);
      setBlocos((bs) => bs.map((b) => (b.id === blocoId ? voltarBloco(b, et) : b)));
    }
  }, [segAtual]);

  const recuar = useCallback((id) => setBlocos((bs) => bs.map((b) => b.id === id ? voltarBloco(b, Math.max(0, b.etapa - 1)) : b)), []);
  const avancar = useCallback((id) => setBlocos((bs) => bs.map((b) => b.id === id && b.etapa < CONCLUIDO ? avancarBloco(b, b.etapa, hojeISO()) : b)), []);

  // A semana do extensivo avança junto com o calendário, sem precisar editar nada.
  useEffect(() => {
    if (!pronto || !cfg.semanaBaseSeg) return;
    const passos = Math.floor(diffDays(cfg.semanaBaseSeg, segAtual) / 7);
    if (passos <= 0) return;
    const nova = semanaDepoisDe(cfg.semanaAtual, passos);
    setCfg((c) => ({ ...c, semanaAtual: nova, semanaBaseSeg: segAtual }));
  }, [pronto, segAtual, cfg.semanaAtual, cfg.semanaBaseSeg]);

  // Troca das aulas bônus da semana: as escolhidas saem para o fim da fila e entram
  // outras, do mesmo nível de estrelas enquanto houver.
  const trocarBonus = useCallback((ids) => {
    if (!ids.length) { marcarPerguntado(); return; }
    const volta = addDays(segAtual, 7 * Math.max(1, cfg.semanasAdiamentoBonus));
    setBonusAdiado((b) => { const n = { ...b }; ids.forEach((id) => { n[id] = volta; }); return n; });
    setExcluidos((e) => ({ ...e, [segAtual]: [...new Set([...(e[segAtual] || []), ...ids])] }));
    setRegistro((r) => {
      const s = r[segAtual]; if (!s) return r;
      return { ...r, [segAtual]: { ...s, bonusPerguntado: true,
        planejados: s.planejados.filter((p) => !ids.includes(p.id)),
        feitos: s.feitos.filter((x) => !ids.includes(x)) } };
    });
  }, [segAtual, cfg.semanasAdiamentoBonus]);

  const marcarPerguntado = useCallback(() => setRegistro((r) => {
    const s = r[segAtual]; if (!s || s.bonusPerguntado) return r;
    return { ...r, [segAtual]: { ...s, bonusPerguntado: true } };
  }), [segAtual]);

  // depois de uma troca, as substitutas entram no checklist desta semana
  useEffect(() => {
    if (!pronto || !sem0) return;
    const s = registro[segAtual]; if (!s) return;
    const atuais = new Set(s.planejados.map((p) => p.id));
    const novas = sem0.itens.filter((i) => !atuais.has(i.id))
      .map((i) => ({ id: i.id, tipo: i.tipo, tema: i.tema, rotulo: i.rotulo, peso: i.peso, semana: i.semana }));
    if (!novas.length) return;
    setRegistro((r) => ({ ...r, [segAtual]: { ...r[segAtual], planejados: [...r[segAtual].planejados, ...novas] } }));
  }, [pronto, sem0, registro, segAtual]);

  // leitura do Anki (só no aparelho em que ela foi ativada)
  const [ankiMsg, setAnkiMsg] = useState("");
  const lerAnki = useCallback(async () => {
    const loc = ankiLocal();
    if (!loc.ativo) return false;
    const mapa = atual.current.cfg.ankiMapa || {};
    if (!Object.keys(mapa).some((k) => (mapa[k] || []).length)) { setAnkiMsg("Nenhum baralho associado ainda."); return false; }
    try {
      const dias = Math.min(365, diffDays(sabado(hojeISO()), hojeISO()) + 1);
      const r = await Anki.ler(loc.url, mapa, dias);
      setAnki((a) => ({ ...a, ...r }));
      setAnkiMsg("Última leitura do Anki: " + horaCurta(Date.now()) + ".");
      return true;
    } catch (e) { setAnkiMsg(e.message); return false; }
  }, []);
  useEffect(() => {
    if (!pronto) return;
    lerAnki();
    const t = setInterval(() => { if (document.visibilityState === "visible") lerAnki(); }, 5 * 60 * 1000);
    const v = () => { if (document.visibilityState === "visible") lerAnki(); };
    document.addEventListener("visibilitychange", v);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", v); };
  }, [pronto, lerAnki]);

  // Mantém as revisões de flashcards de acordo com o Anki, nos dois sentidos:
  //  - marca quando o baralho zerou e houve revisão desde sábado;
  //  - desmarca (volta às pendências) se uma leitura posterior mostrar cartões vencidos de novo.
  // O que você marcou ou desmarcou à mão nesta semana prevalece sobre a leitura automática.
  const jaFeito = useRef(new Set());
  useEffect(() => {
    if (!pronto || !cfg.ankiAuto || !sem0) return;
    const s = registro[segAtual]; if (!s) return;
    const inicio = parse(segAtual).getTime();
    const feitosSem = new Set(s.feitos || []), auto = s.auto || {}, manual = s.manual || {};
    sem0.itens.forEach((it) => {
      if (it.tipo !== "revisao" || feitosSem.has(it.id)) return;
      const st = anki[it.blocoId], chave = it.id + ":m:" + (st && st.em), m = manual[it.id];
      if (!st || jaFeito.current.has(chave)) return;
      if (m && m.v === false && !(st.rev > (m.rev || 0))) return;   // desmarcado à mão e sem revisão nova
      if (st.em >= inicio && st.total > 0 && st.pend === 0 && st.rev > 0) { jaFeito.current.add(chave); concluir(it, "auto"); }
    });
    s.planejados.forEach((p) => {
      if (p.tipo !== "revisao" || !feitosSem.has(p.id) || !auto[p.id] || (manual[p.id] && manual[p.id].v === true)) return;
      const st = anki[String(p.id).split(":")[0]], chave = p.id + ":d:" + (st && st.em);
      if (!st || jaFeito.current.has(chave)) return;
      if (st.em > auto[p.id] && st.pend > 0) { jaFeito.current.add(chave); desfazer(p, "pendencia", "auto"); }
    });
  }, [pronto, anki, sem0, registro, segAtual, cfg.ankiAuto, concluir, desfazer]);

  if (!pronto) return <div style={{ padding: 24, fontFamily: SANS, color: C.ink2 }}>Carregando…</div>;

  const abas = [["semana", "Semana"], ["plano", "Plano"], ["bonus", "Bônus"], ["mapa", "Mapa"], ["dados", "Dados"]];

  return (
    <div style={{ fontFamily: SANS, background: C.base, color: C.ink, minHeight: "100vh" }}>
      {temAtualizacao && (
        <div style={{ background: C.tealSoft, borderBottom: `1px solid ${C.teal}`, padding: "10px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 13, color: C.ink }}>Nova versão disponível.</span>
          <button onClick={() => Atualizador.aplicar()} style={{ background: C.teal, color: C.base, border: "none",
            padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>Atualizar</button>
        </div>
      )}
      <Cabecalho plano={plano} cfg={cfg} blocos={blocos} hoje={hoje} registro={registro} segAtual={segAtual} sync={sync} />
      <div style={{ padding: "0 14px 96px" }}>
        {aba === "semana" && <Semana plano={plano} cfg={cfg} registro={registro} segAtual={segAtual} concluir={concluir}
          desfazer={desfazer} anki={anki} trocarBonus={trocarBonus} manterBonus={marcarPerguntado} bonusAdiado={bonusAdiado} />}
        {aba === "plano" && <PlanoSemanal plano={plano} segAtual={segAtual} cfg={cfg} />}
        {aba === "bonus" && <Bonus bonus={bonus} cfg={cfg} setCfg={setCfg}
          toggle={(id) => setBonus((bs) => bs.map((x) => x.id === id ? { ...x, feito: !x.feito } : x))} />}
        {aba === "mapa" && <Mapa blocos={blocos} recuar={recuar} avancar={avancar} cfg={cfg} adiados={adiados} />}
        {aba === "dados" && <Dados cfg={cfg} setCfg={setCfg} blocos={blocos} setBlocos={setBlocos} bonus={bonus}
          setBonus={setBonus} registro={registro} setRegistro={setRegistro} adiados={adiados} setAdiados={setAdiados}
          setExcluidos={setExcluidos} excluidos={excluidos} plano={plano} hoje={hoje} sync={sync}
          anki={anki} setAnki={setAnki} lerAnki={lerAnki} ankiMsg={ankiMsg} />}
      </div>
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", background: C.surface, borderTop: `1px solid ${C.line}`, zIndex: 20 }}>
        {abas.map(([k, l]) => (
          <button key={k} onClick={() => setAba(k)} style={{
            flex: 1, padding: "12px 2px 16px", border: "none", background: "none", fontFamily: SANS, fontSize: 11.5,
            cursor: "pointer", color: aba === k ? C.teal : C.ink2, fontWeight: aba === k ? 650 : 450,
            borderTop: aba === k ? `2px solid ${C.teal}` : "2px solid transparent", marginTop: -1 }}>{l}</button>
        ))}
      </nav>
    </div>
  );
}

/* ---------- CABEÇALHO ---------- */
function Anel({ pct, tamanho = 84, traco = 7, rotulo }) {
  const r = (tamanho - traco) / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={tamanho} height={tamanho} style={{ display: "block", margin: "0 auto" }}>
      <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" stroke="#33414D" strokeWidth={traco} />
      <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" stroke={C.tealClaro} strokeWidth={traco}
        strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`} />
      <text x="50%" y="47%" textAnchor="middle" dy="0.1em" fill={C.ink} fontSize="21" fontFamily={SERIF}>{rotulo}</text>
      <text x="50%" y="68%" textAnchor="middle" fill={C.ink2} fontSize="9.5" fontFamily={SANS}
        letterSpacing="0.08em">PONTOS</text>
    </svg>
  );
}

function temasDaSemana(blocos, n) {
  return blocos.filter((b) => Number(b.semana) === n).map((b) => b.tema);
}
function proximaSemanaNum(blocos, n) {
  const ns = [...new Set(blocos.map((b) => Number(b.semana)))].sort((a, b) => a - b);
  return ns.find((x) => x > n) || null;
}

const ROTULO_SYNC = {
  local: ["neste aparelho", C.ink2], conectando: ["conectando…", C.ink2], deslogado: ["neste aparelho · sem login", C.ink2],
  sincronizando: ["sincronizando…", C.ink2], sincronizado: ["sincronizado", C.tealClaro],
  enviando: ["enviando alterações…", C.amber], offline: ["offline · salvo no aparelho", C.amber],
  indisponivel: ["neste aparelho · Firebase indisponível", C.amber], erro: ["erro de sincronização", C.red],
};
function Cabecalho({ plano, cfg, blocos, hoje, registro, segAtual, sync }) {
  const s = registro[segAtual] || { planejados: [], feitos: [] };
  const total = s.planejados.reduce((a, p) => a + (p.peso || 0), 0);
  const feitos = s.planejados.filter((p) => s.feitos.includes(p.id)).reduce((a, p) => a + (p.peso || 0), 0);
  const pct = total ? feitos / total : 0;
  const prox = proximaSemanaNum(blocos, cfg.semanaAtual);
  const linha = (t) => t.join(" · ");

  return (
    <header style={{ background: C.noite, padding: "18px 16px 16px", textAlign: "center" }}>
      <h1 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 400, margin: 0, lineHeight: 1.15,
        letterSpacing: "-0.01em", color: C.ink }}>
        Planejamento de Estudos
      </h1>

      <div style={{ fontSize: 15, marginTop: 10, color: C.tealClaro, fontWeight: 600, letterSpacing: "0.02em" }}>
        Semana {cfg.semanaAtual}
      </div>
      <div style={{ fontSize: 11.5, color: C.ink2, marginTop: 3 }}>{rotuloSemana(segAtual)}</div>
      {sync && (() => { const [t, cor] = ROTULO_SYNC[sync.status] || ROTULO_SYNC.local; return (
        <div style={{ fontSize: 10.5, color: cor, marginTop: 5, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: cor, display: "inline-block" }} />{t}
        </div>); })()}

      <div style={{ marginTop: 14 }}>
        <Anel pct={pct} rotulo={`${feitos}/${total}`} />
      </div>

      <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>{linha(temasDaSemana(blocos, cfg.semanaAtual))}</div>
        {prox && (
          <div style={{ fontSize: 12, color: C.ink2, marginTop: 7, lineHeight: 1.4 }}>
            <span style={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: 10 }}>Próxima · semana {prox}</span>
            <br />{linha(temasDaSemana(blocos, prox))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 1, marginTop: 14, background: C.line }}>
        <Caixa valor={diffDays(hoje, cfg.dataProva)} rot="dias até a prova" />
        <Caixa valor={plano.aulas.length} rot="aulas restantes" />
        <Caixa valor={plano.atrasadas} rot="revisões vencidas" />
      </div>
    </header>
  );
}
function Caixa({ valor, rot }) {
  return (<div style={{ flex: 1, background: C.noite, padding: "9px 2px 8px" }}>
    <div style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1 }}>{valor}</div>
    <div style={{ fontSize: 10, color: C.ink2, marginTop: 4, lineHeight: 1.2 }}>{rot}</div>
  </div>);
}

/* ---------- SEMANA: quatro checklists ---------- */
function TrocaBonus({ itens, aberto, setAberto, trocar, manter, perguntado }) {
  const [sel, setSel] = useState(() => new Set(itens.map((i) => i.id)));
  useEffect(() => { setSel(new Set(itens.map((i) => i.id))); }, [itens.map((i) => i.id).join()]);
  if (!itens.length) return null;
  const alterna = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const btn = { flex: 1, padding: "9px 8px", fontSize: 12.5, cursor: "pointer", fontFamily: SANS,
    border: `1px solid ${C.star}`, background: "transparent", color: C.star };

  if (!aberto) {
    return perguntado ? null : (
      <div style={{ background: C.surface, borderLeft: `3px solid ${C.star}`, padding: "12px 13px", marginTop: 14 }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.45 }}>Semana nova. Quer trocar as aulas bônus sugeridas?</div>
        <div style={{ fontSize: 12, color: C.ink2, marginTop: 6, lineHeight: 1.5 }}>
          As trocadas voltam para o fim da fila e entram outras do mesmo nível de estrelas.
        </div>
        <div style={{ display: "flex", gap: 7, marginTop: 11 }}>
          <button style={{ ...btn, background: C.star, color: C.base, border: "none" }} onClick={() => setAberto(true)}>Escolher</button>
          <button style={{ ...btn, borderColor: C.line, color: C.ink2 }} onClick={manter}>Manter estas</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: C.surface, borderLeft: `3px solid ${C.star}`, padding: "12px 13px", marginTop: 14 }}>
      <div style={{ fontSize: 13, marginBottom: 4 }}>Quais bônus trocar?</div>
      <div style={{ fontSize: 12, color: C.ink2, marginBottom: 9, lineHeight: 1.5 }}>
        Marcadas serão substituídas; as demais continuam na semana.
      </div>
      {itens.map((i) => (
        <label key={i.id} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "5px 0", cursor: "pointer" }}>
          <input type="checkbox" checked={sel.has(i.id)} onChange={() => alterna(i.id)}
            style={{ accentColor: C.star, width: 17, height: 17, marginTop: 2 }} />
          <span style={{ fontSize: 13.5, lineHeight: 1.35 }}>
            {i.tema}<span style={{ color: C.star }}> {"★".repeat(i.estrelas || 0)}</span>
            <span style={{ color: C.ink2, fontSize: 11.5 }}> · semana {i.semana}</span>
          </span>
        </label>))}
      <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
        <button style={{ ...btn, background: C.star, color: C.base, border: "none" }}
          onClick={() => { trocar([...sel]); setAberto(false); }}>
          Trocar {sel.size === itens.length ? "todas" : `(${sel.size})`}
        </button>
        <button style={{ ...btn, borderColor: C.line, color: C.ink2 }}
          onClick={() => { manter(); setAberto(false); }}>Cancelar</button>
      </div>
    </div>
  );
}

function Semana({ plano, cfg, registro, segAtual, concluir, desfazer, anki, trocarBonus, manterBonus, bonusAdiado }) {
  const [trocaAberta, setTrocaAberta] = useState(false);
  const s = registro[segAtual] || { planejados: [], feitos: [] };
  const feitos = new Set(s.feitos);
  const itens = (plano.semanas[0]?.itens || []).filter((i) => !feitos.has(i.id));
  const g = (f) => itens.filter(f);
  const grupos = [
    ["Metas redistribuídas", g((i) => i.adiado > 0), C.amber],
    ["Aulas da semana", g((i) => !i.adiado && i.tipo === "aula"), areaColor("CLÍNICA")],
    ["Questões das aulas", g((i) => !i.adiado && i.tipo === "questoes"), C.card],
    ["Revisões · flashcards", g((i) => !i.adiado && i.tipo === "revisao"), C.tealClaro],
    ["Aulas bônus", g((i) => !i.adiado && i.tipo === "bonus" && !i.baixa), C.star],
    ["Bônus de baixa prioridade", g((i) => !i.adiado && i.tipo === "bonus" && i.baixa), C.pend],
  ];
  const sem = plano.semanas[0];
  const feitoPts = s.planejados.filter((p) => feitos.has(p.id)).reduce((a, p) => a + (p.peso || 0), 0);

  return (
    <div>
      <Grafico registro={registro} segAtual={segAtual} plano={plano} />
      <TrocaBonus itens={itens.filter((i) => i.tipo === "bonus")} aberto={trocaAberta} setAberto={setTrocaAberta}
        trocar={trocarBonus} manter={manterBonus} perguntado={!!s.bonusPerguntado} />
      {sem && sem.pontos > sem.cap && (
        <div style={{ background: C.amberSoft, borderLeft: `3px solid ${C.amber}`, padding: "10px 12px",
          marginTop: 14, fontSize: 12.5, lineHeight: 1.5 }}>
          As aulas desta semana ocupam {sem.pontos} pontos, acima da capacidade de {sem.cap}. Elas têm prioridade e
          ficam na semana; o resto foi adiado. Se isso se repetir, aumente a capacidade em Dados.
        </div>
      )}
      <SecaoTitulo texto={`Checklist da semana · ${feitoPts} de ${sem ? sem.pontos : 0} pontos${
        sem && sem.fator < 1 ? ` · carga reduzida ${Math.round((1 - sem.fator) * 100)}%` : ""}`} />
      {itens.length === 0 && <Vazio texto="Semana zerada. Os objetivos da próxima aparecem no sábado." />}
      {grupos.map(([t, l, cor]) => l.length > 0 && (
        <div key={t} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "10px 0 7px" }}>
            <span style={{ fontSize: 11.5, color: cor, textTransform: "uppercase", letterSpacing: "0.04em" }}>{t}</span>
            <span style={{ fontSize: 11, color: C.ink2 }}>
              {t === "Aulas bônus" && !trocaAberta && s.bonusPerguntado && (
                <button onClick={() => setTrocaAberta(true)} style={{ border: "none", background: "none", color: C.star,
                  fontSize: 11, marginRight: 10, cursor: "pointer", padding: 0, textDecoration: "underline" }}>trocar</button>)}
              {t === "Revisões · flashcards" && ehAndroid() && (
                <a href={ABRIR_ANKIDROID} style={{ color: C.tealClaro, marginRight: 10, textDecoration: "none" }}>Abrir AnkiDroid</a>)}
              {l.length} · {l.reduce((a, i) => a + i.peso, 0)} pts
            </span>
          </div>
          {l.map((it) => <Item key={it.id} item={it} concluir={concluir} cfg={cfg} anki={anki} />)}
        </div>
      ))}
      {s.feitos.length > 0 && (<>
        <SecaoTitulo texto={`Concluídos nesta semana · ${s.feitos.length}`} />
        <div style={{ background: C.surface, padding: "8px 12px" }}>
          {s.planejados.filter((p) => feitos.has(p.id)).map((p) => (
            <Concluido key={p.id} p={p} desfazer={desfazer} peloAnki={!!(s.auto || {})[p.id]} />))}
        </div></>)}
    </div>
  );
}

function Concluido({ p, desfazer, peloAnki }) {
  const [aberto, setAberto] = useState(false);
  const opc = { flex: 1, padding: "7px 8px", fontSize: 12, cursor: "pointer", fontFamily: SANS,
    background: "transparent", border: `1px solid ${C.line}`, color: C.ink2, lineHeight: 1.3 };
  return (
    <div style={{ padding: "5px 0", borderBottom: aberto ? `1px solid ${C.line}` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setAberto(!aberto)} aria-label="Opções" title="Desfazer marcação"
          style={{ width: 21, height: 21, flexShrink: 0, cursor: "pointer",
            border: `1px solid ${aberto ? C.teal : C.line}`, background: "transparent", borderRadius: 4,
            color: aberto ? C.teal : C.ink2, fontSize: 12, lineHeight: 1, padding: 0 }}>✕</button>
        <span style={{ fontSize: 13, color: C.ink2, lineHeight: 1.4, textDecoration: "line-through", flex: 1 }}>
          {p.tema} <span style={{ color: C.ink2 }}>· {p.peso} pts</span>
        </span>
        {peloAnki && <span style={{ fontSize: 10.5, color: C.card, whiteSpace: "nowrap" }}>pelo Anki</span>}
      </div>
      {aberto && (
        <div style={{ display: "flex", gap: 7, margin: "8px 0 10px 31px" }}>
          <button style={opc} onClick={() => { desfazer(p, "pendencia"); setAberto(false); }}>
            Voltar às pendências<br /><span style={{ color: C.line }}>fica nesta semana</span>
          </button>
          <button style={opc} onClick={() => { desfazer(p, "remover"); setAberto(false); }}>
            Tirar da semana<br /><span style={{ color: C.line }}>reagenda para outra</span>
          </button>
        </div>
      )}
    </div>
  );
}

function LinhaAnki({ item, cfg, anki }) {
  const decks = (cfg.ankiMapa || {})[item.blocoId] || [];
  if (!decks.length) return null;
  const st = anki[item.blocoId];
  if (!st) return <div style={{ fontSize: 11.5, color: C.ink2, marginTop: 4 }}>Anki: aguardando leitura no computador</div>;
  const zerado = st.pend === 0;
  return (
    <div style={{ fontSize: 11.5, marginTop: 4, color: zerado ? C.tealClaro : C.card }}>
      Anki: {zerado ? "nenhum cartão pendente" : `${st.pend} cartões pendentes`}
      {st.rev > 0 && <span style={{ color: C.ink2 }}> · {st.rev} revisados na semana</span>}
      <span style={{ color: C.ink2 }}> · lido {horaCurta(st.em)}</span>
    </div>
  );
}

function Item({ item, concluir, cfg, anki }) {
  const cor = item.tipo === "bonus" ? (item.baixa ? C.pend : C.star)
    : item.tipo === "questoes" ? C.card : item.tipo === "revisao" ? C.tealClaro : areaColor(item.area);
  return (
    <div style={{ background: C.surface, borderLeft: `3px solid ${item.adiado > 0 ? C.amber : cor}`,
      marginBottom: 7, padding: "10px 12px", display: "flex", gap: 11, alignItems: "flex-start" }}>
      <button onClick={() => concluir(item)} aria-label="Concluir" style={{
        width: 23, height: 23, flexShrink: 0, marginTop: 1, cursor: "pointer", border: `1.5px solid ${cor}`,
        background: "transparent", borderRadius: 4, color: cor, fontSize: 13.5, lineHeight: 1, padding: 0 }}>✓</button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: cor, fontWeight: 600, marginBottom: 2 }}>
          Semana {item.semana} · {item.rotulo}
          {item.atraso > 0 && <span style={{ color: C.amber }}> · {item.atraso}d de atraso</span>}
          {item.atrasada && <span style={{ color: C.amber }}> · aula atrasada</span>}
        </div>
        <div style={{ fontSize: 14.5, lineHeight: 1.3 }}>{item.tema}</div>
        <div style={{ fontSize: 11.5, color: C.ink2, marginTop: 3 }}>
          {item.peso} pts
          {item.questoes > 0 && item.tipo !== "revisao" && ` · ${item.questoes} questões`}
          {item.tipo === "revisao" && item.questoes > 0 && ` · ${item.questoes} questões de apoio`}
          {item.adiado > 0 && <span style={{ color: item.adiado >= 3 ? C.red : C.amber }}> · adiada {item.adiado}×</span>}
        </div>
        {item.tipo === "revisao" && cfg && anki && <LinhaAnki item={item} cfg={cfg} anki={anki} />}
      </div>
    </div>
  );
}

/* ---------- GRÁFICO ---------- */
function Grafico({ registro, segAtual, plano }) {
  const pts = (arr) => arr.reduce((a, p) => a + (p.peso || 0), 0);
  const dados = [];
  Object.keys(registro).sort().forEach((k) => {
    const r = registro[k];
    dados.push({ k, total: pts(r.planejados), feitos: pts(r.planejados.filter((p) => r.feitos.includes(p.id))),
      atual: k === segAtual, previsto: false, fechada: !!r.fechada });
  });
  // semanas futuras já demarcadas até o fim do ano
  const fimAno = "2026-12-28";
  plano.semanas.slice(1).forEach((s) => {
    if (s.seg > fimAno) return;
    dados.push({ k: s.seg, total: s.pontos, feitos: 0, atual: false, previsto: true, fator: s.fator });
  });
  if (!dados.length) return null;

  const max = Math.max(...dados.map((d) => d.total), 1);
  const L = 15, H = 92, G = 5;
  const W = dados.length * (L + G);
  const totFeitos = dados.filter((d) => !d.previsto).reduce((a, d) => a + d.feitos, 0);
  const totFalta = dados.filter((d) => d.fechada).reduce((a, d) => a + d.total - d.feitos, 0);
  const totPend = dados.filter((d) => !d.previsto && !d.fechada).reduce((a, d) => a + d.total - d.feitos, 0);
  const totPrev = dados.filter((d) => d.previsto).reduce((a, d) => a + d.total, 0);

  return (
    <div style={{ background: C.surface, padding: "13px 13px 11px", marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 11 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Pontos por semana</span>
        <span style={{ fontSize: 11.5, color: C.ink2 }}>início de cada semana</span>
      </div>
      <svg width="100%" viewBox={`-14 0 ${W + 14} ${H + 34}`} style={{ display: "block" }}>
        {dados.map((d, i) => {
          const x = i * (L + G), hT = (d.total / max) * H, hF = (d.feitos / max) * H;
          return (<g key={d.k}>
            {d.previsto
              ? <rect x={x + 0.5} y={H - hT} width={L - 1} height={hT} fill="none" stroke={C.pend} strokeWidth="1"
                  strokeDasharray={d.fator < 1 ? "2 2" : "0"} />
              : <rect x={x} y={H - hT} width={L} height={hT} fill={d.fechada ? C.falta : C.pend} />}
            {hF > 0 && <rect x={x} y={H - hF} width={L} height={hF} fill={d.atual ? C.teal : C.tealClaro} />}
            {d.atual && <rect x={x} y={H + 3} width={L} height={2} fill={C.teal} />}
            <text x={x + L / 2} y={H + 12} textAnchor="end" fontSize="7" fontFamily={SANS}
              fill={d.atual ? C.teal : C.ink2} fontWeight={d.atual ? 600 : 400}
              transform={`rotate(-60 ${x + L / 2} ${H + 12})`}>{fmtCurto(d.k)}</text>
          </g>);
        })}
      </svg>
      <div style={{ display: "flex", gap: 14, marginTop: 9, fontSize: 11, color: C.ink2, flexWrap: "wrap" }}>
        <Leg cor={C.tealClaro} t={`${totFeitos} cumpridos`} />
        <Leg cor={C.falta} t={`${totFalta} não cumpridos`} />
        <Leg cor={C.pend} t={`${totPend} em aberto`} />
        <Leg contorno t={`${totPrev} previstos`} />
      </div>
      <div style={{ fontSize: 11, color: C.ink2, marginTop: 7, lineHeight: 1.45 }}>
        Vermelho é o que ficou por fazer em semanas já fechadas; contorno tracejado marca carga reduzida.
      </div>
    </div>
  );
}
const Leg = ({ cor, t, contorno }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{ width: 10, height: 10, display: "inline-block",
      background: contorno ? "transparent" : cor, border: contorno ? `1px solid ${C.pend}` : "none" }} />{t}</span>);

/* ---------- PLANO ---------- */
function PlanoSemanal({ plano, segAtual, cfg }) {
  return (
    <div>
      <SecaoTitulo texto="Próximas 14 semanas" />
      {plano.semanas.slice(0, 14).map((s) => {
        const cont = (t) => s.itens.filter((i) => i.tipo === t);
        const atual = s.seg === segAtual;
        return (
          <div key={s.seg} style={{ background: C.surface, marginBottom: 7, padding: "11px 12px",
            outline: atual ? `1.5px solid ${C.teal}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12,
              color: atual ? C.teal : C.ink2, marginBottom: 8, fontWeight: atual ? 600 : 400 }}>
              <span>{rotuloSemana(s.seg)}{atual ? " · atual" : ""}</span>
              <span>{s.pontos}/{s.cap} pts{s.fator < 1 ? " · reduzida" : ""}</span>
            </div>
            {cont("aula").map((i) => (
              <div key={i.id} style={{ fontSize: 13.5, lineHeight: 1.5, display: "flex", gap: 7 }}>
                <span style={{ width: 3, background: areaColor(i.area), flexShrink: 0 }} /><span>{i.tema}</span>
              </div>))}
            <div style={{ fontSize: 12, color: C.ink2, marginTop: 6, lineHeight: 1.5 }}>
              {cont("questoes").length} questões · {cont("revisao").length} revisões · {cont("bonus").length} bônus
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- BÔNUS ---------- */
function Bonus({ bonus, cfg, setCfg, toggle }) {
  const [verTudo, setVerTudo] = useState(false);
  const peso = (x) => pesoBonus(x, cfg);
  const ord = (a, b) => peso(b) - peso(a) || Number(a.semana) - Number(b.semana);
  const pend = bonus.filter((x) => !x.feito && peso(x) >= 2).sort(ord);
  const baixa = bonus.filter((x) => !x.feito && peso(x) <= 1).sort(ord);
  const bf = (a) => ({ flex: 1, padding: "9px 6px", fontSize: 12.5, cursor: "pointer", fontFamily: SANS,
    border: `1px solid ${a ? C.teal : C.line}`, background: a ? C.tealSoft : "transparent", color: a ? C.teal : C.ink2, fontWeight: a ? 600 : 400 });
  return (
    <div>
      <SecaoTitulo texto="Banca de referência" />
      <div style={{ background: C.surface, padding: 13, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 7 }}>
          {[["usp", "USP-SP"], ["unifesp", "Unifesp"], ["ambas", "Ambas"]].map(([k, l]) => (
            <button key={k} onClick={() => setCfg({ ...cfg, bancaFoco: k })} style={bf(cfg.bancaFoco === k)}>{l}</button>))}
        </div>
        <div style={{ fontSize: 12, color: C.ink2, marginTop: 10, lineHeight: 1.5 }}>
          {pend.length} bônus prioritárias e {baixa.length} de baixa prioridade. Todas entram na agenda a 3 pontos cada;
          as de até uma estrela só depois que as demais couberem.
        </div>
      </div>
      <SecaoTitulo texto="Fila de aulas bônus" />
      {pend.map((x) => (
        <div key={x.id} style={{ background: C.surface, padding: "10px 12px", marginBottom: 6, borderLeft: `3px solid ${C.star}`,
          display: "flex", gap: 11, alignItems: "flex-start" }}>
          <button onClick={() => toggle(x.id)} style={{ width: 22, height: 22, flexShrink: 0, marginTop: 2, cursor: "pointer",
            border: `1.5px solid ${C.star}`, background: "transparent", borderRadius: 4, color: C.star, fontSize: 13, lineHeight: 1, padding: 0 }}>✓</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, lineHeight: 1.35 }}>{x.nome}</div>
            <div style={{ fontSize: 11.5, color: C.ink2, marginTop: 3 }}>
              Semana {x.semana} · <span style={{ color: C.star }}>{"★".repeat(peso(x))}</span>
              {cfg.bancaFoco === "ambas" && <span> · USP {x.usp || "–"} / Unifesp {x.uni || "–"}</span>}
              {x.extra && <span style={{ color: C.amber }}> · semana estimada</span>}
            </div>
          </div>
        </div>))}
      {pend.length === 0 && <Vazio texto="Nenhuma bônus prioritária pendente." />}
      <SecaoTitulo texto={`Baixa prioridade · ${baixa.length}`} />
      <div style={{ background: C.surface, padding: "11px 12px" }}>
        <button onClick={() => setVerTudo(!verTudo)} style={{ border: "none", background: "none", color: C.teal,
          fontSize: 13, cursor: "pointer", padding: 0, textDecoration: "underline" }}>{verTudo ? "ocultar" : "mostrar lista"}</button>
        {verTudo && <div style={{ marginTop: 9 }}>{baixa.map((x) => (
          <div key={x.id} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: 7 }}>
            <button onClick={() => toggle(x.id)} style={{ width: 19, height: 19, flexShrink: 0, marginTop: 2, cursor: "pointer",
              border: `1.5px solid ${C.line}`, background: "transparent", borderRadius: 3, color: C.ink2, fontSize: 11, lineHeight: 1, padding: 0 }}>✓</button>
            <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.4 }}>
              {x.nome}<span style={{ color: C.line }}> · S{x.semana}</span>
              {peso(x) === 1 && <span style={{ color: C.star }}> ★</span>}
            </div>
          </div>))}</div>}
        <div style={{ fontSize: 12, color: C.ink2, marginTop: 11, lineHeight: 1.5 }}>
          Uma estrela significa duas ou três questões entre 2021 e 2025; nenhuma estrela, menos de duas naquela banca.
          São o fim da fila, não conteúdo descartado.
        </div>
      </div>
    </div>
  );
}

/* ---------- MAPA ---------- */
function Mapa({ blocos, recuar, avancar, cfg, adiados }) {
  const passo = { width: 24, height: 24, border: `1px solid ${C.line}`, background: "transparent", color: C.ink,
    fontSize: 14, lineHeight: 1, cursor: "pointer", padding: 0, fontFamily: SANS };
  const porSemana = {};
  blocos.forEach((b) => (porSemana[b.semana] ||= []).push(b));
  return (
    <div>
      <SecaoTitulo texto={`${Object.keys(porSemana).length} semanas · você está na ${cfg.semanaAtual}`} />
      <div style={{ fontSize: 12, color: C.ink2, margin: "-2px 0 10px", lineHeight: 1.5 }}>
        Em cada matéria, + marca a etapa atual como feita e − desmarca a última, restaurando as datas anteriores.
      </div>
      {Object.keys(porSemana).sort().map((s) => {
        const itens = porSemana[s];
        const media = itens.reduce((x, b) => x + Math.min(b.etapa, CONCLUIDO), 0) / (itens.length * CONCLUIDO);
        const atual = Number(s) === cfg.semanaAtual;
        return (
          <div key={s} style={{ background: C.surface, padding: "10px 12px", marginBottom: 6, outline: atual ? `1.5px solid ${C.teal}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: atual ? C.teal : C.ink2, marginBottom: 5 }}>
              <span>Semana {s}{atual ? " · atual" : ""}</span><span>{Math.round(media * 100)}%</span>
            </div>
            <div style={{ height: 3, background: C.pend, marginBottom: 7 }}>
              <div style={{ width: media * 100 + "%", height: "100%", background: C.tealClaro }} />
            </div>
            {itens.map((b) => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13.5, lineHeight: 1.45, marginBottom: 3 }}>
                <span style={{ borderLeft: `3px solid ${areaColor(b.area)}`, paddingLeft: 7 }}>
                  {b.tema}{adiados[b.id] ? <span style={{ color: C.amber }}> · adiada {adiados[b.id]}×</span> : null}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => recuar(b.id)} disabled={b.etapa === 0} aria-label="Recuar etapa" title="Desmarcar a última etapa"
                    style={{ ...passo, opacity: b.etapa === 0 ? 0.3 : 1 }}>−</button>
                  <span style={{ fontSize: 11.5, whiteSpace: "nowrap", minWidth: 78, textAlign: "center",
                    color: b.etapa >= CONCLUIDO ? C.tealClaro : b.etapa === 0 ? C.red : C.ink2 }}>
                    {b.etapa >= CONCLUIDO ? "concluído" : b.etapa === 0 ? "aula pendente" : ESCADA[b.etapa].nome.replace("Revisão ", "R ").replace("Questões pós-aula", "questões")}
                  </span>
                  <button onClick={() => avancar(b.id)} disabled={b.etapa >= CONCLUIDO} aria-label="Avançar etapa" title="Marcar a etapa atual como feita"
                    style={{ ...passo, opacity: b.etapa >= CONCLUIDO ? 0.3 : 1 }}>+</button>
                </span>
              </div>))}
          </div>);
      })}
    </div>
  );
}

/* ---------- DADOS ---------- */
function PainelSync({ sync, inp, btn, btnSec }) {
  const [email, setEmail] = useState(""); const [senha, setSenha] = useState("");
  const configurado = !!(window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey);
  const [t, cor] = ROTULO_SYNC[sync.status] || ROTULO_SYNC.local;
  return (
    <div style={{ background: C.surface, padding: 13, marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: cor, marginBottom: 10 }}>● {t}</div>
      {!configurado && (
        <div style={{ fontSize: 12.5, color: C.ink2, lineHeight: 1.55 }}>
          O Firebase ainda não foi configurado, então o progresso fica só neste aparelho. Siga o LEIA-ME para
          preencher o arquivo <code>firebase-config.js</code>.
        </div>
      )}
      {configurado && sync.user && (
        <>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>Conectado como {sync.user.email || sync.user.nome}</div>
          <div style={{ fontSize: 12, color: C.ink2, marginTop: 6, lineHeight: 1.5 }}>
            Sem internet, as marcações ficam guardadas no aparelho e são enviadas quando a conexão voltar.
          </div>
          <button style={{ ...btnSec, marginTop: 11, width: "100%" }} onClick={() => Sync.sair()}>Sair</button>
        </>
      )}
      {configurado && !sync.user && sync.status !== "conectando" && sync.status !== "indisponivel" && (
        <>
          <button style={{ ...btn, width: "100%" }} onClick={() => Sync.entrarGoogle()}>Entrar com Google</button>
          <div style={{ fontSize: 11.5, color: C.ink2, margin: "12px 0 6px", textAlign: "center" }}>ou com e-mail e senha</div>
          <input style={inp} type="email" placeholder="e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={{ ...inp, marginTop: 7 }} type="password" placeholder="senha (mín. 6 caracteres)" value={senha}
            onChange={(e) => setSenha(e.target.value)} />
          <div style={{ display: "flex", gap: 7, marginTop: 8 }}>
            <button style={{ ...btnSec, flex: 1 }} onClick={() => Sync.entrarEmail(email, senha, false)}>Entrar</button>
            <button style={{ ...btnSec, flex: 1 }} onClick={() => Sync.entrarEmail(email, senha, true)}>Criar conta</button>
          </div>
          <div style={{ fontSize: 12, color: C.ink2, marginTop: 9, lineHeight: 1.5 }}>
            Use a mesma conta nos dois aparelhos. O login precisa de internet só na primeira vez.
          </div>
        </>
      )}
      {sync.erro && <div style={{ fontSize: 12.5, color: C.red, marginTop: 10, lineHeight: 1.5 }}>{sync.erro}</div>}
    </div>
  );
}

function PainelVersao({ btnSec }) {
  const tem = useAtualizacao();
  const [info, setInfo] = useState(null); const [busy, setBusy] = useState(false);
  const verificar = async () => {
    setBusy(true);
    const r = await Atualizador.verificar();
    setInfo(r ? r : { erro: true }); setBusy(false);
  };
  return (
    <div style={{ background: C.surface, padding: 13, marginBottom: 12 }}>
      <div style={{ fontSize: 13 }}>Versão instalada: {APP_VERSION}</div>
      {tem ? (
        <button style={{ ...btnSec, marginTop: 11, width: "100%", background: C.teal, color: C.base, border: "none" }}
          onClick={() => Atualizador.aplicar()}>Instalar nova versão</button>
      ) : (
        <button style={{ ...btnSec, marginTop: 11, width: "100%" }} onClick={verificar} disabled={busy}>
          {busy ? "Verificando…" : "Verificar atualização"}
        </button>
      )}
      {info && !info.erro && (
        <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 9, lineHeight: 1.5 }}>
          Versão publicada: {info.versao}
          {info.versao === APP_VERSION ? " · você já está na mais recente." : " · baixando; o aviso de atualização aparece em instantes."}
          {info.notas && <><br />{info.notas}</>}
        </div>
      )}
      {info && info.erro && <div style={{ fontSize: 12.5, color: C.amber, marginTop: 9 }}>Sem conexão para verificar agora.</div>}
      <div style={{ fontSize: 12, color: C.ink2, marginTop: 9, lineHeight: 1.5 }}>
        O app também verifica sozinho ao abrir e a cada hora. Seu progresso não é afetado pelas atualizações.
      </div>
    </div>
  );
}

function PainelAnki({ cfg, setCfg, blocos, lerAnki, ankiMsg, inp, btn, btnSec }) {
  const [loc, setLoc] = useState(ankiLocal());
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const [verMapa, setVerMapa] = useState(false);
  const mapa = cfg.ankiMapa || {};
  const nAssoc = blocos.filter((b) => (mapa[b.id] || []).length).length;
  const usados = new Set(Object.values(mapa).flat());
  const atualizarLoc = (o) => { const n = { ...loc, ...o }; setLoc(n); salvarAnkiLocal(n); };
  const setMapa = (m) => setCfg({ ...cfg, ankiMapa: m });

  const buscarBaralhos = async () => {
    setBusy(true); setMsg("");
    try {
      const lista = await Anki.baralhos(loc.url);
      atualizarLoc({ baralhos: lista });
      setMsg(`${lista.length} baralhos encontrados.`);
      return lista;
    } catch (e) { setMsg(e.message); return null; } finally { setBusy(false); }
  };
  const associar = async () => {
    const lista = loc.baralhos.length ? loc.baralhos : await buscarBaralhos();
    if (!lista) return;
    const auto = associarAutomatico(blocos, lista);
    const novo = { ...auto };
    Object.keys(mapa).forEach((k) => { if ((mapa[k] || []).length) novo[k] = mapa[k]; }); // mantém o que você já ajustou
    setMapa(novo);
    const n = blocos.filter((b) => (novo[b.id] || []).length).length;
    setMsg(`${n} de ${blocos.length} aulas associadas. Confira a lista abaixo.`);
    setVerMapa(true);
  };

  const porSemana = {};
  blocos.forEach((b) => (porSemana[b.semana] ||= []).push(b));
  const chip = { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, padding: "3px 4px 3px 8px",
    border: `1px solid ${C.line}`, color: C.card, margin: "4px 5px 0 0", maxWidth: "100%" };

  return (
    <div style={{ background: C.surface, padding: 13, marginBottom: 12 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, cursor: "pointer" }}>
        <input type="checkbox" checked={loc.ativo} onChange={(e) => atualizarLoc({ ativo: e.target.checked })}
          style={{ accentColor: C.card, width: 17, height: 17 }} />
        Ler do Anki neste aparelho
      </label>
      <div style={{ fontSize: 12, color: C.ink2, marginTop: 7, lineHeight: 1.5 }}>
        Ative só no computador com o Anki e o AnkiConnect instalados. No celular, deixe desligado: as contagens
        lidas no computador chegam pela sincronização.
      </div>
      {loc.ativo && (
        <>
          <label style={{ fontSize: 12, color: C.ink2, display: "block", marginTop: 11 }}>Endereço do AnkiConnect</label>
          <input style={{ ...inp, marginTop: 4 }} value={loc.url} onChange={(e) => atualizarLoc({ url: e.target.value.trim() })} />
          <div style={{ display: "flex", gap: 7, marginTop: 9, flexWrap: "wrap" }}>
            <button style={{ ...btnSec, flex: 1 }} disabled={busy} onClick={buscarBaralhos}>{busy ? "Conectando…" : "Testar conexão"}</button>
            <button style={{ ...btn, flex: 1 }} disabled={busy} onClick={associar}>Associar baralhos</button>
          </div>
          <button style={{ ...btnSec, marginTop: 7, width: "100%" }} onClick={() => lerAnki()}>Ler contagens agora</button>
        </>
      )}
      {msg && <div style={{ fontSize: 12.5, color: C.teal, marginTop: 9, lineHeight: 1.5 }}>{msg}</div>}
      {loc.ativo && ankiMsg && <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 6, lineHeight: 1.5 }}>{ankiMsg}</div>}

      <label style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 13, fontSize: 13, cursor: "pointer" }}>
        <input type="checkbox" checked={cfg.ankiAuto} onChange={(e) => setCfg({ ...cfg, ankiAuto: e.target.checked })}
          style={{ accentColor: C.card, width: 17, height: 17 }} />
        Marcar a revisão sozinho quando o baralho zerar
      </label>
      <div style={{ fontSize: 12, color: C.ink2, marginTop: 7, lineHeight: 1.5 }}>
        A revisão de flashcards é marcada quando o baralho do tema não tem mais cartões vencidos e você revisou
        pelo menos um cartão dele desde sábado.
      </div>

      <button onClick={() => setVerMapa(!verMapa)} style={{ border: "none", background: "none", color: C.teal, fontSize: 13,
        cursor: "pointer", padding: 0, marginTop: 12, textDecoration: "underline" }}>
        {verMapa ? "Ocultar associações" : `Ver associações (${nAssoc} de ${blocos.length} aulas)`}
      </button>
      {verMapa && (
        <div style={{ marginTop: 8 }}>
          {Object.keys(porSemana).sort().map((sem) => (
            <div key={sem} style={{ borderTop: `1px solid ${C.line}`, padding: "7px 0" }}>
              <div style={{ fontSize: 11, color: C.ink2 }}>Semana {sem}</div>
              {porSemana[sem].map((b) => {
                const decks = mapa[b.id] || [];
                return (
                  <div key={b.id} style={{ marginTop: 6 }}>
                    <div style={{ fontSize: 13, color: decks.length ? C.ink : C.amber }}>{b.tema}</div>
                    <div>
                      {decks.map((d) => (
                        <span key={d} style={chip}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.split("::").pop()}</span>
                          <button aria-label="Remover baralho" onClick={() => setMapa({ ...mapa, [b.id]: decks.filter((x) => x !== d) })}
                            style={{ border: "none", background: "none", color: C.ink2, cursor: "pointer", padding: "0 3px", fontSize: 12 }}>✕</button>
                        </span>))}
                    </div>
                    {loc.baralhos.length > 0 && (
                      <select value="" onChange={(e) => e.target.value && setMapa({ ...mapa, [b.id]: [...decks, e.target.value] })}
                        style={{ ...inp, fontSize: 12.5, padding: "5px 6px", marginTop: 5 }}>
                        <option value="">+ adicionar baralho</option>
                        {loc.baralhos.filter((d) => !decks.includes(d)).map((d) => (
                          <option key={d} value={d}>{usados.has(d) ? "• " : ""}{d}</option>))}
                      </select>
                    )}
                  </div>);
              })}
            </div>))}
          {loc.baralhos.length > 0 && (() => {
            const livres = loc.baralhos.filter((d) => !usados.has(d));
            return livres.length > 0 && (
              <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 8, marginTop: 4 }}>
                <div style={{ fontSize: 11, color: C.ink2 }}>Baralhos sem aula ({livres.length})</div>
                <div style={{ fontSize: 12.5, color: C.amber, lineHeight: 1.6, marginTop: 3 }}>
                  {livres.map((d) => d.split("::").pop()).join(" · ")}
                </div>
              </div>);
          })()}
          <div style={{ fontSize: 11.5, color: C.ink2, marginTop: 8, lineHeight: 1.5 }}>
            Aulas em amarelo estão sem baralho. Na lista de adicionar, "•" indica baralho já usado em outra aula.
            Um mesmo baralho pode servir a duas aulas (ex.: Trauma I e II).
          </div>
        </div>
      )}
    </div>
  );
}

function Dados({ cfg, setCfg, blocos, setBlocos, bonus, setBonus, registro, setRegistro, adiados, setAdiados,
  setExcluidos, excluidos, plano, hoje, sync, anki, setAnki, lerAnki, ankiMsg }) {
  const [saida, setSaida] = useState(""); const [nome, setNome] = useState("");
  const [texto, setTexto] = useState(""); const [msg, setMsg] = useState("");
  const inp = { width: "100%", padding: "9px 10px", border: `1px solid ${C.line}`, fontSize: 15, fontFamily: SANS,
    background: C.base, color: C.ink, colorScheme: "dark", boxSizing: "border-box" };
  const btn = { background: C.teal, color: C.base, border: "none", padding: "10px 14px", fontSize: 13.5, cursor: "pointer", fontFamily: SANS };
  const btnSec = { ...btn, background: "transparent", color: C.teal, border: `1px solid ${C.teal}` };

  const exportar = (tipo) => {
    let out = "", n = "";
    if (tipo === "backup") { n = "estudos-backup.json"; out = JSON.stringify({ versao: 9, exportadoEm: hoje, cfg, blocos, bonus, registro, adiados, excluidos, anki }, null, 2); }
    else if (tipo === "historico") {
      n = "cumprimento-semanal.csv";
      const l = ["semana_iniciada_em;itens_planejados;itens_cumpridos;pontos_planejados;pontos_cumpridos"];
      Object.keys(registro).sort().forEach((k) => { const r = registro[k];
        const tp = r.planejados.reduce((a, p) => a + (p.peso || 0), 0);
        const fp = r.planejados.filter((p) => r.feitos.includes(p.id)).reduce((a, p) => a + (p.peso || 0), 0);
        l.push([k, r.planejados.length, r.feitos.length, tp, fp].join(";")); });
      out = l.join("\n");
    } else {
      n = "plano-semanal.csv";
      const l = ["semana_de;capacidade;tipo;etapa;semana_medcurso;tema;pontos;adiada_vezes"];
      plano.semanas.forEach((s) => s.itens.forEach((i) =>
        l.push([s.seg, s.cap, i.tipo, i.rotulo, i.semana, i.tema.replace(/;/g, ","), i.peso, i.adiado || 0].join(";"))));
      out = l.join("\n");
    }
    setSaida(out); setNome(n); setMsg("");
    try { const b = new Blob([out], { type: "text/plain;charset=utf-8" }); const a = document.createElement("a");
      a.href = URL.createObjectURL(b); a.download = n; a.click(); URL.revokeObjectURL(a.href); } catch {}
  };

  return (
    <div>
      <SecaoTitulo texto="Sincronização" />
      <PainelSync sync={sync} inp={inp} btn={btn} btnSec={btnSec} />

      <SecaoTitulo texto="Versão e atualizações" />
      <PainelVersao btnSec={btnSec} />

      <SecaoTitulo texto="Anki" />
      <PainelAnki cfg={cfg} setCfg={setCfg} blocos={blocos} lerAnki={lerAnki} ankiMsg={ankiMsg}
        inp={inp} btn={btn} btnSec={btnSec} />

      <SecaoTitulo texto="Capacidade semanal" />
      <div style={{ background: C.surface, padding: 13, marginBottom: 12 }}>
        <input type="range" min="10" max="60" step="1" value={cfg.pontosSemana} style={{ width: "100%", accentColor: C.teal }}
          onChange={(e) => setCfg({ ...cfg, pontosSemana: Number(e.target.value) })} />
        <div style={{ fontSize: 13, marginTop: 6 }}>{cfg.pontosSemana} pontos por semana</div>
        <div style={{ fontSize: 12, color: C.ink2, marginTop: 8, lineHeight: 1.6 }}>
          Aula 5 · aula bônus 3 · questões 2 · revisão 1.<br />
          Uma semana típica do extensivo custa cerca de 10 pontos só de aulas novas.
        </div>
      </div>

      <SecaoTitulo texto="Horizonte do planejamento" />
      <div style={{ background: C.surface, padding: 13, marginBottom: 12 }}>
        <label style={{ fontSize: 12.5, color: C.ink2 }}>Última aula do extensivo</label>
        <input style={{ ...inp, marginTop: 5, marginBottom: 12 }} type="date" value={cfg.fimCronograma}
          onChange={(e) => setCfg({ ...cfg, fimCronograma: e.target.value })} />
        <label style={{ fontSize: 12.5, color: C.ink2 }}>Fim do planejamento em carga cheia</label>
        <input style={{ ...inp, marginTop: 5, marginBottom: 12 }} type="date" value={cfg.fimPrimario}
          onChange={(e) => setCfg({ ...cfg, fimPrimario: e.target.value })} />
        <label style={{ fontSize: 12.5, color: C.ink2 }}>Fim do período de carga reduzida</label>
        <input style={{ ...inp, marginTop: 5 }} type="date" value={cfg.fimReduzido}
          onChange={(e) => setCfg({ ...cfg, fimReduzido: e.target.value })} />
        <div style={{ marginTop: 12 }}>
          <input type="range" min="0.33" max="0.7" step="0.01" value={cfg.reducao} style={{ width: "100%", accentColor: C.teal }}
            onChange={(e) => setCfg({ ...cfg, reducao: Number(e.target.value) })} />
          <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 6, lineHeight: 1.5 }}>
            Redução de {Math.round(cfg.reducao * 100)}% entre {fmt(cfg.fimPrimario)} e {fmt(cfg.fimReduzido)}:
            {" "}{Math.round(cfg.pontosSemana * (1 - cfg.reducao))} pontos por semana. O mínimo permitido é 33%.
          </div>
        </div>
      </div>

      <SecaoTitulo texto="Redistribuição de metas" />
      <div style={{ background: C.surface, padding: 13, marginBottom: 12 }}>
        <input type="range" min="1" max="6" step="1" value={cfg.janelaRedistribuicao} style={{ width: "100%", accentColor: C.teal }}
          onChange={(e) => setCfg({ ...cfg, janelaRedistribuicao: Number(e.target.value) })} />
        <div style={{ fontSize: 13, marginTop: 6 }}>Espalhar por {cfg.janelaRedistribuicao} semanas</div>
        <div style={{ marginTop: 12 }}>
          <input type="range" min="0.1" max="0.6" step="0.05" value={cfg.tetoAdiado} style={{ width: "100%", accentColor: C.teal }}
            onChange={(e) => setCfg({ ...cfg, tetoAdiado: Number(e.target.value) })} />
          <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 6, lineHeight: 1.5 }}>
            Teto de {Math.round(cfg.tetoAdiado * 100)}% da semana ({Math.round(cfg.pontosSemana * cfg.tetoAdiado)} pontos) para metas adiadas.
          </div>
        </div>
        <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
          <input type="range" min="2" max="12" step="1" value={cfg.maxRevisoes} style={{ width: "100%", accentColor: C.teal }}
            onChange={(e) => setCfg({ ...cfg, maxRevisoes: Number(e.target.value) })} />
          <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 6 }}>Máximo de {cfg.maxRevisoes} revisões por semana</div>
          <input type="range" min="1" max="8" step="1" value={cfg.maxBonus} style={{ width: "100%", accentColor: C.teal, marginTop: 12 }}
            onChange={(e) => setCfg({ ...cfg, maxBonus: Number(e.target.value) })} />
          <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 6, lineHeight: 1.5 }}>
            Máximo de {cfg.maxBonus} aulas bônus por semana. Os tetos valem além do limite de pontos e são reduzidos
            proporcionalmente nas semanas de carga menor.
          </div>
        </div>
        <button style={{ ...btnSec, marginTop: 14, width: "100%", color: C.red, borderColor: C.red }}
          onClick={() => { setAdiados({}); setMsg("Contador de adiamentos zerado."); }}>Zerar contador de adiamentos</button>
      </div>

      <SecaoTitulo texto="Aulas bônus" />
      <div style={{ background: C.surface, padding: 13, marginBottom: 12 }}>
        <input type="range" min="1" max="12" step="1" value={cfg.semanasAdiamentoBonus} style={{ width: "100%", accentColor: C.star }}
          onChange={(e) => setCfg({ ...cfg, semanasAdiamentoBonus: Number(e.target.value) })} />
        <div style={{ fontSize: 13, marginTop: 6 }}>Bônus trocada volta à fila depois de {cfg.semanasAdiamentoBonus} semanas</div>
        <div style={{ fontSize: 12, color: C.ink2, marginTop: 7, lineHeight: 1.5 }}>
          No começo de cada semana o app pergunta se você quer trocar as bônus sugeridas. As trocadas saem da
          semana e entram outras do mesmo nível de estrelas, enquanto houver.
        </div>
      </div>
      <div style={{ background: C.surface, padding: 13, marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={cfg.incluirBaixaPrioridade}
            onChange={(e) => setCfg({ ...cfg, incluirBaixaPrioridade: e.target.checked })}
            style={{ accentColor: C.card, width: 17, height: 17 }} />
          Incluir bônus de até uma estrela na agenda
        </label>
        <div style={{ fontSize: 12, color: C.ink2, marginTop: 10, lineHeight: 1.55 }}>
          Ligado, entram no fim da fila. Desligado, ficam disponíveis só na aba Bônus.
        </div>
      </div>

      <SecaoTitulo texto="Exportar e restaurar" />
      <div style={{ background: C.surface, padding: 13, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <button style={btn} onClick={() => exportar("backup")}>Backup completo</button>
          <button style={btnSec} onClick={() => exportar("plano")}>Plano semanal</button>
          <button style={btnSec} onClick={() => exportar("historico")}>Histórico</button>
        </div>
        {saida && (<div style={{ marginTop: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: C.ink2 }}>{nome}</span>
            <button style={{ ...btnSec, padding: "6px 12px", fontSize: 12.5 }}
              onClick={async () => { try { await navigator.clipboard.writeText(saida); setMsg("Copiado."); } catch { setMsg("Selecione e copie."); } }}>Copiar</button>
          </div>
          <textarea readOnly rows={6} value={saida} onClick={(e) => e.target.select()} style={{ ...inp, fontFamily: "monospace", fontSize: 11.5 }} />
        </div>)}
        <textarea rows={3} style={{ ...inp, marginTop: 11, fontFamily: "monospace", fontSize: 12.5 }}
          placeholder="Cole o JSON do backup" value={texto} onChange={(e) => setTexto(e.target.value)} />
        <button style={{ ...btnSec, marginTop: 8, width: "100%" }} onClick={() => {
          try { const d = JSON.parse(texto); if (!d.blocos) throw new Error();
            setBlocos(d.blocos); setBonus(d.bonus || bonus); setRegistro(d.registro || {});
            setAdiados(d.adiados || {}); setExcluidos(d.excluidos || {}); setAnki(d.anki || {}); setCfg({ ...DEFAULT_CFG, ...(d.cfg || {}) });
            setMsg("Backup restaurado."); setTexto("");
          } catch { setMsg("JSON inválido."); } }}>Restaurar backup</button>
        {msg && <div style={{ fontSize: 12.5, color: C.teal, marginTop: 9 }}>{msg}</div>}
      </div>

      <SecaoTitulo texto="Semana atual e prova" />
      <div style={{ background: C.surface, padding: 13, marginBottom: 12 }}>
        <input style={inp} type="number" min="1" max="46" value={cfg.semanaAtual}
          onChange={(e) => setCfg({ ...cfg, semanaAtual: Number(e.target.value) || 1, semanaBaseSeg: sabado(hoje) })} />
        <div style={{ fontSize: 12, color: C.ink2, marginTop: 7, lineHeight: 1.5 }}>
          A semana avança sozinha todo sábado. Ajuste aqui só se o extensivo pausar ou se você quiser pular.
        </div>
        <button style={{ ...btnSec, marginTop: 9, width: "100%" }}
          onClick={() => { setBlocos(seed(cfg, hoje)); setMsg("Estado recalculado."); }}>Recalcular estado das semanas</button>
        <input style={{ ...inp, marginTop: 13 }} value={cfg.nomeProva} onChange={(e) => setCfg({ ...cfg, nomeProva: e.target.value })} />
        <input style={{ ...inp, marginTop: 8 }} type="date" value={cfg.dataProva}
          onChange={(e) => setCfg({ ...cfg, dataProva: e.target.value, provisorio: false })} />
        {cfg.provisorio && <div style={{ fontSize: 12.5, color: C.amber, marginTop: 8, lineHeight: 1.45 }}>
          Data provisória; editais de 2027 ainda não publicados.</div>}
      </div>
    </div>
  );
}

/* ---------- primitivos ---------- */
const SecaoTitulo = ({ texto, cor }) => (
  <h2 style={{ fontSize: 13, fontWeight: 600, color: cor || C.ink2, margin: "18px 0 9px" }}>{texto}</h2>);
const Vazio = ({ texto }) => (
  <div style={{ background: C.surface, padding: "16px 13px", fontSize: 13.5, color: C.ink2, lineHeight: 1.5, borderLeft: `3px solid ${C.line}` }}>{texto}</div>);

/* ---------- montagem ---------- */
ReactDOM.createRoot(document.getElementById("raiz")).render(<App />);
