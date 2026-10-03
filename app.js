/* gerado a partir de app.jsx */
"use strict";
const { useState, useEffect, useMemo, useCallback, useRef } = React;
const APP_VERSION = "1.6.1";
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
    try {
        return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    }
    catch {
        return iso(new Date());
    }
};
const fmt = (s) => parse(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
const fmtCurto = (s) => parse(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
// a semana de estudo começa no sábado, acompanhando a liberação das aulas do Medcurso
const sabado = (s) => { const d = parse(s); return addDays(s, -((d.getDay() + 1) % 7)); };
const rotuloSemana = (s) => `${fmt(s)} a ${fmt(addDays(s, 6))}`;
/* ---------- pesos ---------- */
const PESO = { aula: 5, bonus: 3, questoes: 2, revisao: 1 };
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
    ["01", "GO", "Ciclo menstrual e anticoncepção", "A"], ["01", "CLÍNICA", "Glomerulopatias I (nefrítica, GNRP)", "C"],
    ["02", "GO", "Amenorreia e ovário policístico", "A"], ["02", "CLÍNICA", "Glomerulopatias II (síndrome nefrótica)", "C"],
    ["03", "CIRURGIA", "Trauma I: avaliação inicial e trauma de tórax", "C"], ["03", "CIRURGIA", "Trauma II: abdome, pelve e TCE", "A"],
    ["04", "CLÍNICA", "Distúrbio hidroeletrolítico", "C"], ["04", "GO", "Diagnóstico de gravidez e pré-natal", "A"],
    ["05", "CLÍNICA", "Insuficiência renal", "C"], ["05", "CLÍNICA", "Distúrbio ácido-básico", "C"],
    ["06", "PREVENTIVA", "Medidas de saúde coletiva", "A"], ["06", "PEDIATRIA", "Neonatologia I", "A"],
    ["08", "PREVENTIVA", "Estudos epidemiológicos", "A"], ["08", "CIRURGIA", "Urologia", "B"],
    ["09", "PEDIATRIA", "Neonatologia II", "A"], ["09", "CLÍNICA", "Introdução à reumatologia e artrites", "C"],
    ["10", "CLÍNICA", "Gota; febre reumática", "C"], ["10", "PREVENTIVA", "Epidemiologia clínica", "A"],
    ["11", "CIRURGIA", "Queimadura e cirurgia plástica", "B"], ["11", "GO", "Assistência ao parto e parto prematuro", "A"],
    ["12", "CLÍNICA", "Colagenoses", "C"], ["12", "PREVENTIVA", "Vigilância da saúde", "A"],
    ["13", "PREVENTIVA", "Saúde do trabalhador + ética médica", "ND"], ["13", "CIRURGIA", "Cirurgia pediátrica", "A"],
    ["14", "PEDIATRIA", "Aleitamento materno", "A"], ["14", "CLÍNICA", "Vasculites", "C"],
    ["15", "CLÍNICA", "Anemias I (ferropriva, megaloblástica)", "C"], ["15", "PEDIATRIA", "Crescimento, desenvolvimento e puberdade", "A"],
    ["16", "CLÍNICA", "Leucemias agudas e crônicas", "C"], ["16", "CLÍNICA", "Anemias II (hemolíticas, falciforme)", "C"],
    ["17", "CIRURGIA", "Pré-operatório, risco cirúrgico e complicações", "A"], ["17", "CLÍNICA", "Linfomas e mieloma múltiplo", "C"],
    ["18", "CLÍNICA", "Distúrbios da hemostasia", "C"], ["18", "CIRURGIA", "Hérnias da parede abdominal", "ND"],
    ["19", "CLÍNICA", "Doenças do esôfago", "B"], ["19", "GO", "Sangramento uterino anormal, endometriose e infertilidade", "A"],
    ["20", "CLÍNICA", "Doenças clínicas do intestino", "B"], ["20", "CLÍNICA", "Doenças do estômago", "B"],
    ["21", "CLÍNICA", "Doenças cirúrgicas do intestino I", "A"], ["21", "GO", "Sangramentos na gravidez I", "B"],
    ["22", "GO", "Sangramentos na gravidez II e DHP", "B"], ["22", "CLÍNICA", "Doenças cirúrgicas do intestino II", "A"],
    ["23", "CLÍNICA", "Doença das vias biliares", "A"], ["23", "CLÍNICA", "Pancreatite e câncer de pâncreas", "A"],
    ["24", "CLÍNICA", "Hepatologia; hepatites virais", "C"], ["24", "CLÍNICA", "Cirrose e suas causas", "C"],
    ["25", "CLÍNICA", "Cirrose: complicações e hipertensão porta", "C"], ["25", "GO", "Climatério, distopia e incontinência", "A"],
    ["26", "CLÍNICA", "Arritmias I (taquiarritmias)", "B"], ["26", "PEDIATRIA", "Desnutrição e baixa estatura", "A"],
    ["27", "CLÍNICA", "Arritmias II (bradiarritmias) + PCR", "B"], ["27", "PEDIATRIA", "Imunização", "A"],
    ["28", "GO", "Doença das mamas e ovários", "A"], ["28", "CLÍNICA", "Insuficiência cardíaca", "B"],
    ["29", "CLÍNICA", "Valvopatias", "B"], ["29", "CLÍNICA", "HAS e crise hipertensiva", "B"],
    ["30", "PEDIATRIA", "Diarreia aguda e desidratação", "B"], ["30", "CLÍNICA", "Doença arterial coronariana: IAM e angina", "B"],
    ["31", "PREVENTIVA", "SUS I: histórico e legislação", "A"], ["31", "GO", "Lesões precursoras, câncer de colo e endométrio", "A"],
    ["32", "CLÍNICA", "Tireoide", "C"], ["32", "PREVENTIVA", "SUS II: atenção básica e financiamento", "A"],
    ["33", "PEDIATRIA", "Infecções respiratórias agudas I", "B"], ["33", "CLÍNICA", "Doenças da suprarrenal", "B"],
    ["34", "CLÍNICA", "Diabetes mellitus", "A"], ["34", "PEDIATRIA", "Infecções respiratórias agudas II", "B"],
    ["35", "GO", "Distúrbios hipertensivos da gestação, DM e gemelaridade", "A"], ["35", "CLÍNICA", "Asma e DPOC", "A"],
    ["36", "CLÍNICA", "Câncer de pulmão, TEP", "B"], ["36", "PEDIATRIA", "Nefrologia pediátrica", "A"],
    ["37", "CLÍNICA", "Pneumonia e complicações", "B"], ["37", "CLÍNICA", "Tuberculose", "B"],
    ["38", "CLÍNICA", "AIDS", "B"], ["38", "CLÍNICA", "Parasitoses intestinais", "C"],
    ["39", "CLÍNICA", "Endocardite infecciosa / meningite", "B"], ["39", "GO", "Sofrimento fetal, fórcipe e puerpério", "A"],
    ["40", "GO", "Infecções sexualmente transmissíveis", "A"], ["40", "CLÍNICA", "Síndromes febris", "B"],
    ["41", "CLÍNICA", "Neurologia I (cefaleias, epilepsias)", "A"], ["41", "CLÍNICA", "Neurologia II (AVE)", "B"],
    ["42", "PEDIATRIA", "Doenças exantemáticas", "A"], ["42", "CLÍNICA", "Neurologia III (demência, Parkinson)", "B"],
    ["43", "CIRURGIA", "Oftalmologia", "C"], ["43", "CLÍNICA", "Psiquiatria I", "B"], ["43", "CLÍNICA", "Psiquiatria II", "B"],
    ["44", "CIRURGIA", "Especialidade cirúrgica I", "A"], ["44", "CIRURGIA", "Especialidade cirúrgica II", "A"],
    ["45", "CLÍNICA", "Dermatologia I", "B"], ["45", "CLÍNICA", "Dermatologia II", "B"],
    ["46", "CIRURGIA", "Ortopedia I", "C"], ["46", "CIRURGIA", "Ortopedia II", "C"],
];
/* ---------- aulas bônus: [nome, ★USP-SP, ★Unifesp, semanaEstimada] ---------- */
const BONUS = {
    "01": [["Incongruência de gênero", 0, 0], ["Síndrome pré-menstrual e SDPM", 0, 0], ["Alport", 0, 0]],
    "03": [["Trauma cervical", 0, 0], ["Trauma abdominal: lesões específicas", 1, 1], ["Lesões de extremidades", 0, 0],
        ["Trauma diafragmático", 1, 2, 1], ["Lesão renal", 1, 1, 1], ["Trauma da coluna vertebral e raquimedular", 0, 2, 1]],
    "04": [["Hipernatremia", 0, 0], ["Aconselhamento genético pré-natal", 0, 0]],
    "05": [["Terapia de substituição renal: HD e DP", 0, 3], ["Terapia de substituição renal: transplante", 0, 0], ["Relação delta-delta", 0, 0]],
    "06": [["Outros indicadores e Censo 2022", 0, 0], ["Triagem neonatal", 3, 2], ["Exame físico neonatal", 0, 0]],
    "08": [["Testes estatísticos", 0, 3], ["Estudos descritivos e metanálise", 0, 0], ["Fases do ensaio clínico", 1, 0],
        ["Medidas de tendência central e dispersão", 0, 0], ["Verossimilhança e testes múltiplos", 0, 0], ["Curva ROC e ponto de corte", 0, 0],
        ["Câncer de rim", 0, 0], ["Câncer de bexiga", 0, 1], ["Câncer de testículo", 0, 0], ["Hipogonadismo masculino e testosterona", 0, 2], ["Disfunção erétil", 0, 0]],
    "09": [["Enterocolite necrosante", 0, 0], ["Neonatologia: miscelânea", 1, 0], ["Doenças do trato gastrointestinal (PED)", 0, 1, 1], ["AINEs e glicocorticoides", 0, 0]],
    "10": [["Fibromialgia", 0, 0], ["Artrite séptica", 2, 1], ["Anatomia da hipófise e hipotálamo", 0, 2, 1]],
    "11": [["REMIT", 0, 0], ["Suporte nutricional", 1, 0], ["Cirurgia plástica", 1, 2], ["Estudo do motor", 2, 0], ["Mecanismo de parto", 0, 0], ["Cesariana", 0, 0]],
    "12": [["Amiloidoses", 0, 0], ["Síndrome de Sjögren", 0, 0], ["Doença mista do tecido conjuntivo", 0, 0],
        ["Glossário de doenças infecciosas", 1, 0], ["Processo epidêmico", 3, 0]],
    "13": [["Saúde do trabalhador: saturnismo, hidrargirismo, benzenismo", 0, 0],
        ["Cirurgia pediátrica: gastrointestinal", 3, 3], ["Cirurgia pediátrica: geniturinário", 0, 1], ["Miopatias inflamatórias idiopáticas", 1, 0, 1]],
    "14": [["Alimentação complementar", 0, 0]],
    "15": [["Mielodisplasia", 0, 0], ["Anemia sideroblástica", 0, 0], ["Distúrbios puberais", 0, 0]],
    "16": [["Porfiria", 0, 0], ["Hemoglobinúria paroxística noturna", 0, 0], ["Talassemias", 0, 1]],
    "17": [["Anestesiologia", 3, 3], ["Fios de sutura", 0, 1], ["Profilaxia de TEP e TVP", 0, 0], ["Fístulas digestivas e deiscência", 3, 0, 1]],
    "18": [["Hemotransfusão", 1, 0], ["Hemofilias", 0, 0], ["Trombofilias", 0, 0],
        ["Hérnias: abordagem laparoscópica", 3, 0], ["Outras hérnias", 0, 0], ["Hérnias na infância", 0, 0]],
    "19": [["Perfuração esofágica (Boerhaave)", 0, 0], ["Esofagites", 0, 0], ["Infertilidade", 1, 2], ["Dismenorreia e pólipos endometriais", 1, 0]],
    "20": [["Colite pseudomembranosa", 0, 0], ["Síndrome do intestino irritável", 0, 0], ["Hemorragia digestiva alta", 1, 0],
        ["GIST", 0, 0], ["Linfoma gástrico", 0, 0], ["Síndrome de Zollinger-Ellison", 1, 0]],
    "21": [["Ingestão de corpo estranho", 1, 0]],
    "22": [["Hemorragia digestiva baixa", 0, 0], ["Tumores carcinoides", 0, 0], ["Tumores do apêndice", 0, 0], ["Câncer de canal anal", 0, 0]],
    "23": [["Neoplasias das vias biliares", 0, 0], ["Lesão iatrogênica da via biliar", 0, 0], ["Cistos de via biliar", 0, 0],
        ["Colangite esclerosante primária", 0, 0], ["Tumores neuroendócrinos do pâncreas", 0, 0], ["Neoplasias císticas do pâncreas", 0, 0]],
    "24": [["Insuficiência hepática aguda", 0, 0], ["Hepatite medicamentosa", 0, 0]],
    "25": [["Abscesso hepático bacteriano", 0, 0], ["Tumores hepáticos benignos", 0, 0], ["Tumores hepáticos malignos", 1, 0],
        ["Osteoporose", 1, 0], ["Fístulas genitais e bexiga dolorosa", 0, 0], ["Anatomia em GO: pelve e assoalho", 0, 0]],
    "26": [["Bloqueios de ramo", 0, 0], ["Carência de micronutrientes", 0, 0], ["Síndromes genéticas", 0, 0]],
    "27": [["Marca-passo: conceitos básicos", 1, 0], ["Marca-passo: funcionamento do definitivo", 1, 0], ["Síncope", 0, 0],
        ["Profilaxia para raiva", 0, 0], ["Profilaxia para tétano acidental", 0, 0]],
    "28": [["Choque: monitorização hemodinâmica e perfusional", 1, 1], ["Choque: tratamento", 1, 1], ["Choque em pediatria", 2, 0],
        ["Insuficiência cardíaca aguda", 0, 0], ["Hipertensão pulmonar", 0, 0], ["Cardiomiopatia dilatada", 0, 0],
        ["Cardiomiopatia hipertrófica", 0, 0], ["Cardiomiopatia restritiva", 0, 0], ["Takotsubo", 0, 0]],
    "30": [["Constipação na infância", 0, 1], ["Diarreia crônica", 0, 1], ["Complicações pós-IAM", 0, 1], ["Pericardiopatias", 1, 0]],
    "31": [["Receitas médicas", 0, 1], ["Decreto 7.508", 0, 1], ["Câncer de vulva", 0, 0], ["Síndrome do eutireoideo doente", 0, 1, 1]],
    "32": [["Método clínico centrado na pessoa", 2, 0], ["Método SOAP", 2, 0], ["Saúde suplementar", 2, 0, 1],
        ["Instrumentos de AB: tipos de família", 0, 0], ["Instrumentos de AB: ciclo de vida familiar", 0, 0],
        ["Instrumentos de AB: Apgar familiar, Practice e Firo", 0, 0], ["Escala de Coelho-Savassi", 0, 0], ["Genograma e ecomapa", 0, 0],
        ["Hipotireoidismo congênito", 0, 0]],
    "33": [["Rinite alérgica", 0, 0], ["Estridor crônico e corpo estranho", 0, 0], ["Epistaxe", 0, 0],
        ["Hipófise e hipotálamo", 0, 2], ["Síndromes endócrinas: coma mixedematoso", 0, 1, 1], ["Hiperparatireoidismo primário", 1, 0, 1]],
    "34": [["Hipoglicemia", 0, 0], ["Doença renal do diabetes", 0, 0], ["Retinopatia diabética", 0, 0],
        ["Neuropatia diabética e pé diabético", 0, 0], ["Dislipidemia", 0, 0], ["Fibrose cística", 0, 0]],
    "35": [["Ventilação mecânica", 3, 0], ["Capnografia", 3, 0], ["Síndrome do desconforto respiratório agudo", 3, 0],
        ["Insuficiência respiratória", 0, 1], ["USG de tórax", 0, 0], ["Provas de função pulmonar", 0, 0],
        ["Doenças intercorrentes na gestação", 3, 3]],
    "36": [["Nódulo pulmonar solitário", 0, 3], ["PALS / PCR na infância", 3, 0], ["Anafilaxia", 0, 2],
        ["Embolia gordurosa", 0, 0], ["Tumores do mediastino", 0, 0], ["Pneumopatias intersticiais difusas", 0, 0],
        ["Sarcoidose", 0, 0], ["Hemoptise", 0, 0], ["Cardiopatias congênitas", 0, 0], ["Hipertensão arterial na infância", 0, 0]],
    "37": [["Derrame pleural", 1, 1], ["Influenza", 0, 0], ["Aspergilose", 0, 0], ["Histoplasmose", 0, 0], ["Paracoccidioidomicose", 0, 0]],
    "38": [["HIV na infância", 0, 0], ["HTLV", 0, 0], ["Citomegalovírus", 0, 0], ["Esquistossomose", 0, 0],
        ["Toxoplasmose", 0, 0], ["Acidente por animais peçonhentos", 0, 0]],
    "39": [["Sepse e choque séptico", 1, 1], ["Meningoencefalite herpética", 1, 0], ["Abscesso cerebral", 1, 0],
        ["Infecção relacionada a cateter", 0, 0], ["ITU", 0, 0], ["Distúrbios do humor e tromboembolismo", 3, 3]],
    "40": [["Febre tifoide", 0, 0], ["Malária", 0, 0], ["Febre maculosa brasileira", 0, 0], ["Covid-19", 0, 0],
        ["Febre do Oropouche", 0, 0], ["Doença de Chagas", 0, 0], ["Leishmaniose visceral", 0, 0]],
    "41": [["Cuidados paliativos", 3, 1], ["Coma", 2, 0], ["Hipertensão intracraniana", 2, 0],
        ["Hipertermia maligna", 0, 1], ["Doenças da placa motora", 0, 1], ["Distrofias musculares", 0, 0],
        ["Hérnia de disco", 0, 0], ["Transtornos do neurodesenvolvimento", 0, 0]],
    "42": [["Prevenção de acidentes e maus-tratos na infância", 0, 3], ["Erros inatos da imunidade", 1, 0],
        ["Febre sem sinais de localização", 0, 0], ["Tumores abdominais na infância", 0, 0],
        ["Trombose venosa cerebral", 0, 0], ["Ataque isquêmico transitório", 0, 0], ["Tumores do SNC", 0, 0], ["Vertigem", 0, 0]],
    "43": [["Intoxicações exógenas", 0, 1], ["Crise aguda de glaucoma", 0, 1, 1], ["Suicídio", 0, 0]],
    "44": [["Cirurgia de cabeça e pescoço", 1, 0], ["Cisto pilonidal", 0, 0]],
    "45": [["Herpes-zóster", 1, 0], ["Piodermites", 1, 0], ["Acne vulgar", 0, 0], ["Mpox", 0, 0], ["Angioedema hereditário", 0, 0]],
    "46": [["Doenças periarticulares", 0, 1, 1]],
};
const DEFAULT_CFG = {
    dataProva: "2027-10-24", nomeProva: "Prova alvo (data provisória)",
    pontosSemana: 40, tetoAdiado: 0.30, janelaRedistribuicao: 3,
    maxRevisoes: 6, maxBonus: 3,
    fimCronograma: "2026-11-20", // última aula do extensivo
    fimPrimario: "2026-12-06", // fim do planejamento em carga cheia
    fimReduzido: "2027-01-10", // até aqui, carga reduzida
    reducao: 0.33,
    semanaAtual: 38, semanaBaseSeg: "2026-09-19", // semana do extensivo e o sábado em que ela começou
    pendentesForcados: [], // nenhuma aula anterior em aberto
    // aula assistida, questões e revisões pendentes ("semana" ou "semana|área")
    somenteAulas: ["33|PEDIATRIA", "34|PEDIATRIA", "35", "36", "37"],
    bancaFoco: "ambas", incluirBaixaPrioridade: true, semanasAdiamentoBonus: 4,
    ankiMapa: {}, ankiAuto: true,
    provisorio: true,
};
const KEY = "estudos:v9";
const load = async (k, f) => { try {
    const r = localStorage.getItem(k);
    return r ? JSON.parse(r) : f;
}
catch {
    return f;
} };
const save = async (k, v) => { try {
    localStorage.setItem(k, JSON.stringify(v));
}
catch { } };
const lsGet = (k) => { try {
    return localStorage.getItem(k);
}
catch {
    return null;
} };
const lsSet = (k, v) => { try {
    localStorage.setItem(k, v);
}
catch { } };
const inicioSemana = (n, cfg, hoje) => addDays(hoje, -7 * (cfg.semanaAtual - n));
function seed(cfg, hoje) {
    const soAula = cfg.somenteAulas || [];
    return CRONO.map(([semana, area, tema, tier], i) => {
        const n = Number(semana);
        const forcado = cfg.pendentesForcados.includes(semana + "|" + area);
        let etapa = 0, dataAula = null;
        if (forcado) {
            etapa = 0; // nem a aula foi vista
        }
        else if (soAula.includes(semana) || soAula.includes(semana + "|" + area)) {
            dataAula = inicioSemana(n, cfg, hoje);
            etapa = 1; // aula vista, questões pendentes
        }
        else if (n < cfg.semanaAtual) {
            dataAula = inicioSemana(n, cfg, hoje);
            let ult = 0;
            for (let k = 1; k <= 6; k++)
                if (diffDays(dataAula, hoje) >= ESCADA[k].dias)
                    ult = k;
            etapa = Math.min(ult + 1, CONCLUIDO);
        }
        return { id: "b" + i, semana, area, tema, tier, etapa, dataAula };
    });
}
// semanas do extensivo, em ordem (a base do MEDPlanner não tem a 07)
const ORDEM_SEMANAS = [...new Set(CRONO.map((c) => Number(c[0])))].sort((a, b) => a - b);
// posição na lista; uma semana ausente (a 07) conta como a próxima que existe
const indiceSemana = (n) => { const i = ORDEM_SEMANAS.findIndex((x) => x >= Number(n)); return i < 0 ? ORDEM_SEMANAS.length - 1 : i; };
const semanaDepoisDe = (n, passos) => {
    const i = indiceSemana(n), j = i + passos - (ORDEM_SEMANAS[i] === Number(n) || passos <= 0 ? 0 : 1);
    return ORDEM_SEMANAS[Math.min(ORDEM_SEMANAS.length - 1, Math.max(0, j))];
};
const seedBonus = () => {
    const out = [];
    Object.entries(BONUS).forEach(([semana, l]) => l.forEach(([nome, usp, uni, est], j) => out.push({ id: "x" + semana + "_" + j, semana, nome, usp, uni, extra: !!est, feito: false })));
    return out;
};
// avança um tema até depois da etapa "ate", guardando o estado anterior de cada etapa pulada
function avancarBloco(b, ate, hoje) {
    if (b.etapa > ate)
        return b;
    const hist = { ...(b.hist || {}) };
    for (let e = b.etapa; e <= ate; e++)
        hist[e] = { u: b.dataUltima || null, a: b.dataAula || null };
    return { ...b, etapa: Math.min(ate + 1, CONCLUIDO), dataAula: b.dataAula || hoje, dataUltima: hoje, hist };
}
// volta um tema para a etapa "et", restaurando as datas que ele tinha antes de concluí-la
function voltarBloco(b, et) {
    if (b.etapa <= et)
        return b;
    const hist = { ...(b.hist || {}) }, h = hist[et];
    Object.keys(hist).forEach((k) => { if (Number(k) >= et)
        delete hist[k]; });
    return h ? { ...b, etapa: et, dataUltima: h.u, dataAula: h.a, hist } : { ...b, etapa: et, hist };
}
const pesoBonus = (b, cfg) => cfg.bancaFoco === "usp" ? b.usp : cfg.bancaFoco === "unifesp" ? b.uni : Math.max(b.usp, b.uni);
/* ============================================================
   MOTOR — capacidade em pontos, alocação semanal
   ============================================================ */
function fatorCarga(seg, cfg) {
    if (seg < cfg.fimPrimario)
        return 1;
    if (seg < cfg.fimReduzido)
        return 1 - cfg.reducao;
    return 1;
}
// vencimento de uma etapa: os marcos da escada contam a partir da aula ("Revisão 4 meses" = 4 meses depois da
// aula); se a etapa anterior foi feita com atraso, a seguinte espera um intervalo mínimo depois dela
function vencimento(b, e, hoje) {
    const aula = b.dataAula || b.dataUltima || hoje, ult = b.dataUltima || aula;
    const marco = addDays(aula, ESCADA[e].dias), minimo = addDays(ult, e >= 3 ? 7 : 1);
    return e <= 1 ? marco : (marco > minimo ? marco : minimo);
}
// jaFeito: pontos e quantidades já cumpridos na semana atual, que continuam ocupando a capacidade dela
function construir(blocos, bonus, cfg, hoje, adiados, fora = new Set(), bonusAdiado = {}, jaFeito = null) {
    const seg0 = sabado(hoje);
    const nAdi = (id) => adiados[id] || 0;
    const aulas = [], questoes = [], revisoes = [];
    const mk = (b, e, extra) => ({ ...b, id: b.id + ":" + e, blocoId: b.id, etapaItem: e,
        rotulo: ESCADA[e].nome, questoes: qEtapa(b.tier, e), ...extra });
    blocos.forEach((b) => {
        if (b.etapa >= CONCLUIDO)
            return;
        if (b.etapa === 0) {
            // a aula e as suas questões entram juntas na mesma semana
            aulas.push(mk(b, 0, { tipo: "aula", peso: PESO.aula, ordem: Number(b.semana), questoes: 0,
                atrasada: Number(b.semana) < cfg.semanaAtual,
                par: mk(b, 1, { tipo: "questoes", peso: PESO.questoes, adiado: nAdi(b.id + ":1") }) }));
        }
        else {
            const p = ESCADA[b.etapa];
            const venc = vencimento(b, b.etapa, hoje);
            const it = mk(b, b.etapa, { venc, atraso: Math.max(0, diffDays(venc, hoje)) });
            if (p.tipo === "questoes")
                questoes.push({ ...it, tipo: "questoes", peso: PESO.questoes });
            else
                revisoes.push({ ...it, tipo: "revisao", peso: PESO.revisao });
        }
    });
    const bns = bonus.filter((x) => !x.feito && (cfg.incluirBaixaPrioridade || pesoBonus(x, cfg) >= 2))
        .map((x) => {
        const e = pesoBonus(x, cfg);
        return { ...x, tipo: "bonus", peso: PESO.bonus, tema: x.nome, area: "CLÍNICA", estrelas: e, baixa: e <= 1,
            rotulo: e >= 2 ? "Aula bônus " + "★".repeat(e) : "Aula bônus · baixa prioridade" };
    })
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
    const idxSemana = indiceSemana;
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
    const s0 = bucket(0);
    if (jaFeito) {
        s0.pontos = jaFeito.pontos;
        s0.nRev = jaFeito.nRev;
        s0.nBns = jaFeito.nBns;
        s0.feito = jaFeito.pontos;
    }
    const semanaDe = (data) => Math.max(0, Math.floor(diffDays(seg0, sabado(data)) / 7));
    const colocar = (it, i, adi) => {
        const b = bucket(i);
        const { par, ...limpo } = it;
        b.itens.push({ ...limpo, seg: b.seg });
        b.pontos += it.peso;
        if (adi)
            b.pAdi += it.peso;
        if (it.tipo === "revisao")
            b.nRev++;
        if (it.tipo === "bonus")
            b.nBns++;
        return i;
    };
    const cabe = (b, it, adi) => ((b.pontos === 0 && !b.itens.length) || b.pontos + it.peso <= b.cap + 0.01)
        // metas adiadas: até o teto da semana, mas sempre ao menos uma (uma aula de 5 pts nunca fica sem lugar)
        && (!adi || b.pAdi === 0 || b.pAdi + it.peso <= b.cap * cfg.tetoAdiado + 0.01)
        && (it.tipo !== "revisao" || b.nRev < b.maxRev) && (it.tipo !== "bonus" || b.nBns < b.maxBns);
    const por = (it, iMin, adi) => {
        let i = iMin;
        while (!cabe(bucket(i), it, adi) && i < iMin + 400)
            i++;
        return colocar(it, i, adi);
    };
    const janela = Math.max(1, cfg.janelaRedistribuicao);
    // questões pós-aula nunca aparecem antes da semana da própria aula, mesmo que ela tenha sido vista antes
    // bônus trocada só volta a partir da data escolhida, inclusive quando também estava entre as adiadas
    const voltaBonus = (it) => {
        const ate = it.tipo === "bonus" && bonusAdiado[it.id];
        return ate ? Math.max(0, Math.ceil(diffDays(seg0, ate) / 7)) : 0;
    };
    const min0 = (it) => Math.max(fora.has(it.id) ? 1 : 0, voltaBonus(it), it.tipo === "questoes" && it.etapaItem === 1 ? alvoDaAula(it) : 0);
    // A aula de uma semana do extensivo nunca sai da sua semana: entra primeiro e reserva os pontos dela.
    // Pendências e revisões é que escorrem para as semanas seguintes.
    const fixar = (it, i) => colocar(it, i, false);
    const naPropriaSemana = (a) => idxSemana(a.semana) - baseIdx >= 0;
    const pares = []; // [questões, semana mínima] — nunca antes da semana da própria aula
    // 1º) as aulas de cada semana ocupam o seu lugar e reservam os pontos delas
    [...fAulas, ...adiada.filter((it) => it.tipo === "aula")].filter(naPropriaSemana)
        .forEach((a) => { const i = fixar(a, Math.max(min0(a), alvoDaAula(a))); if (a.par)
        pares.push([a.par, i]); });
    // 2º) aulas atrasadas de semanas anteriores, que disputam espaço como as demais pendências
    [...adiada.filter((it) => it.tipo === "aula" && !naPropriaSemana(it)), ...fAulas.filter((a) => !naPropriaSemana(a))]
        .forEach((a) => { const i = por(a, min0(a), !!a.adiado); if (a.par)
        pares.push([a.par, i]); });
    // 3º) revisões e questões já vencidas vêm antes do que ainda nem foi visto
    fRev.forEach((r) => por(r, Math.max(min0(r), r.venc <= hoje ? 0 : semanaDe(r.venc)), false));
    fQuest.forEach((q) => por(q, Math.max(min0(q), q.venc <= hoje ? 0 : semanaDe(q.venc)), false));
    adiada.filter((it) => it.tipo !== "aula")
        .forEach((it, k) => por(it, Math.max(min0(it), k % janela), true));
    // 4º) as questões das aulas novas, a partir da semana em que a aula acontece
    pares.forEach(([q, iAula]) => por(q, Math.max(min0(q), iAula), q.adiado > 0));
    fBonus.forEach((b) => por(b, min0(b), false));
    const ordem = { aula: 0, questoes: 1, revisao: 2, bonus: 3 };
    semanas.forEach((s) => s.itens.sort((a, b) => b.adiado - a.adiado || ordem[a.tipo] - ordem[b.tipo]
        || Number(a.semana) - Number(b.semana)));
    let terminoAulas = seg0;
    semanas.forEach((s) => { if (s.itens.some((x) => x.tipo === "aula"))
        terminoAulas = addDays(s.seg, 6); });
    return { semanas, aulas: fAulas.concat(adiada.filter((a) => a.tipo === "aula")), terminoAulas,
        atrasadas: todos.filter((r) => (r.tipo === "questoes" || r.tipo === "revisao") && (r.atraso > 0 || r.adiado > 0)).length,
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
        BANDEIRAS.forEach((f) => { if (r[f] !== undefined)
            registro[k][f] = r[f]; });
    });
    return { cfg, blocos, bonus, registro, adiados: d.adiados || {}, excluidos: d.excluidos || {},
        anki: d.anki || {}, bonusAdiado: d.bonusAdiado || {} };
}
// comparação independente da ordem das chaves (a nuvem devolve os campos em outra ordem)
const estavel = (v) => v && typeof v === "object"
    ? (Array.isArray(v) ? "[" + v.map(estavel).join(",") + "]"
        : "{" + Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => JSON.stringify(k) + ":" + estavel(v[k])).join(",") + "}")
    : JSON.stringify(v === undefined ? null : v);
const igual = (a, b) => estavel(a) === estavel(b);
const BANDEIRAS = ["bonusPerguntado", "revisar"]; // marcas simples de cada semana do registro
// diferença entre dois estados em formato de nuvem -> patch para setDoc(merge)
// devolve um patch, ou uma lista de patches quando um campo precisa de duas gravações (remover e acrescentar)
function diferenca(ant, nov, F) {
    const p = {}, depois = [];
    let n = 0;
    const put = (k, sub, v) => { (p[k] || (p[k] = {}))[sub] = v; n++; };
    // mapas id → valor: grava campo a campo; "apagaveis" também remove as chaves que sumiram
    const difMapa = (nome, apagavel) => {
        const va = ant[nome] || {}, vb = nov[nome] || {};
        const chaves = apagavel ? Object.keys({ ...va, ...vb }) : Object.keys(vb);
        chaves.forEach((id) => {
            if (igual(va[id], vb[id]))
                return;
            put(nome, id, vb[id] === undefined ? F.deleteField() : vb[id]);
        });
    };
    ["cfg", "adiados", "bonusAdiado"].forEach((m) => difMapa(m, true));
    ["blocos", "bonus", "anki"].forEach((m) => difMapa(m, false));
    Object.keys(nov.excluidos).forEach((k) => {
        const a = ant.excluidos[k] || [], b = nov.excluidos[k] || [];
        const add = b.filter((x) => !a.includes(x));
        if (add.length)
            put("excluidos", k, F.arrayUnion(...add));
    });
    Object.keys(nov.registro).forEach((k) => {
        const a = ant.registro[k], b = nov.registro[k], r = {};
        const mapas = (x, y) => ["auto", "manual"].forEach((m) => {
            const va = (x && x[m]) || {}, vb = y[m] || {}, sub = {};
            Object.keys({ ...va, ...vb }).forEach((id) => { if (!igual(va[id], vb[id]))
                sub[id] = vb[id] === undefined ? F.deleteField() : vb[id]; });
            if (Object.keys(sub).length)
                r[m] = sub;
        });
        BANDEIRAS.forEach((f) => { if (b[f] !== undefined && (!a || a[f] !== b[f]))
            r[f] = b[f]; });
        if (!a) {
            r.planejados = b.planejados;
            r.fechada = b.fechada;
            if (b.feitos.length)
                r.feitos = F.arrayUnion(...b.feitos);
            mapas(null, b);
        }
        else {
            mapas(a, b);
            if (!igual(a.planejados, b.planejados))
                r.planejados = b.planejados;
            if (a.fechada !== b.fechada)
                r.fechada = b.fechada;
            const add = b.feitos.filter((x) => !a.feitos.includes(x));
            const rem = a.feitos.filter((x) => !b.feitos.includes(x));
            if (rem.length)
                r.feitos = F.arrayRemove(...rem);
            if (add.length) {
                if (rem.length)
                    depois.push([k, F.arrayUnion(...add)]);
                else
                    r.feitos = F.arrayUnion(...add);
            }
        }
        if (Object.keys(r).length)
            put("registro", k, r);
    });
    if (!n)
        return null;
    return depois.length ? [p, ...depois.map(([k, v]) => ({ registro: { [k]: { feitos: v } } }))] : p;
}
const VAZIO_NUVEM = { cfg: {}, blocos: {}, bonus: {}, registro: {}, adiados: {}, excluidos: {}, anki: {}, bonusAdiado: {} };
const Sync = {
    status: "local", user: null, erro: "", pendente: false,
    _ouvintes: new Set(), _fb: null, _db: null, _auth: null, _unsub: null, _ref: null,
    _ultimo: null, _aoReceber: null, _obterLocal: null, _mesclar: false, _adotar: false,
    // último estado em comum com a nuvem, guardado no aparelho por conta: é a base para mandar à nuvem
    // o que foi alterado aqui enquanto não havia sincronização (Firebase fora do ar, ou antes do 1º retorno)
    _chaveBase() { return "estudos:base:" + (this.user ? this.user.uid : ""); },
    _base(v) { this._ultimo = v; if (this.user)
        lsSet(this._chaveBase(), JSON.stringify(v)); },
    _gravar(p) {
        const F = this._fb, t = { atualizadoEm: Date.now() };
        if (!Array.isArray(p))
            return F.setDoc(this._ref, { ...p, ...t }, { merge: true });
        // remover e acrescentar no mesmo campo: um lote só, aplicado em ordem e guardado inteiro na fila offline
        const lote = F.writeBatch(this._db);
        p.forEach((x) => lote.set(this._ref, { ...x, ...t }, { merge: true }));
        return lote.commit();
    },
    on(fn) { this._ouvintes.add(fn); return () => this._ouvintes.delete(fn); },
    _emit() {
        const s = { status: this.status, user: this.user, erro: this.erro, pendente: this.pendente };
        this._ouvintes.forEach((f) => f(s));
    },
    _set(o) { Object.assign(this, o); this._emit(); },
    async iniciar({ aoReceber, obterLocal }) {
        this._aoReceber = aoReceber;
        this._obterLocal = obterLocal;
        const conf = window.FIREBASE_CONFIG;
        if (!conf || !conf.apiKey) {
            this._set({ status: "local" });
            return;
        }
        this._set({ status: "conectando" });
        try {
            const [app, auth, fs] = await Promise.all([import(FB_URL("app")), import(FB_URL("auth")), import(FB_URL("firestore"))]);
            this._fb = { ...app, ...auth, ...fs };
            const fbApp = app.initializeApp(conf);
            this._db = fs.initializeFirestore(fbApp, {
                localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() })
            });
            this._auth = auth.getAuth(fbApp);
            auth.onAuthStateChanged(this._auth, (u) => this._aoLogar(u));
        }
        catch (e) {
            this._set({ status: "indisponivel", erro: "Não foi possível carregar o Firebase. Abra o app uma vez com internet." });
        }
    },
    _aoLogar(u) {
        if (this._unsub) {
            this._unsub();
            this._unsub = null;
        }
        if (!u) {
            this._set({ user: null, status: "deslogado" });
            return;
        }
        const F = this._fb;
        this._ref = F.doc(this._db, "usuarios", u.uid, "estado", "app");
        this._set({ user: { uid: u.uid, email: u.email || "", nome: u.displayName || "" }, status: "sincronizando" });
        this._ultimo = null;
        this._mesclar = true;
        const chaveVinculo = "estudos:vinculo";
        this._unsub = F.onSnapshot(this._ref, { includeMetadataChanges: true }, async (snap) => {
            const pend = snap.metadata.hasPendingWrites;
            const st = () => this._set({ pendente: pend,
                status: !navigator.onLine ? "offline" : pend ? "enviando" : snap.metadata.fromCache ? "sincronizando" : "sincronizado" });
            if (!snap.exists()) {
                if (snap.metadata.fromCache) {
                    st();
                    return;
                } // ainda não sabemos se existe na nuvem
                // primeira vez nesta conta: envia o estado deste aparelho
                const local = paraNuvem(this._obterLocal());
                this._base(local);
                this._mesclar = false;
                lsSet(chaveVinculo, u.uid);
                await this._gravar(diferenca(VAZIO_NUVEM, local, F));
                return;
            }
            if (lsGet(chaveVinculo) !== u.uid) {
                // aparelho entrando numa conta que já tem dados
                if (snap.metadata.fromCache) {
                    st();
                    return;
                }
                const local = paraNuvem(this._obterLocal());
                const remoto = paraNuvem(daNuvem(snap.data()));
                lsSet(chaveVinculo, u.uid);
                this._mesclar = false;
                if (!igual(paraNuvem(daNuvem(local)), remoto) && !window.confirm("Esta conta já tem progresso salvo na nuvem.\n\nOK: usar o progresso da nuvem neste aparelho.\n" +
                    "Cancelar: substituir a nuvem pelo progresso deste aparelho.")) {
                    this._base(local);
                    const p = diferenca(remoto, local, F);
                    if (p)
                        await this._gravar(p);
                    return;
                }
            }
            if (this._mesclar) {
                // primeiro retorno da nuvem nesta sessão: o que mudou aqui desde a última sincronização vai antes,
                // como diferença campo a campo; a nuvem combina e o próximo retorno já traz tudo junto
                this._mesclar = false;
                let base = null;
                try {
                    base = JSON.parse(lsGet(this._chaveBase()) || "null");
                }
                catch { }
                const p = base ? diferenca(base, paraNuvem(this._obterLocal()), F) : null;
                if (p) {
                    this._base(paraNuvem(this._obterLocal()));
                    this._adotar = true; // alterações daqui seguem normalmente
                    this._gravar(p).catch((e) => this._set({ status: "erro", erro: e.code || String(e) }));
                    st();
                    return;
                }
            }
            const est = daNuvem(snap.data());
            // eco das nossas gravações ainda não confirmadas: não reaplica (salvo o primeiro depois da mesclagem)
            if (pend && this._ultimo && !this._adotar) {
                st();
                return;
            }
            this._mesclar = false;
            this._adotar = false;
            this._base(paraNuvem(est));
            this._aoReceber(est);
            st();
        }, (e) => this._set({ status: "erro", erro: e.code || String(e) }));
    },
    enviar(estado) {
        if (!this._ref || !this._ultimo || !this.user)
            return;
        const ant = this._ultimo, nov = paraNuvem(estado);
        const p = diferenca(ant, nov, this._fb);
        if (!p)
            return;
        this._base(nov);
        this._set({ pendente: true, status: navigator.onLine ? "enviando" : "offline" });
        this._gravar(p).catch((e) => {
            if (this._ultimo === nov)
                this._base(ant); // volta a base: a próxima alteração reenvia esta também
            this._set({ status: "erro", erro: e.code || String(e) });
        });
    },
    async entrarGoogle() {
        const F = this._fb;
        if (!F)
            return;
        try {
            await F.signInWithPopup(this._auth, new F.GoogleAuthProvider());
        }
        catch (e) {
            this._set({ erro: traduzErro(e) });
        }
    },
    async entrarEmail(email, senha, criar) {
        const F = this._fb;
        if (!F)
            return;
        try {
            if (criar)
                await F.createUserWithEmailAndPassword(this._auth, email, senha);
            else
                await F.signInWithEmailAndPassword(this._auth, email, senha);
        }
        catch (e) {
            this._set({ erro: traduzErro(e) });
        }
    },
    async sair() { if (this._auth) {
        await this._fb.signOut(this._auth);
        lsSet("estudos:vinculo", "");
        this._ultimo = null;
    } },
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
        window.addEventListener("online", f);
        window.addEventListener("offline", f);
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
const ANKI_PADRAO = { ativo: false, url: "http://127.0.0.1:8765", baralhos: [] };
const ankiLocal = () => { try {
    return { ...ANKI_PADRAO, ...JSON.parse(lsGet(ANKI_LOCAL) || "{}") };
}
catch {
    return { ...ANKI_PADRAO };
} };
const salvarAnkiLocal = (o) => lsSet(ANKI_LOCAL, JSON.stringify(o));
const Anki = {
    async chamar(url, action, params = {}) {
        let r;
        try {
            // corpo como texto simples: evita a requisição prévia de CORS
            r = await fetch(url, { method: "POST", body: JSON.stringify({ action, version: 6, params }) });
        }
        catch {
            throw new Error("Anki não encontrado. Abra o Anki no computador e confira o AnkiConnect (veja o LEIA-ME).");
        }
        const j = await r.json();
        if (j.error)
            throw new Error("AnkiConnect: " + j.error);
        return j.result;
    },
    async baralhos(url) {
        const nomes = await this.chamar(url, "deckNames");
        // só baralhos-folha (sem subbaralhos), que correspondem aos tópicos
        return nomes.filter((n) => n !== "Default" && !nomes.some((m) => m.startsWith(n + "::"))).sort();
    },
    async ler(url, mapa, diasSemana) {
        const ids = Object.keys(mapa).filter((k) => (mapa[k] || []).length);
        if (!ids.length)
            return {};
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
        if (MATERIA_AREA[t])
            return MATERIA_AREA[t];
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
    if (a === b)
        return true;
    if (a.length >= 7 && b.length >= 7)
        return a.slice(0, 7) === b.slice(0, 7);
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
    // aulas que contêm cada palavra (calculado uma vez por palavra: os baralhos repetem muito as mesmas)
    const cobertura = new Map();
    const aulasCom = (u) => {
        if (!cobertura.has(u))
            cobertura.set(u, new Set(textos.flatMap((x, i) => (x.pal.some((t) => mesmo(t, u)) ? [i] : []))));
        return cobertura.get(u);
    };
    // palavras raras pesam mais; palavras que não aparecem em nenhuma aula não ajudam a escolher e pesam o mínimo
    const peso = (u) => { const df = aulasCom(u).size; return df === 0 ? 0.2 : Math.log(1 + N / df); };
    const mapa = {};
    baralhos.forEach((d) => {
        const B = tokens(d.split("::").pop());
        const rB = B.filter((t) => ROMANOS.has(t)), pal = [...new Set(B.filter((t) => !ROMANOS.has(t)))];
        if (!pal.length)
            return;
        const pesos = pal.map(peso), totalPeso = pesos.reduce((a, x) => a + x, 0);
        const area = areaDoBaralho(d);
        const notas = textos.map((x, i) => {
            if (area && x.b.area !== area)
                return [x.b, 0];
            if (rB.length && x.romanos.length && rB.join() !== x.romanos.join())
                return [x.b, 0];
            const cob = pal.reduce((a, u, k) => a + (aulasCom(u).has(i) ? pesos[k] : 0), 0) / totalPeso;
            return [x.b, cob];
        });
        const max = Math.max(0, ...notas.map((x) => x[1]));
        if (max < 0.5)
            return;
        notas.filter((x) => x[1] >= max - 0.001).forEach(([b]) => { var _a; (mapa[_a = b.id] || (mapa[_a] = [])); if (!mapa[b.id].includes(d))
            mapa[b.id].push(d); });
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
        if (!("serviceWorker" in navigator))
            return;
        try {
            this.reg = await navigator.serviceWorker.register("./sw.js");
            const vigiar = (w) => w && w.addEventListener("statechange", () => {
                if (w.state === "installed" && navigator.serviceWorker.controller) {
                    this.esperando = w;
                    this._emit();
                }
            });
            if (this.reg.waiting && navigator.serviceWorker.controller) {
                this.esperando = this.reg.waiting;
                this._emit();
            }
            this.reg.addEventListener("updatefound", () => vigiar(this.reg.installing));
            let recarregou = false;
            const tinhaVersao = !!navigator.serviceWorker.controller;
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if ((tinhaVersao || this.pediu) && !recarregou) {
                    recarregou = true;
                    location.reload();
                }
            });
            setInterval(() => this.reg && this.reg.update().catch(() => { }), 60 * 60 * 1000);
        }
        catch { }
    },
    aplicar() { if (this.esperando) {
        this.pediu = true;
        this.esperando.postMessage("PULAR_ESPERA");
    } },
    async verificar() {
        let remota = null;
        try {
            remota = await (await fetch("./version.json?t=" + Date.now(), { cache: "no-store" })).json();
        }
        catch { }
        try {
            if (this.reg)
                await this.reg.update();
        }
        catch { }
        return remota;
    },
};
function useAtualizacao() {
    const [tem, setTem] = useState(!!Atualizador.esperando);
    useEffect(() => Atualizador.on(setTem), []);
    return tem;
}
// data de hoje (São Paulo) que se atualiza sozinha: ao voltar para o app e a cada minuto
function useHoje() {
    const [h, setH] = useState(hojeISO);
    useEffect(() => {
        const f = () => setH(hojeISO());
        const t = setInterval(f, 60 * 1000);
        document.addEventListener("visibilitychange", f);
        return () => { clearInterval(t); document.removeEventListener("visibilitychange", f); };
    }, []);
    return h;
}
const paraRegistro = (i) => ({ id: i.id, tipo: i.tipo, tema: i.tema, rotulo: i.rotulo, peso: i.peso, semana: i.semana });
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
    const hoje = useHoje();
    const segAtual = sabado(hoje);
    const sync = useSync();
    const temAtualizacao = useAtualizacao();
    const atual = useRef(null);
    atual.current = { blocos, bonus, cfg, registro, adiados, excluidos, anki, bonusAdiado };
    const aplicarEstado = useCallback((d) => {
        setCfg(d.cfg);
        setBlocos(d.blocos);
        setBonus(d.bonus);
        setRegistro(d.registro);
        setAdiados(d.adiados);
        setExcluidos(d.excluidos);
        setAnki(d.anki || {});
        setBonusAdiado(d.bonusAdiado || {});
    }, []);
    useEffect(() => {
        (async () => {
            const d = await load(KEY, null);
            const c = { ...DEFAULT_CFG, ...(d?.cfg || {}) };
            setCfg(c);
            setBlocos(d?.blocos?.length ? d.blocos : seed(c, hoje));
            setBonus(d?.bonus?.length ? d.bonus : seedBonus());
            setRegistro(d?.registro || {});
            setAdiados(d?.adiados || {});
            setExcluidos(d?.excluidos || {});
            setAnki(d?.anki || {});
            setBonusAdiado(d?.bonusAdiado || {});
            setPronto(true);
        })();
        Atualizador.registrar();
    }, []);
    useEffect(() => {
        if (!pronto)
            return;
        Sync.iniciar({ aoReceber: aplicarEstado, obterLocal: () => atual.current });
    }, [pronto]);
    useEffect(() => {
        if (!pronto)
            return;
        const est = { blocos, bonus, cfg, registro, adiados, excluidos, anki, bonusAdiado };
        save(KEY, est);
        Sync.enviar(est);
    }, [blocos, bonus, cfg, registro, adiados, excluidos, anki, bonusAdiado, pronto]);
    useEffect(() => {
        if (!pronto)
            return;
        const abertas = Object.keys(registro).filter((k) => k < segAtual && !registro[k].fechada);
        if (!abertas.length)
            return;
        const nAd = { ...adiados }, nReg = { ...registro };
        abertas.forEach((k) => {
            const faltam = registro[k].planejados.filter((p) => !registro[k].feitos.includes(p.id));
            faltam.forEach((p) => { nAd[p.id] = (nAd[p.id] || 0) + 1; });
            nReg[k] = { ...registro[k], fechada: true, revisar: faltam.length > 0 };
        });
        setAdiados(nAd);
        setRegistro(nReg);
    }, [pronto, segAtual, registro, adiados]);
    const fora = useMemo(() => new Set(excluidos[segAtual] || []), [excluidos, segAtual]);
    const regAtual = registro[segAtual];
    const jaFeito = useMemo(() => {
        const f = new Set(regAtual ? regAtual.feitos : []), l = regAtual ? regAtual.planejados.filter((p) => f.has(p.id)) : [];
        return { pontos: l.reduce((a, p) => a + (p.peso || 0), 0), nRev: l.filter((p) => p.tipo === "revisao").length,
            nBns: l.filter((p) => p.tipo === "bonus").length };
    }, [regAtual]);
    const plano = useMemo(() => construir(blocos, bonus, cfg, hoje, adiados, fora, bonusAdiado, jaFeito), [blocos, bonus, cfg, hoje, adiados, fora, bonusAdiado, jaFeito]);
    const sem0 = plano.semanas[0];
    // O registro da semana acompanha o plano: entra o que passou a caber, sai o que não está mais na semana
    // (o que já foi feito fica). Só depois que a virada terminou de fechar semanas e avançar o extensivo.
    const disputa = useRef({ ids: "", em: 0, ate: 0 });
    const viradaPronta = !Object.keys(registro).some((k) => k < segAtual && !registro[k].fechada)
        && (!cfg.semanaBaseSeg || cfg.semanaBaseSeg >= segAtual);
    useEffect(() => {
        if (!pronto || !sem0 || !viradaPronta)
            return;
        const s = registro[segAtual];
        if (!s) {
            setRegistro((r) => ({ ...r, [segAtual]: { planejados: sem0.itens.map(paraRegistro), feitos: [], fechada: false, auto: {}, manual: {} } }));
            return;
        }
        const feitos = new Set(s.feitos), noPlano = new Set(sem0.itens.map((i) => i.id));
        let manter = s.planejados.filter((p) => feitos.has(p.id) || noPlano.has(p.id));
        // Um aparelho ainda na versão anterior devolve o que esta tira. Se as mesmas remoções voltarem em menos de
        // um minuto, para de disputar por 10 minutos (evita gravações sem fim) até o outro aparelho atualizar.
        const tirar = s.planejados.filter((p) => !manter.includes(p)).map((p) => p.id).sort().join();
        if (tirar) {
            const g = disputa.current, agora = Date.now();
            if (agora < g.ate)
                manter = s.planejados;
            else if (tirar === g.ids && agora - g.em < 60000) {
                g.ate = agora + 10 * 60000;
                manter = s.planejados;
            }
            else {
                g.ids = tirar;
                g.em = agora;
            }
        }
        const tem = new Set(manter.map((p) => p.id));
        const novas = sem0.itens.filter((i) => !tem.has(i.id)).map(paraRegistro);
        if (!novas.length && manter.length === s.planejados.length)
            return;
        setRegistro((r) => ({ ...r, [segAtual]: { ...r[segAtual], planejados: [...manter, ...novas] } }));
    }, [pronto, sem0, registro, segAtual, viradaPronta]);
    // origem: "manual" (toque do usuário) ou "auto" (leitura do Anki)
    const concluir = useCallback((item, origem = "manual") => {
        setRegistro((r) => {
            const s = r[segAtual] || { planejados: [], feitos: [], fechada: false };
            const auto = { ...(s.auto || {}) }, manual = { ...(s.manual || {}) };
            if (item.tipo === "revisao") {
                if (origem === "auto") {
                    auto[item.id] = Date.now();
                    delete manual[item.id];
                }
                else {
                    manual[item.id] = { v: true };
                    delete auto[item.id];
                }
            }
            if (s.feitos.includes(item.id))
                return { ...r, [segAtual]: { ...s, auto, manual } };
            // marcar também degraus anteriores da mesma aula que estejam no checklist
            const antes = item.blocoId ? s.planejados
                .filter((p) => String(p.id).startsWith(item.blocoId + ":")
                && Number(String(p.id).split(":")[1]) < item.etapaItem && !s.feitos.includes(p.id))
                .map((p) => p.id) : [];
            return { ...r, [segAtual]: { ...s, auto, manual, feitos: [...s.feitos, ...antes, item.id] } };
        });
        setAdiados((a) => { if (!a[item.id])
            return a; const n = { ...a }; delete n[item.id]; return n; });
        if (item.tipo === "bonus")
            setBonus((bs) => bs.map((x) => x.id === item.id ? { ...x, feito: true } : x));
        else
            setBlocos((bs) => bs.map((b) => (b.id === item.blocoId ? avancarBloco(b, item.etapaItem, hoje) : b)));
    }, [segAtual, hoje]);
    // modo: "pendencia" devolve ao checklist da semana; "remover" tira a meta desta semana
    const desfazer = useCallback((entrada, modo, origem = "manual") => {
        setRegistro((r) => {
            const s = r[segAtual];
            if (!s)
                return r;
            const [bid, et] = String(entrada.id).split(":");
            const feitos = s.feitos.filter((x) => x !== entrada.id
                && !(et !== undefined && String(x).split(":")[0] === bid && Number(String(x).split(":")[1]) > Number(et)));
            const planejados = modo === "remover" ? s.planejados.filter((p) => p.id !== entrada.id) : s.planejados;
            const auto = { ...(s.auto || {}) }, manual = { ...(s.manual || {}) };
            delete auto[entrada.id];
            if (entrada.tipo === "revisao") {
                // desmarcação manual vale até haver revisão nova no Anki daquele baralho
                const st = (atual.current.anki || {})[String(entrada.id).split(":")[0]];
                if (origem === "manual")
                    manual[entrada.id] = { v: false, rev: st ? st.rev : 0 };
                else
                    delete manual[entrada.id];
            }
            return { ...r, [segAtual]: { ...s, feitos, planejados, auto, manual } };
        });
        if (modo === "remover")
            setExcluidos((e) => ({ ...e, [segAtual]: [...(e[segAtual] || []), entrada.id] }));
        if (entrada.tipo === "bonus")
            setBonus((bs) => bs.map((x) => x.id === entrada.id ? { ...x, feito: false } : x));
        else {
            const [blocoId, e] = String(entrada.id).split(":");
            const et = Number(e);
            setBlocos((bs) => bs.map((b) => (b.id === blocoId ? voltarBloco(b, et) : b)));
        }
    }, [segAtual]);
    // Painel da virada: registra na semana que fechou o que foi feito e ficou sem marcar.
    // Desfaz o adiamento que o fechamento aplicou e avança o tema com a data do último dia daquela semana.
    const pendentesDaVirada = useMemo(() => {
        const anterior = addDays(segAtual, -7);
        const k = Object.keys(registro).sort().find((x) => {
            const r = registro[x];
            // semanas fechadas antes desta versão (sem a marca) só entram se forem a imediatamente anterior
            return x < segAtual && r.fechada && (r.revisar === true || (r.revisar === undefined && x === anterior));
        });
        if (!k)
            return null;
        const r = registro[k], bl = Object.fromEntries(blocos.map((b) => [b.id, b])), bx = Object.fromEntries(bonus.map((b) => [b.id, b]));
        const aberto = (p) => {
            if (r.feitos.includes(p.id))
                return false;
            if (p.tipo === "bonus")
                return !!bx[p.id] && !bx[p.id].feito;
            const [bid, e] = String(p.id).split(":");
            return !!bl[bid] && bl[bid].etapa <= Number(e);
        };
        return { k, itens: r.planejados.filter(aberto) };
    }, [registro, blocos, bonus, segAtual]);
    const fecharVirada = useCallback((k, ids) => {
        const r0 = atual.current.registro[k];
        if (!r0)
            return;
        // marcar um degrau inclui os anteriores do mesmo tema que estavam na semana
        const todos = new Set(ids);
        ids.forEach((id) => {
            const [bid, e] = String(id).split(":");
            r0.planejados.forEach((p) => {
                const [pb, pe] = String(p.id).split(":");
                if (e !== undefined && pb === bid && Number(pe) < Number(e) && !r0.feitos.includes(p.id))
                    todos.add(p.id);
            });
        });
        const lista = [...todos], quando = addDays(k, 6) < hoje ? addDays(k, 6) : hoje;
        setRegistro((r) => ({ ...r, [k]: { ...r[k], revisar: false, feitos: [...new Set([...r[k].feitos, ...lista])] } }));
        if (!lista.length)
            return;
        setAdiados((a) => {
            const n = { ...a };
            lista.forEach((id) => { if (n[id] > 1)
                n[id]--;
            else
                delete n[id]; });
            return n;
        });
        setBonus((bs) => bs.map((x) => (todos.has(x.id) ? { ...x, feito: true } : x)));
        setBlocos((bs) => bs.map((b) => {
            const es = lista.filter((id) => String(id).split(":")[0] === b.id).map((id) => Number(String(id).split(":")[1]));
            return es.length ? avancarBloco(b, Math.max(...es), quando) : b;
        }));
    }, [hoje]);
    // se tudo da semana que fechou já foi resolvido (p. ex. em outro aparelho), o painel nem aparece
    useEffect(() => {
        if (pronto && pendentesDaVirada && !pendentesDaVirada.itens.length)
            fecharVirada(pendentesDaVirada.k, []);
    }, [pronto, pendentesDaVirada, fecharVirada]);
    const [viradaDepois, setViradaDepois] = useState(false);
    // Mapa: correção do estado de um tema. Não conta pontos na semana, mas mantém checklist e adiadas coerentes.
    const recuar = useCallback((id) => {
        const b = atual.current.blocos.find((x) => x.id === id);
        if (!b || b.etapa === 0)
            return;
        const et = b.etapa - 1;
        const novos = atual.current.blocos.map((x) => (x.id === id ? voltarBloco(x, et) : x));
        atual.current.blocos = novos;
        setBlocos(novos);
        setRegistro((r) => {
            const s = r[segAtual];
            if (!s)
                return r;
            const feitos = s.feitos.filter((x) => !(String(x).split(":")[0] === id && Number(String(x).split(":")[1]) >= et));
            return feitos.length === s.feitos.length ? r : { ...r, [segAtual]: { ...s, feitos } };
        });
    }, [segAtual]);
    const avancar = useCallback((id) => {
        const b = atual.current.blocos.find((x) => x.id === id);
        if (!b || b.etapa >= CONCLUIDO)
            return;
        const novos = atual.current.blocos.map((x) => (x.id === id ? avancarBloco(x, x.etapa, hoje) : x));
        atual.current.blocos = novos;
        setBlocos(novos);
        setAdiados((a) => { const k = id + ":" + b.etapa; if (!a[k])
            return a; const n = { ...a }; delete n[k]; return n; });
    }, [hoje]);
    // A semana do extensivo avança junto com o calendário, sem precisar editar nada.
    useEffect(() => {
        if (!pronto || !cfg.semanaBaseSeg)
            return;
        const passos = Math.floor(diffDays(cfg.semanaBaseSeg, segAtual) / 7);
        if (passos <= 0)
            return;
        const nova = semanaDepoisDe(cfg.semanaAtual, passos);
        setCfg((c) => ({ ...c, semanaAtual: nova, semanaBaseSeg: segAtual }));
    }, [pronto, segAtual, cfg.semanaAtual, cfg.semanaBaseSeg]);
    // Troca das aulas bônus da semana: as escolhidas saem para o fim da fila e entram
    // outras, do mesmo nível de estrelas enquanto houver.
    const marcarPerguntado = useCallback(() => setRegistro((r) => {
        const s = r[segAtual];
        if (!s || s.bonusPerguntado)
            return r;
        return { ...r, [segAtual]: { ...s, bonusPerguntado: true } };
    }), [segAtual]);
    const trocarBonus = useCallback((ids) => {
        if (!ids.length) {
            marcarPerguntado();
            return;
        }
        const volta = addDays(segAtual, 7 * Math.max(1, cfg.semanasAdiamentoBonus));
        setBonusAdiado((b) => { const n = { ...b }; ids.forEach((id) => { n[id] = volta; }); return n; });
        setRegistro((r) => {
            const s = r[segAtual];
            if (!s)
                return r;
            return { ...r, [segAtual]: { ...s, bonusPerguntado: true,
                    planejados: s.planejados.filter((p) => !ids.includes(p.id)),
                    feitos: s.feitos.filter((x) => !ids.includes(x)) } };
        });
    }, [segAtual, cfg.semanasAdiamentoBonus, marcarPerguntado]);
    // leitura do Anki (só no aparelho em que ela foi ativada)
    const [ankiMsg, setAnkiMsg] = useState("");
    const lerAnki = useCallback(async () => {
        const loc = ankiLocal();
        if (!loc.ativo)
            return false;
        const mapa = atual.current.cfg.ankiMapa || {};
        if (!Object.keys(mapa).some((k) => (mapa[k] || []).length)) {
            setAnkiMsg("Nenhum baralho associado ainda.");
            return false;
        }
        try {
            const dias = Math.min(365, diffDays(sabado(hojeISO()), hojeISO()) + 1);
            const r = await Anki.ler(loc.url, mapa, dias);
            setAnki((a) => ({ ...a, ...r }));
            setAnkiMsg("Última leitura do Anki: " + horaCurta(Date.now()) + ".");
            return true;
        }
        catch (e) {
            setAnkiMsg(e.message);
            return false;
        }
    }, []);
    useEffect(() => {
        if (!pronto)
            return;
        lerAnki();
        const t = setInterval(() => { if (document.visibilityState === "visible")
            lerAnki(); }, 5 * 60 * 1000);
        const v = () => { if (document.visibilityState === "visible")
            lerAnki(); };
        document.addEventListener("visibilitychange", v);
        return () => { clearInterval(t); document.removeEventListener("visibilitychange", v); };
    }, [pronto, lerAnki]);
    // Mantém as revisões de flashcards de acordo com o Anki, nos dois sentidos:
    //  - marca quando o baralho zerou e houve revisão desde sábado;
    //  - desmarca (volta às pendências) se uma leitura posterior mostrar cartões vencidos de novo.
    // O que você marcou ou desmarcou à mão nesta semana prevalece sobre a leitura automática.
    const ankiVisto = useRef(new Set());
    useEffect(() => {
        if (!pronto || !cfg.ankiAuto || !sem0)
            return;
        const s = registro[segAtual];
        if (!s)
            return;
        const inicio = parse(segAtual).getTime();
        const feitosSem = new Set(s.feitos || []), auto = s.auto || {}, manual = s.manual || {};
        sem0.itens.forEach((it) => {
            if (it.tipo !== "revisao" || feitosSem.has(it.id))
                return;
            const st = anki[it.blocoId], chave = it.id + ":m:" + (st && st.em), m = manual[it.id];
            if (!st || ankiVisto.current.has(chave))
                return;
            if (m && m.v === false && !(st.rev > (m.rev || 0)))
                return; // desmarcado à mão e sem revisão nova
            if (st.em >= inicio && st.total > 0 && st.pend === 0 && st.rev > 0) {
                ankiVisto.current.add(chave);
                concluir(it, "auto");
            }
        });
        s.planejados.forEach((p) => {
            if (p.tipo !== "revisao" || !feitosSem.has(p.id) || !auto[p.id] || (manual[p.id] && manual[p.id].v === true))
                return;
            const st = anki[String(p.id).split(":")[0]], chave = p.id + ":d:" + (st && st.em);
            if (!st || ankiVisto.current.has(chave))
                return;
            if (st.em > auto[p.id] && st.pend > 0) {
                ankiVisto.current.add(chave);
                desfazer(p, "pendencia", "auto");
            }
        });
    }, [pronto, anki, sem0, registro, segAtual, cfg.ankiAuto, concluir, desfazer]);
    if (!pronto)
        return React.createElement("div", { style: { padding: 24, fontFamily: SANS, color: C.ink2 } }, "Carregando\u2026");
    const abas = [["semana", "Semana"], ["plano", "Plano"], ["bonus", "Bônus"], ["mapa", "Mapa"], ["dados", "Dados"]];
    return (React.createElement("div", { style: { fontFamily: SANS, background: C.base, color: C.ink, minHeight: "100vh" } },
        temAtualizacao && (React.createElement("div", { style: { background: C.tealSoft, borderBottom: `1px solid ${C.teal}`, padding: "10px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } },
            React.createElement("span", { style: { fontSize: 13, color: C.ink } }, "Nova vers\u00E3o dispon\u00EDvel."),
            React.createElement("button", { onClick: () => Atualizador.aplicar(), style: { background: C.teal, color: C.base, border: "none",
                    padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS } }, "Atualizar"))),
        pendentesDaVirada && pendentesDaVirada.itens.length > 0 && !viradaDepois && (React.createElement(PainelVirada, { k: pendentesDaVirada.k, itens: pendentesDaVirada.itens, fechar: fecharVirada, depois: () => setViradaDepois(true) })),
        React.createElement(Cabecalho, { plano: plano, cfg: cfg, blocos: blocos, hoje: hoje, registro: registro, segAtual: segAtual, sync: sync }),
        React.createElement("div", { style: { padding: "0 14px 96px" } },
            aba === "semana" && React.createElement(Semana, { plano: plano, cfg: cfg, registro: registro, segAtual: segAtual, concluir: concluir, desfazer: desfazer, anki: anki, trocarBonus: trocarBonus, manterBonus: marcarPerguntado, bonusAdiado: bonusAdiado }),
            aba === "plano" && React.createElement(PlanoSemanal, { plano: plano, segAtual: segAtual, cfg: cfg }),
            aba === "bonus" && React.createElement(Bonus, { bonus: bonus, cfg: cfg, setCfg: setCfg, toggle: (id) => setBonus((bs) => bs.map((x) => x.id === id ? { ...x, feito: !x.feito } : x)) }),
            aba === "mapa" && React.createElement(Mapa, { blocos: blocos, recuar: recuar, avancar: avancar, cfg: cfg, adiados: adiados }),
            aba === "dados" && React.createElement(Dados, { estado: atual.current, aplicarEstado: aplicarEstado, setCfg: setCfg, setBlocos: setBlocos, setAdiados: setAdiados, plano: plano, hoje: hoje, sync: sync, lerAnki: lerAnki, ankiMsg: ankiMsg })),
        React.createElement("nav", { style: { position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", background: C.surface, borderTop: `1px solid ${C.line}`, zIndex: 20 } }, abas.map(([k, l]) => (React.createElement("button", { key: k, onClick: () => setAba(k), style: {
                flex: 1, padding: "12px 2px 16px", border: "none", background: "none", fontFamily: SANS, fontSize: 11.5,
                cursor: "pointer", color: aba === k ? C.teal : C.ink2, fontWeight: aba === k ? 650 : 450,
                borderTop: aba === k ? `2px solid ${C.teal}` : "2px solid transparent", marginTop: -1
            } }, l))))));
}
/* ---------- CABEÇALHO ---------- */
function Anel({ pct, tamanho = 84, traco = 7, rotulo }) {
    const r = (tamanho - traco) / 2, circ = 2 * Math.PI * r;
    return (React.createElement("svg", { width: tamanho, height: tamanho, style: { display: "block", margin: "0 auto" } },
        React.createElement("circle", { cx: tamanho / 2, cy: tamanho / 2, r: r, fill: "none", stroke: "#33414D", strokeWidth: traco }),
        React.createElement("circle", { cx: tamanho / 2, cy: tamanho / 2, r: r, fill: "none", stroke: C.tealClaro, strokeWidth: traco, strokeDasharray: `${circ * pct} ${circ}`, strokeLinecap: "round", transform: `rotate(-90 ${tamanho / 2} ${tamanho / 2})` }),
        React.createElement("text", { x: "50%", y: "47%", textAnchor: "middle", dy: "0.1em", fill: C.ink, fontSize: "21", fontFamily: SERIF }, rotulo),
        React.createElement("text", { x: "50%", y: "68%", textAnchor: "middle", fill: C.ink2, fontSize: "9.5", fontFamily: SANS, letterSpacing: "0.08em" }, "PONTOS")));
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
    return (React.createElement("header", { style: { background: C.noite, padding: "18px 16px 16px", textAlign: "center" } },
        React.createElement("h1", { style: { fontFamily: SERIF, fontSize: 25, fontWeight: 400, margin: 0, lineHeight: 1.15,
                letterSpacing: "-0.01em", color: C.ink } }, "Planejamento de Estudos"),
        React.createElement("div", { style: { fontSize: 15, marginTop: 10, color: C.tealClaro, fontWeight: 600, letterSpacing: "0.02em" } },
            "Semana ",
            cfg.semanaAtual),
        React.createElement("div", { style: { fontSize: 11.5, color: C.ink2, marginTop: 3 } }, rotuloSemana(segAtual)),
        sync && (() => {
            const [t, cor] = ROTULO_SYNC[sync.status] || ROTULO_SYNC.local;
            return (React.createElement("div", { style: { fontSize: 10.5, color: cor, marginTop: 5, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 } },
                React.createElement("span", { style: { width: 6, height: 6, borderRadius: 3, background: cor, display: "inline-block" } }),
                t));
        })(),
        React.createElement("div", { style: { marginTop: 14 } },
            React.createElement(Anel, { pct: pct, rotulo: `${feitos}/${total}` })),
        React.createElement("div", { style: { marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 12 } },
            React.createElement("div", { style: { fontSize: 13.5, lineHeight: 1.4 } }, linha(temasDaSemana(blocos, cfg.semanaAtual))),
            prox && (React.createElement("div", { style: { fontSize: 12, color: C.ink2, marginTop: 7, lineHeight: 1.4 } },
                React.createElement("span", { style: { letterSpacing: "0.06em", textTransform: "uppercase", fontSize: 10 } },
                    "Pr\u00F3xima \u00B7 semana ",
                    prox),
                React.createElement("br", null),
                linha(temasDaSemana(blocos, prox))))),
        React.createElement("div", { style: { display: "flex", gap: 1, marginTop: 14, background: C.line } },
            React.createElement(Caixa, { valor: diffDays(hoje, cfg.dataProva), rot: "dias at\u00E9 a prova" }),
            React.createElement(Caixa, { valor: plano.aulas.length, rot: "aulas restantes" }),
            React.createElement(Caixa, { valor: plano.atrasadas, rot: "revis\u00F5es vencidas" }))));
}
function Caixa({ valor, rot }) {
    return (React.createElement("div", { style: { flex: 1, background: C.noite, padding: "9px 2px 8px" } },
        React.createElement("div", { style: { fontFamily: SERIF, fontSize: 20, lineHeight: 1 } }, valor),
        React.createElement("div", { style: { fontSize: 10, color: C.ink2, marginTop: 4, lineHeight: 1.2 } }, rot)));
}
/* ---------- VIRADA DA SEMANA: o que ficou sem marcar ---------- */
const GRUPOS_VIRADA = [["aula", "Aulas"], ["questoes", "Questões"], ["revisao", "Revisões · flashcards"], ["bonus", "Aulas bônus"]];
function PainelVirada({ k, itens, fechar, depois }) {
    const [sel, setSel] = useState(() => new Set());
    const alterna = (id, v) => setSel((x) => { const n = new Set(x); v ? n.add(id) : n.delete(id); return n; });
    const pts = itens.filter((i) => sel.has(i.id)).reduce((a, i) => a + (i.peso || 0), 0);
    return (React.createElement("div", { role: "dialog", "aria-modal": "true", "aria-label": "Fechamento da semana", style: { position: "fixed", inset: 0, zIndex: 50, background: "rgba(8,12,16,0.78)", display: "flex",
            alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "28px 12px" } },
        React.createElement("div", { style: { background: C.surface, width: "100%", maxWidth: 460, padding: "16px 15px", borderTop: `3px solid ${C.teal}` } },
            React.createElement("div", { style: { fontSize: 11.5, color: C.ink2, textTransform: "uppercase", letterSpacing: "0.05em" } },
                "Semana encerrada \u00B7 ",
                rotuloSemana(k)),
            React.createElement("div", { style: { fontFamily: SERIF, fontSize: 20, margin: "6px 0 4px", lineHeight: 1.25 } }, "Algo foi feito e ficou sem marcar?"),
            React.createElement("div", { style: nota(0) }, "O que voc\u00EA marcar conta para aquela semana e sai das metas redistribu\u00EDdas. O restante segue redistribu\u00EDdo."),
            GRUPOS_VIRADA.map(([t, nome]) => {
                const l = itens.filter((i) => i.tipo === t);
                return l.length > 0 && (React.createElement("div", { key: t, style: { marginTop: 13 } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 } },
                        React.createElement("span", { style: { fontSize: 11, color: C.ink2, textTransform: "uppercase", letterSpacing: "0.04em" } },
                            nome,
                            " \u00B7 ",
                            l.length),
                        React.createElement("button", { onClick: () => { const todas = l.every((i) => sel.has(i.id)); l.forEach((i) => alterna(i.id, !todas)); }, style: { border: "none", background: "none", color: C.teal, fontSize: 11.5, cursor: "pointer", padding: 0 } }, l.every((i) => sel.has(i.id)) ? "desmarcar todas" : "marcar todas")),
                    React.createElement("div", { style: { display: "grid", gap: 8 } }, l.map((i) => (React.createElement(Opcao, { key: i.id, marcada: sel.has(i.id), aoMudar: (v) => alterna(i.id, v), cor: C.teal },
                        React.createElement("span", { style: { lineHeight: 1.35 } },
                            i.tema,
                            React.createElement("span", { style: { color: C.ink2, fontSize: 11.5 } },
                                i.tipo === "revisao" || i.tipo === "questoes" ? ` · ${i.rotulo}` : "",
                                " \u00B7 ",
                                i.peso,
                                " pts"))))))));
            }),
            React.createElement("div", { style: { display: "flex", gap: 7, marginTop: 16, position: "sticky", bottom: -28,
                    background: C.surface, padding: "10px 0 12px", borderTop: `1px solid ${C.line}` } },
                React.createElement("button", { style: { ...BOTAO, flex: 1 }, onClick: () => fechar(k, [...sel]) }, sel.size ? `Registrar ${sel.size} ${sel.size > 1 ? "itens" : "item"} · ${pts} pts` : "Nada a acrescentar"),
                React.createElement("button", { style: { ...BOTAO2, borderColor: C.line, color: C.ink2 }, onClick: depois }, "Agora n\u00E3o")))));
}
/* ---------- SEMANA: quatro checklists ---------- */
function TrocaBonus({ itens, aberto, setAberto, trocar, manter, perguntado }) {
    const [sel, setSel] = useState(() => new Set(itens.map((i) => i.id)));
    useEffect(() => { setSel(new Set(itens.map((i) => i.id))); }, [itens.map((i) => i.id).join()]);
    if (!itens.length)
        return null;
    const alterna = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const BTN = { ...BOTAO2, flex: 1, padding: "9px 8px", fontSize: 12.5, border: `1px solid ${C.star}`, color: C.star };
    if (!aberto) {
        return perguntado ? null : (React.createElement("div", { style: { background: C.surface, borderLeft: `3px solid ${C.star}`, padding: "12px 13px", marginTop: 14 } },
            React.createElement("div", { style: { fontSize: 13.5, lineHeight: 1.45 } }, "Semana nova. Quer trocar as aulas b\u00F4nus sugeridas?"),
            React.createElement("div", { style: nota(6) }, "As trocadas voltam para o fim da fila e entram outras do mesmo n\u00EDvel de estrelas."),
            React.createElement("div", { style: { display: "flex", gap: 7, marginTop: 11 } },
                React.createElement("button", { style: { ...BTN, background: C.star, color: C.base, border: "none" }, onClick: () => setAberto(true) }, "Escolher"),
                React.createElement("button", { style: { ...BTN, borderColor: C.line, color: C.ink2 }, onClick: manter }, "Manter estas"))));
    }
    return (React.createElement("div", { style: { background: C.surface, borderLeft: `3px solid ${C.star}`, padding: "12px 13px", marginTop: 14 } },
        React.createElement("div", { style: { fontSize: 13, marginBottom: 4 } }, "Quais b\u00F4nus trocar?"),
        React.createElement("div", { style: { fontSize: 12, color: C.ink2, marginBottom: 9, lineHeight: 1.5 } }, "Marcadas ser\u00E3o substitu\u00EDdas; as demais continuam na semana."),
        itens.map((i) => (React.createElement("label", { key: i.id, style: { display: "flex", gap: 9, alignItems: "flex-start", padding: "5px 0", cursor: "pointer" } },
            React.createElement("input", { type: "checkbox", checked: sel.has(i.id), onChange: () => alterna(i.id), style: { accentColor: C.star, width: 17, height: 17, marginTop: 2 } }),
            React.createElement("span", { style: { fontSize: 13.5, lineHeight: 1.35 } },
                i.tema,
                React.createElement("span", { style: { color: C.star } },
                    " ",
                    "★".repeat(i.estrelas || 0)),
                React.createElement("span", { style: { color: C.ink2, fontSize: 11.5 } },
                    " \u00B7 semana ",
                    i.semana))))),
        React.createElement("div", { style: { display: "flex", gap: 7, marginTop: 10 } },
            React.createElement("button", { style: { ...BTN, background: C.star, color: C.base, border: "none" }, onClick: () => { trocar([...sel]); setAberto(false); } },
                "Trocar ",
                sel.size === itens.length ? "todas" : `(${sel.size})`),
            React.createElement("button", { style: { ...BTN, borderColor: C.line, color: C.ink2 }, onClick: () => { manter(); setAberto(false); } }, "Cancelar"))));
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
    return (React.createElement("div", null,
        React.createElement(Grafico, { registro: registro, segAtual: segAtual, plano: plano }),
        React.createElement(TrocaBonus, { itens: itens.filter((i) => i.tipo === "bonus"), aberto: trocaAberta, setAberto: setTrocaAberta, trocar: trocarBonus, manter: manterBonus, perguntado: !!s.bonusPerguntado }),
        sem && sem.pontos > sem.cap && (React.createElement("div", { style: { marginTop: 14 } },
            React.createElement(Aviso, null,
                "As aulas desta semana ocupam ",
                sem.pontos,
                " pontos, acima da capacidade de ",
                sem.cap,
                ". Elas t\u00EAm prioridade e ficam na semana; o resto foi adiado. Se isso se repetir, aumente a capacidade em Dados."))),
        React.createElement(SecaoTitulo, { texto: `Checklist da semana · ${feitoPts} de ${sem ? sem.pontos : 0} pontos${sem && sem.fator < 1 ? ` · carga reduzida ${Math.round((1 - sem.fator) * 100)}%` : ""}` }),
        itens.length === 0 && React.createElement(Vazio, { texto: "Semana zerada. Os objetivos da pr\u00F3xima aparecem no s\u00E1bado." }),
        grupos.map(([t, l, cor]) => l.length > 0 && (React.createElement("div", { key: t, style: { marginBottom: 14 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "10px 0 7px" } },
                React.createElement("span", { style: { fontSize: 11.5, color: cor, textTransform: "uppercase", letterSpacing: "0.04em" } }, t),
                React.createElement("span", { style: { fontSize: 11, color: C.ink2 } },
                    t === "Aulas bônus" && !trocaAberta && s.bonusPerguntado && (React.createElement("button", { onClick: () => setTrocaAberta(true), style: { border: "none", background: "none", color: C.star,
                            fontSize: 11, marginRight: 10, cursor: "pointer", padding: 0, textDecoration: "underline" } }, "trocar")),
                    t === "Revisões · flashcards" && ehAndroid() && (React.createElement("a", { href: ABRIR_ANKIDROID, style: { color: C.tealClaro, marginRight: 10, textDecoration: "none" } }, "Abrir AnkiDroid")),
                    l.length,
                    " \u00B7 ",
                    l.reduce((a, i) => a + i.peso, 0),
                    " pts")),
            l.map((it) => React.createElement(Item, { key: it.id, item: it, concluir: concluir, cfg: cfg, anki: anki }))))),
        s.feitos.length > 0 && (React.createElement(React.Fragment, null,
            React.createElement(SecaoTitulo, { texto: `Concluídos nesta semana · ${s.feitos.length}` }),
            React.createElement("div", { style: { background: C.surface, padding: "8px 12px" } }, s.planejados.filter((p) => feitos.has(p.id)).map((p) => (React.createElement(Concluido, { key: p.id, p: p, desfazer: desfazer, peloAnki: !!(s.auto || {})[p.id] }))))))));
}
function Concluido({ p, desfazer, peloAnki }) {
    const [aberto, setAberto] = useState(false);
    const opc = { flex: 1, padding: "7px 8px", fontSize: 12, cursor: "pointer", fontFamily: SANS,
        background: "transparent", border: `1px solid ${C.line}`, color: C.ink2, lineHeight: 1.3 };
    return (React.createElement("div", { style: { padding: "5px 0", borderBottom: aberto ? `1px solid ${C.line}` : "none" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
            React.createElement("button", { onClick: () => setAberto(!aberto), "aria-label": "Op\u00E7\u00F5es", title: "Desfazer marca\u00E7\u00E3o", style: { width: 21, height: 21, flexShrink: 0, cursor: "pointer",
                    border: `1px solid ${aberto ? C.teal : C.line}`, background: "transparent", borderRadius: 4,
                    color: aberto ? C.teal : C.ink2, fontSize: 12, lineHeight: 1, padding: 0 } }, "\u2715"),
            React.createElement("span", { style: { fontSize: 13, color: C.ink2, lineHeight: 1.4, textDecoration: "line-through", flex: 1 } },
                p.tema,
                " ",
                React.createElement("span", { style: { color: C.ink2 } },
                    "\u00B7 ",
                    p.peso,
                    " pts")),
            peloAnki && React.createElement("span", { style: { fontSize: 10.5, color: C.card, whiteSpace: "nowrap" } }, "pelo Anki")),
        aberto && (React.createElement("div", { style: { display: "flex", gap: 7, margin: "8px 0 10px 31px" } },
            React.createElement("button", { style: opc, onClick: () => { desfazer(p, "pendencia"); setAberto(false); } },
                "Voltar \u00E0s pend\u00EAncias",
                React.createElement("br", null),
                React.createElement("span", { style: { color: C.line } }, "fica nesta semana")),
            React.createElement("button", { style: opc, onClick: () => { desfazer(p, "remover"); setAberto(false); } },
                "Tirar da semana",
                React.createElement("br", null),
                React.createElement("span", { style: { color: C.line } }, "reagenda para outra"))))));
}
function LinhaAnki({ item, cfg, anki }) {
    const decks = (cfg.ankiMapa || {})[item.blocoId] || [];
    if (!decks.length)
        return null;
    const st = anki[item.blocoId];
    if (!st)
        return React.createElement("div", { style: { fontSize: 11.5, color: C.ink2, marginTop: 4 } }, "Anki: aguardando leitura no computador");
    const zerado = st.pend === 0;
    return (React.createElement("div", { style: { fontSize: 11.5, marginTop: 4, color: zerado ? C.tealClaro : C.card } },
        "Anki: ",
        zerado ? "nenhum cartão pendente" : `${st.pend} cartões pendentes`,
        st.rev > 0 && React.createElement("span", { style: { color: C.ink2 } },
            " \u00B7 ",
            st.rev,
            " revisados na semana"),
        React.createElement("span", { style: { color: C.ink2 } },
            " \u00B7 lido ",
            horaCurta(st.em))));
}
function Item({ item, concluir, cfg, anki }) {
    const cor = item.tipo === "bonus" ? (item.baixa ? C.pend : C.star)
        : item.tipo === "questoes" ? C.card : item.tipo === "revisao" ? C.tealClaro : areaColor(item.area);
    return (React.createElement("div", { style: { background: C.surface, borderLeft: `3px solid ${item.adiado > 0 ? C.amber : cor}`,
            marginBottom: 7, padding: "10px 12px", display: "flex", gap: 11, alignItems: "flex-start" } },
        React.createElement("button", { onClick: () => concluir(item), "aria-label": "Concluir", style: {
                width: 23, height: 23, flexShrink: 0, marginTop: 1, cursor: "pointer", border: `1.5px solid ${cor}`,
                background: "transparent", borderRadius: 4, color: cor, fontSize: 13.5, lineHeight: 1, padding: 0
            } }, "\u2713"),
        React.createElement("div", { style: { flex: 1, minWidth: 0 } },
            React.createElement("div", { style: { fontSize: 11, color: cor, fontWeight: 600, marginBottom: 2 } },
                "Semana ",
                item.semana,
                " \u00B7 ",
                item.rotulo,
                item.atraso > 0 && React.createElement("span", { style: { color: C.amber } },
                    " \u00B7 ",
                    item.atraso,
                    "d de atraso"),
                item.atrasada && React.createElement("span", { style: { color: C.amber } }, " \u00B7 aula atrasada")),
            React.createElement("div", { style: { fontSize: 14.5, lineHeight: 1.3 } }, item.tema),
            React.createElement("div", { style: { fontSize: 11.5, color: C.ink2, marginTop: 3 } },
                item.peso,
                " pts",
                item.questoes > 0 && item.tipo !== "revisao" && ` · ${item.questoes} questões`,
                item.tipo === "revisao" && item.questoes > 0 && ` · ${item.questoes} questões de apoio`,
                item.adiado > 0 && React.createElement("span", { style: { color: item.adiado >= 3 ? C.red : C.amber } },
                    " \u00B7 adiada ",
                    item.adiado,
                    "\u00D7")),
            item.tipo === "revisao" && cfg && anki && React.createElement(LinhaAnki, { item: item, cfg: cfg, anki: anki }))));
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
    const fimAno = segAtual.slice(0, 4) + "-12-31";
    plano.semanas.slice(1).forEach((s) => {
        if (s.seg > fimAno)
            return;
        dados.push({ k: s.seg, total: s.pontos, feitos: 0, atual: false, previsto: true, fator: s.fator });
    });
    if (!dados.length)
        return null;
    const max = Math.max(...dados.map((d) => d.total), 1);
    const L = 15, H = 92, G = 5;
    const W = dados.length * (L + G);
    const totFeitos = dados.filter((d) => !d.previsto).reduce((a, d) => a + d.feitos, 0);
    const totFalta = dados.filter((d) => d.fechada).reduce((a, d) => a + d.total - d.feitos, 0);
    const totPend = dados.filter((d) => !d.previsto && !d.fechada).reduce((a, d) => a + d.total - d.feitos, 0);
    const totPrev = dados.filter((d) => d.previsto).reduce((a, d) => a + d.total, 0);
    return (React.createElement("div", { style: { background: C.surface, padding: "13px 13px 11px", marginTop: 14 } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 11 } },
            React.createElement("span", { style: { fontSize: 13, fontWeight: 600 } }, "Pontos por semana"),
            React.createElement("span", { style: { fontSize: 11.5, color: C.ink2 } }, "in\u00EDcio de cada semana")),
        React.createElement("svg", { width: "100%", viewBox: `-14 0 ${W + 14} ${H + 34}`, style: { display: "block" } }, dados.map((d, i) => {
            const x = i * (L + G), hT = (d.total / max) * H, hF = (d.feitos / max) * H;
            return (React.createElement("g", { key: d.k },
                d.previsto
                    ? React.createElement("rect", { x: x + 0.5, y: H - hT, width: L - 1, height: hT, fill: "none", stroke: C.pend, strokeWidth: "1", strokeDasharray: d.fator < 1 ? "2 2" : "0" })
                    : React.createElement("rect", { x: x, y: H - hT, width: L, height: hT, fill: d.fechada ? C.falta : C.pend }),
                hF > 0 && React.createElement("rect", { x: x, y: H - hF, width: L, height: hF, fill: d.atual ? C.teal : C.tealClaro }),
                d.atual && React.createElement("rect", { x: x, y: H + 3, width: L, height: 2, fill: C.teal }),
                React.createElement("text", { x: x + L / 2, y: H + 12, textAnchor: "end", fontSize: "7", fontFamily: SANS, fill: d.atual ? C.teal : C.ink2, fontWeight: d.atual ? 600 : 400, transform: `rotate(-60 ${x + L / 2} ${H + 12})` }, fmtCurto(d.k))));
        })),
        React.createElement("div", { style: { display: "flex", gap: 14, marginTop: 9, fontSize: 11, color: C.ink2, flexWrap: "wrap" } },
            React.createElement(Leg, { cor: C.tealClaro, t: `${totFeitos} cumpridos` }),
            React.createElement(Leg, { cor: C.falta, t: `${totFalta} não cumpridos` }),
            React.createElement(Leg, { cor: C.pend, t: `${totPend} em aberto` }),
            React.createElement(Leg, { contorno: true, t: `${totPrev} previstos` })),
        React.createElement("div", { style: { fontSize: 11, color: C.ink2, marginTop: 7, lineHeight: 1.45 } }, "Vermelho \u00E9 o que ficou por fazer em semanas j\u00E1 fechadas; contorno tracejado marca carga reduzida.")));
}
const Leg = ({ cor, t, contorno }) => (React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6 } },
    React.createElement("span", { style: { width: 10, height: 10, display: "inline-block",
            background: contorno ? "transparent" : cor, border: contorno ? `1px solid ${C.pend}` : "none" } }),
    t));
/* ---------- PLANO ---------- */
function PlanoSemanal({ plano, segAtual, cfg }) {
    return (React.createElement("div", null,
        React.createElement(SecaoTitulo, { texto: "Pr\u00F3ximas 14 semanas" }),
        plano.semanas.slice(0, 14).map((s) => {
            const cont = (t) => s.itens.filter((i) => i.tipo === t);
            const atual = s.seg === segAtual;
            return (React.createElement("div", { key: s.seg, style: { background: C.surface, marginBottom: 7, padding: "11px 12px",
                    outline: atual ? `1.5px solid ${C.teal}` : "none" } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12,
                        color: atual ? C.teal : C.ink2, marginBottom: 8, fontWeight: atual ? 600 : 400 } },
                    React.createElement("span", null,
                        rotuloSemana(s.seg),
                        atual ? " · atual" : ""),
                    React.createElement("span", null,
                        s.pontos,
                        "/",
                        s.cap,
                        " pts",
                        s.fator < 1 ? " · reduzida" : "")),
                cont("aula").map((i) => (React.createElement("div", { key: i.id, style: { fontSize: 13.5, lineHeight: 1.5, display: "flex", gap: 7 } },
                    React.createElement("span", { style: { width: 3, background: areaColor(i.area), flexShrink: 0 } }),
                    React.createElement("span", null, i.tema)))),
                React.createElement("div", { style: nota(6) },
                    cont("questoes").length,
                    " quest\u00F5es \u00B7 ",
                    cont("revisao").length,
                    " revis\u00F5es \u00B7 ",
                    cont("bonus").length,
                    " b\u00F4nus")));
        })));
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
    return (React.createElement("div", null,
        React.createElement(Secao, { titulo: "Banca de refer\u00EAncia" },
            React.createElement("div", { style: { display: "flex", gap: 7 } }, [["usp", "USP-SP"], ["unifesp", "Unifesp"], ["ambas", "Ambas"]].map(([k, l]) => (React.createElement("button", { key: k, onClick: () => setCfg({ ...cfg, bancaFoco: k }), style: bf(cfg.bancaFoco === k) }, l)))),
            React.createElement("div", { style: nota(10) },
                pend.length,
                " b\u00F4nus priorit\u00E1rias e ",
                baixa.length,
                " de baixa prioridade. Todas entram na agenda a 3 pontos cada; as de at\u00E9 uma estrela s\u00F3 depois que as demais couberem.")),
        React.createElement(SecaoTitulo, { texto: "Fila de aulas b\u00F4nus" }),
        pend.map((x) => (React.createElement("div", { key: x.id, style: { background: C.surface, padding: "10px 12px", marginBottom: 6, borderLeft: `3px solid ${C.star}`,
                display: "flex", gap: 11, alignItems: "flex-start" } },
            React.createElement("button", { onClick: () => toggle(x.id), style: { width: 22, height: 22, flexShrink: 0, marginTop: 2, cursor: "pointer",
                    border: `1.5px solid ${C.star}`, background: "transparent", borderRadius: 4, color: C.star, fontSize: 13, lineHeight: 1, padding: 0 } }, "\u2713"),
            React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                React.createElement("div", { style: { fontSize: 14, lineHeight: 1.35 } }, x.nome),
                React.createElement("div", { style: { fontSize: 11.5, color: C.ink2, marginTop: 3 } },
                    "Semana ",
                    x.semana,
                    " \u00B7 ",
                    React.createElement("span", { style: { color: C.star } }, "★".repeat(peso(x))),
                    cfg.bancaFoco === "ambas" && React.createElement("span", null,
                        " \u00B7 USP ",
                        x.usp || "–",
                        " / Unifesp ",
                        x.uni || "–"),
                    x.extra && React.createElement("span", { style: { color: C.amber } }, " \u00B7 semana estimada")))))),
        pend.length === 0 && React.createElement(Vazio, { texto: "Nenhuma b\u00F4nus priorit\u00E1ria pendente." }),
        React.createElement(SecaoTitulo, { texto: `Baixa prioridade · ${baixa.length}` }),
        React.createElement("div", { style: { background: C.surface, padding: "11px 12px" } },
            React.createElement("button", { onClick: () => setVerTudo(!verTudo), style: { border: "none", background: "none", color: C.teal,
                    fontSize: 13, cursor: "pointer", padding: 0, textDecoration: "underline" } }, verTudo ? "ocultar" : "mostrar lista"),
            verTudo && React.createElement("div", { style: { marginTop: 9 } }, baixa.map((x) => (React.createElement("div", { key: x.id, style: { display: "flex", gap: 9, alignItems: "flex-start", marginTop: 7 } },
                React.createElement("button", { onClick: () => toggle(x.id), style: { width: 19, height: 19, flexShrink: 0, marginTop: 2, cursor: "pointer",
                        border: `1.5px solid ${C.line}`, background: "transparent", borderRadius: 3, color: C.ink2, fontSize: 11, lineHeight: 1, padding: 0 } }, "\u2713"),
                React.createElement("div", { style: { fontSize: 13, color: C.ink2, lineHeight: 1.4 } },
                    x.nome,
                    React.createElement("span", { style: { color: C.line } },
                        " \u00B7 S",
                        x.semana),
                    peso(x) === 1 && React.createElement("span", { style: { color: C.star } }, " \u2605")))))),
            React.createElement("div", { style: nota(11) }, "Uma estrela significa duas ou tr\u00EAs quest\u00F5es entre 2021 e 2025; nenhuma estrela, menos de duas naquela banca. S\u00E3o o fim da fila, n\u00E3o conte\u00FAdo descartado."))));
}
/* ---------- MAPA ---------- */
function Mapa({ blocos, recuar, avancar, cfg, adiados }) {
    const passo = { width: 24, height: 24, border: `1px solid ${C.line}`, background: "transparent", color: C.ink,
        fontSize: 14, lineHeight: 1, cursor: "pointer", padding: 0, fontFamily: SANS };
    const porSemana = {};
    blocos.forEach((b) => { var _a; return (porSemana[_a = b.semana] || (porSemana[_a] = [])).push(b); });
    return (React.createElement("div", null,
        React.createElement(SecaoTitulo, { texto: `${Object.keys(porSemana).length} semanas · você está na ${cfg.semanaAtual}` }),
        React.createElement("div", { style: { fontSize: 12, color: C.ink2, margin: "-2px 0 10px", lineHeight: 1.5 } }, "Em cada mat\u00E9ria, + marca a etapa atual como feita e \u2212 desmarca a \u00FAltima, restaurando as datas anteriores."),
        Object.keys(porSemana).sort().map((s) => {
            const itens = porSemana[s];
            const media = itens.reduce((x, b) => x + Math.min(b.etapa, CONCLUIDO), 0) / (itens.length * CONCLUIDO);
            const atual = Number(s) === cfg.semanaAtual;
            return (React.createElement("div", { key: s, style: { background: C.surface, padding: "10px 12px", marginBottom: 6, outline: atual ? `1.5px solid ${C.teal}` : "none" } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: atual ? C.teal : C.ink2, marginBottom: 5 } },
                    React.createElement("span", null,
                        "Semana ",
                        s,
                        atual ? " · atual" : ""),
                    React.createElement("span", null,
                        Math.round(media * 100),
                        "%")),
                React.createElement("div", { style: { height: 3, background: C.pend, marginBottom: 7 } },
                    React.createElement("div", { style: { width: media * 100 + "%", height: "100%", background: C.tealClaro } })),
                itens.map((b) => (React.createElement("div", { key: b.id, style: { display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13.5, lineHeight: 1.45, marginBottom: 3 } },
                    React.createElement("span", { style: { borderLeft: `3px solid ${areaColor(b.area)}`, paddingLeft: 7 } },
                        b.tema,
                        adiados[b.id + ":" + b.etapa] ? React.createElement("span", { style: { color: C.amber } },
                            " \u00B7 adiada ",
                            adiados[b.id + ":" + b.etapa],
                            "\u00D7") : null),
                    React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 4, flexShrink: 0 } },
                        React.createElement("button", { onClick: () => recuar(b.id), disabled: b.etapa === 0, "aria-label": "Recuar etapa", title: "Desmarcar a \u00FAltima etapa", style: { ...passo, opacity: b.etapa === 0 ? 0.3 : 1 } }, "\u2212"),
                        React.createElement("span", { style: { fontSize: 11.5, whiteSpace: "nowrap", minWidth: 78, textAlign: "center",
                                color: b.etapa >= CONCLUIDO ? C.tealClaro : b.etapa === 0 ? C.red : C.ink2 } }, b.etapa >= CONCLUIDO ? "concluído" : b.etapa === 0 ? "aula pendente" : ESCADA[b.etapa].nome.replace("Revisão ", "R ").replace("Questões pós-aula", "questões")),
                        React.createElement("button", { onClick: () => avancar(b.id), disabled: b.etapa >= CONCLUIDO, "aria-label": "Avan\u00E7ar etapa", title: "Marcar a etapa atual como feita", style: { ...passo, opacity: b.etapa >= CONCLUIDO ? 0.3 : 1 } }, "+")))))));
        })));
}
/* ---------- DADOS ---------- */
function PainelSync({ sync }) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const configurado = !!(window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey);
    const [t, cor] = ROTULO_SYNC[sync.status] || ROTULO_SYNC.local;
    return (React.createElement("div", { style: CARTAO },
        React.createElement("div", { style: { fontSize: 13, color: cor, marginBottom: 10 } },
            "\u25CF ",
            t),
        !configurado && (React.createElement("div", { style: { fontSize: 12.5, color: C.ink2, lineHeight: 1.55 } },
            "O Firebase ainda n\u00E3o foi configurado, ent\u00E3o o progresso fica s\u00F3 neste aparelho. Siga o LEIA-ME para preencher o arquivo ",
            React.createElement("code", null, "firebase-config.js"),
            ".")),
        configurado && sync.user && (React.createElement(React.Fragment, null,
            React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5 } },
                "Conectado como ",
                sync.user.email || sync.user.nome),
            React.createElement("div", { style: nota(6) }, "Sem internet, as marca\u00E7\u00F5es ficam guardadas no aparelho e s\u00E3o enviadas quando a conex\u00E3o voltar."),
            React.createElement("button", { style: { ...BOTAO2, marginTop: 11, width: "100%" }, onClick: () => Sync.sair() }, "Sair"))),
        configurado && !sync.user && sync.status !== "conectando" && sync.status !== "indisponivel" && (React.createElement(React.Fragment, null,
            React.createElement("button", { style: { ...BOTAO, width: "100%" }, onClick: () => Sync.entrarGoogle() }, "Entrar com Google"),
            React.createElement("div", { style: { fontSize: 11.5, color: C.ink2, margin: "12px 0 6px", textAlign: "center" } }, "ou com e-mail e senha"),
            React.createElement("input", { style: CAMPO, type: "email", placeholder: "e-mail", value: email, onChange: (e) => setEmail(e.target.value) }),
            React.createElement("input", { style: { ...CAMPO, marginTop: 7 }, type: "password", placeholder: "senha (m\u00EDn. 6 caracteres)", value: senha, onChange: (e) => setSenha(e.target.value) }),
            React.createElement("div", { style: { display: "flex", gap: 7, marginTop: 8 } },
                React.createElement("button", { style: { ...BOTAO2, flex: 1 }, onClick: () => Sync.entrarEmail(email, senha, false) }, "Entrar"),
                React.createElement("button", { style: { ...BOTAO2, flex: 1 }, onClick: () => Sync.entrarEmail(email, senha, true) }, "Criar conta")),
            React.createElement("div", { style: nota(9) }, "Use a mesma conta nos dois aparelhos. O login precisa de internet s\u00F3 na primeira vez."))),
        sync.erro && React.createElement("div", { style: { fontSize: 12.5, color: C.red, marginTop: 10, lineHeight: 1.5 } }, sync.erro)));
}
function PainelVersao() {
    const tem = useAtualizacao();
    const [info, setInfo] = useState(null);
    const [busy, setBusy] = useState(false);
    const verificar = async () => {
        setBusy(true);
        const r = await Atualizador.verificar();
        setInfo(r ? r : { erro: true });
        setBusy(false);
    };
    return (React.createElement("div", { style: CARTAO },
        React.createElement("div", { style: { fontSize: 13 } },
            "Vers\u00E3o instalada: ",
            APP_VERSION),
        tem ? (React.createElement("button", { style: { ...BOTAO2, marginTop: 11, width: "100%", background: C.teal, color: C.base, border: "none" }, onClick: () => Atualizador.aplicar() }, "Instalar nova vers\u00E3o")) : (React.createElement("button", { style: { ...BOTAO2, marginTop: 11, width: "100%" }, onClick: verificar, disabled: busy }, busy ? "Verificando…" : "Verificar atualização")),
        info && !info.erro && (React.createElement("div", { style: { fontSize: 12.5, color: C.ink2, marginTop: 9, lineHeight: 1.5 } },
            "Vers\u00E3o publicada: ",
            info.versao,
            info.versao === APP_VERSION ? " · você já está na mais recente." : " · baixando; o aviso de atualização aparece em instantes.",
            info.notas && React.createElement(React.Fragment, null,
                React.createElement("br", null),
                info.notas))),
        info && info.erro && React.createElement("div", { style: { fontSize: 12.5, color: C.amber, marginTop: 9 } }, "Sem conex\u00E3o para verificar agora."),
        React.createElement("div", { style: nota(9) }, "O app tamb\u00E9m verifica sozinho ao abrir e a cada hora. Seu progresso n\u00E3o \u00E9 afetado pelas atualiza\u00E7\u00F5es.")));
}
function PainelAnki({ cfg, setCfg, blocos, lerAnki, ankiMsg }) {
    const [loc, setLoc] = useState(ankiLocal());
    const [msg, setMsg] = useState("");
    const [busy, setBusy] = useState(false);
    const [verMapa, setVerMapa] = useState(false);
    const mapa = cfg.ankiMapa || {};
    const nAssoc = blocos.filter((b) => (mapa[b.id] || []).length).length;
    const usados = new Set(Object.values(mapa).flat());
    const atualizarLoc = (o) => { const n = { ...loc, ...o }; setLoc(n); salvarAnkiLocal(n); };
    const setMapa = (m) => setCfg({ ...cfg, ankiMapa: m });
    const buscarBaralhos = async () => {
        setBusy(true);
        setMsg("");
        try {
            const lista = await Anki.baralhos(loc.url);
            atualizarLoc({ baralhos: lista });
            setMsg(`${lista.length} baralhos encontrados.`);
            return lista;
        }
        catch (e) {
            setMsg(e.message);
            return null;
        }
        finally {
            setBusy(false);
        }
    };
    const associar = async () => {
        const lista = loc.baralhos.length ? loc.baralhos : await buscarBaralhos();
        if (!lista)
            return;
        const auto = associarAutomatico(blocos, lista);
        const novo = { ...auto };
        Object.keys(mapa).forEach((k) => { if ((mapa[k] || []).length)
            novo[k] = mapa[k]; }); // mantém o que você já ajustou
        setMapa(novo);
        const n = blocos.filter((b) => (novo[b.id] || []).length).length;
        setMsg(`${n} de ${blocos.length} aulas associadas. Confira a lista abaixo.`);
        setVerMapa(true);
    };
    const porSemana = {};
    blocos.forEach((b) => { var _a; return (porSemana[_a = b.semana] || (porSemana[_a] = [])).push(b); });
    const chip = { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, padding: "3px 4px 3px 8px",
        border: `1px solid ${C.line}`, color: C.card, margin: "4px 5px 0 0", maxWidth: "100%" };
    return (React.createElement("div", { style: CARTAO },
        React.createElement(Opcao, { marcada: loc.ativo, aoMudar: (v) => atualizarLoc({ ativo: v }), cor: C.card }, "Ler do Anki neste aparelho"),
        React.createElement("div", { style: nota(7) }, "Ative s\u00F3 no computador com o Anki e o AnkiConnect instalados. No celular, deixe desligado: as contagens lidas no computador chegam pela sincroniza\u00E7\u00E3o."),
        loc.ativo && (React.createElement(React.Fragment, null,
            React.createElement("label", { style: { ...rotulo, marginTop: 11 } }, "Endere\u00E7o do AnkiConnect"),
            React.createElement("input", { style: { ...CAMPO, marginTop: 4 }, value: loc.url, onChange: (e) => atualizarLoc({ url: e.target.value.trim() }) }),
            React.createElement("div", { style: { display: "flex", gap: 7, marginTop: 9, flexWrap: "wrap" } },
                React.createElement("button", { style: { ...BOTAO2, flex: 1 }, disabled: busy, onClick: buscarBaralhos }, busy ? "Conectando…" : "Testar conexão"),
                React.createElement("button", { style: { ...BOTAO, flex: 1 }, disabled: busy, onClick: associar }, "Associar baralhos")),
            React.createElement("button", { style: { ...BOTAO2, marginTop: 7, width: "100%" }, onClick: () => lerAnki() }, "Ler contagens agora"))),
        msg && React.createElement("div", { style: { fontSize: 12.5, color: C.teal, marginTop: 9, lineHeight: 1.5 } }, msg),
        loc.ativo && ankiMsg && React.createElement("div", { style: { fontSize: 12.5, color: C.ink2, marginTop: 6, lineHeight: 1.5 } }, ankiMsg),
        React.createElement("div", { style: { marginTop: 13 } },
            React.createElement(Opcao, { marcada: cfg.ankiAuto, aoMudar: (v) => setCfg({ ...cfg, ankiAuto: v }), cor: C.card }, "Marcar a revis\u00E3o sozinho quando o baralho zerar")),
        React.createElement("div", { style: nota(7) }, "A revis\u00E3o de flashcards \u00E9 marcada quando o baralho do tema n\u00E3o tem mais cart\u00F5es vencidos e voc\u00EA revisou pelo menos um cart\u00E3o dele desde s\u00E1bado."),
        React.createElement("button", { onClick: () => setVerMapa(!verMapa), style: { border: "none", background: "none", color: C.teal, fontSize: 13,
                cursor: "pointer", padding: 0, marginTop: 12, textDecoration: "underline" } }, verMapa ? "Ocultar associações" : `Ver associações (${nAssoc} de ${blocos.length} aulas)`),
        verMapa && (React.createElement("div", { style: { marginTop: 8 } },
            Object.keys(porSemana).sort().map((sem) => (React.createElement("div", { key: sem, style: { borderTop: `1px solid ${C.line}`, padding: "7px 0" } },
                React.createElement("div", { style: { fontSize: 11, color: C.ink2 } },
                    "Semana ",
                    sem),
                porSemana[sem].map((b) => {
                    const decks = mapa[b.id] || [];
                    return (React.createElement("div", { key: b.id, style: { marginTop: 6 } },
                        React.createElement("div", { style: { fontSize: 13, color: decks.length ? C.ink : C.amber } }, b.tema),
                        React.createElement("div", null, decks.map((d) => (React.createElement("span", { key: d, style: chip },
                            React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, d.split("::").pop()),
                            React.createElement("button", { "aria-label": "Remover baralho", onClick: () => setMapa({ ...mapa, [b.id]: decks.filter((x) => x !== d) }), style: { border: "none", background: "none", color: C.ink2, cursor: "pointer", padding: "0 3px", fontSize: 12 } }, "\u2715"))))),
                        loc.baralhos.length > 0 && (React.createElement("select", { value: "", onChange: (e) => e.target.value && setMapa({ ...mapa, [b.id]: [...decks, e.target.value] }), style: { ...CAMPO, fontSize: 12.5, padding: "5px 6px", marginTop: 5 } },
                            React.createElement("option", { value: "" }, "+ adicionar baralho"),
                            loc.baralhos.filter((d) => !decks.includes(d)).map((d) => (React.createElement("option", { key: d, value: d },
                                usados.has(d) ? "• " : "",
                                d)))))));
                })))),
            loc.baralhos.length > 0 && (() => {
                const livres = loc.baralhos.filter((d) => !usados.has(d));
                return livres.length > 0 && (React.createElement("div", { style: { borderTop: `1px solid ${C.line}`, paddingTop: 8, marginTop: 4 } },
                    React.createElement("div", { style: { fontSize: 11, color: C.ink2 } },
                        "Baralhos sem aula (",
                        livres.length,
                        ")"),
                    React.createElement("div", { style: { fontSize: 12.5, color: C.amber, lineHeight: 1.6, marginTop: 3 } }, livres.map((d) => d.split("::").pop()).join(" · "))));
            })(),
            React.createElement("div", { style: { fontSize: 11.5, color: C.ink2, marginTop: 8, lineHeight: 1.5 } }, "Aulas em amarelo est\u00E3o sem baralho. Na lista de adicionar, \"\u2022\" indica baralho j\u00E1 usado em outra aula. Um mesmo baralho pode servir a duas aulas (ex.: Trauma I e II).")))));
}
function Dados({ estado, aplicarEstado, setCfg, setBlocos, setAdiados, plano, hoje, sync, lerAnki, ankiMsg }) {
    const { cfg, blocos, bonus, registro, adiados, excluidos, anki, bonusAdiado } = estado;
    const [saida, setSaida] = useState("");
    const [nome, setNome] = useState("");
    const [texto, setTexto] = useState("");
    const [msg, setMsg] = useState("");
    const exportar = (tipo) => {
        let out = "", n = "";
        if (tipo === "backup") {
            n = "estudos-backup.json";
            out = JSON.stringify({ versao: 9, exportadoEm: hoje, cfg, blocos, bonus, registro, adiados, excluidos, anki, bonusAdiado }, null, 2);
        }
        else if (tipo === "historico") {
            n = "cumprimento-semanal.csv";
            const l = ["semana_iniciada_em;itens_planejados;itens_cumpridos;pontos_planejados;pontos_cumpridos"];
            Object.keys(registro).sort().forEach((k) => {
                const r = registro[k];
                const tp = r.planejados.reduce((a, p) => a + (p.peso || 0), 0);
                const fp = r.planejados.filter((p) => r.feitos.includes(p.id)).reduce((a, p) => a + (p.peso || 0), 0);
                l.push([k, r.planejados.length, r.feitos.length, tp, fp].join(";"));
            });
            out = l.join("\n");
        }
        else {
            n = "plano-semanal.csv";
            const l = ["semana_de;capacidade;tipo;etapa;semana_medcurso;tema;pontos;adiada_vezes"];
            plano.semanas.forEach((s) => s.itens.forEach((i) => l.push([s.seg, s.cap, i.tipo, i.rotulo, i.semana, i.tema.replace(/;/g, ","), i.peso, i.adiado || 0].join(";"))));
            out = l.join("\n");
        }
        setSaida(out);
        setNome(n);
        setMsg("");
        try {
            const b = new Blob([out], { type: "text/plain;charset=utf-8" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(b);
            a.download = n;
            a.click();
            URL.revokeObjectURL(a.href);
        }
        catch { }
    };
    return (React.createElement("div", null,
        React.createElement(SecaoTitulo, { texto: "Sincroniza\u00E7\u00E3o" }),
        React.createElement(PainelSync, { sync: sync }),
        React.createElement(SecaoTitulo, { texto: "Vers\u00E3o e atualiza\u00E7\u00F5es" }),
        React.createElement(PainelVersao, null),
        React.createElement(SecaoTitulo, { texto: "Anki" }),
        React.createElement(PainelAnki, { cfg: cfg, setCfg: setCfg, blocos: blocos, lerAnki: lerAnki, ankiMsg: ankiMsg }),
        React.createElement(Secao, { titulo: "Capacidade semanal" },
            React.createElement(Faixa, { cfg: cfg, setCfg: setCfg, chave: "pontosSemana", min: "10", max: "60", passo: "1" }),
            React.createElement("div", { style: { fontSize: 13, marginTop: 6 } },
                cfg.pontosSemana,
                " pontos por semana"),
            React.createElement("div", { style: { fontSize: 12, color: C.ink2, marginTop: 8, lineHeight: 1.6 } },
                "Aula 5 \u00B7 aula b\u00F4nus 3 \u00B7 quest\u00F5es 2 \u00B7 revis\u00E3o 1.",
                React.createElement("br", null),
                "Uma semana t\u00EDpica do extensivo custa cerca de 10 pontos s\u00F3 de aulas novas.")),
        React.createElement(Secao, { titulo: "Horizonte do planejamento" },
            React.createElement("label", { style: rotulo }, "\u00DAltima aula do extensivo"),
            React.createElement("input", { style: { ...CAMPO, marginTop: 5, marginBottom: 12 }, type: "date", value: cfg.fimCronograma, onChange: (e) => setCfg({ ...cfg, fimCronograma: e.target.value }) }),
            React.createElement("label", { style: rotulo }, "Fim do planejamento em carga cheia"),
            React.createElement("input", { style: { ...CAMPO, marginTop: 5, marginBottom: 12 }, type: "date", value: cfg.fimPrimario, onChange: (e) => setCfg({ ...cfg, fimPrimario: e.target.value }) }),
            React.createElement("label", { style: rotulo }, "Fim do per\u00EDodo de carga reduzida"),
            React.createElement("input", { style: { ...CAMPO, marginTop: 5 }, type: "date", value: cfg.fimReduzido, onChange: (e) => setCfg({ ...cfg, fimReduzido: e.target.value }) }),
            React.createElement("div", { style: { marginTop: 12 } },
                React.createElement(Faixa, { cfg: cfg, setCfg: setCfg, chave: "reducao", min: "0.33", max: "0.7", passo: "0.01" }),
                React.createElement("div", { style: { fontSize: 12.5, color: C.ink2, marginTop: 6, lineHeight: 1.5 } },
                    "Redu\u00E7\u00E3o de ",
                    Math.round(cfg.reducao * 100),
                    "% entre ",
                    fmt(cfg.fimPrimario),
                    " e ",
                    fmt(cfg.fimReduzido),
                    ":",
                    " ",
                    Math.round(cfg.pontosSemana * (1 - cfg.reducao)),
                    " pontos por semana. O m\u00EDnimo permitido \u00E9 33%."))),
        React.createElement(Secao, { titulo: "Redistribui\u00E7\u00E3o de metas" },
            React.createElement(Faixa, { cfg: cfg, setCfg: setCfg, chave: "janelaRedistribuicao", min: "1", max: "6", passo: "1" }),
            React.createElement("div", { style: { fontSize: 13, marginTop: 6 } },
                "Espalhar por ",
                cfg.janelaRedistribuicao,
                " semanas"),
            React.createElement("div", { style: { marginTop: 12 } },
                React.createElement(Faixa, { cfg: cfg, setCfg: setCfg, chave: "tetoAdiado", min: "0.1", max: "0.6", passo: "0.05" }),
                React.createElement("div", { style: { fontSize: 12.5, color: C.ink2, marginTop: 6, lineHeight: 1.5 } },
                    "Teto de ",
                    Math.round(cfg.tetoAdiado * 100),
                    "% da semana (",
                    Math.round(cfg.pontosSemana * cfg.tetoAdiado),
                    " pontos) para metas adiadas.")),
            React.createElement("div", { style: { marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 12 } },
                React.createElement(Faixa, { cfg: cfg, setCfg: setCfg, chave: "maxRevisoes", min: "2", max: "12", passo: "1" }),
                React.createElement("div", { style: { fontSize: 12.5, color: C.ink2, marginTop: 6 } },
                    "M\u00E1ximo de ",
                    cfg.maxRevisoes,
                    " revis\u00F5es por semana"),
                React.createElement(Faixa, { cfg: cfg, setCfg: setCfg, chave: "maxBonus", min: "1", max: "8", passo: "1", mt: 12 }),
                React.createElement("div", { style: { fontSize: 12.5, color: C.ink2, marginTop: 6, lineHeight: 1.5 } },
                    "M\u00E1ximo de ",
                    cfg.maxBonus,
                    " aulas b\u00F4nus por semana. Os tetos valem al\u00E9m do limite de pontos e s\u00E3o reduzidos proporcionalmente nas semanas de carga menor.")),
            React.createElement("button", { style: { ...BOTAO2, marginTop: 14, width: "100%", color: C.red, borderColor: C.red }, onClick: () => { setAdiados({}); setMsg("Contador de adiamentos zerado."); } }, "Zerar contador de adiamentos")),
        React.createElement(Secao, { titulo: "Aulas b\u00F4nus" },
            React.createElement(Faixa, { cfg: cfg, setCfg: setCfg, chave: "semanasAdiamentoBonus", min: "1", max: "12", passo: "1", cor: C.star }),
            React.createElement("div", { style: { fontSize: 13, marginTop: 6 } },
                "B\u00F4nus trocada volta \u00E0 fila depois de ",
                cfg.semanasAdiamentoBonus,
                " semanas"),
            React.createElement("div", { style: nota(7) }, "No come\u00E7o de cada semana o app pergunta se voc\u00EA quer trocar as b\u00F4nus sugeridas. As trocadas saem da semana e entram outras do mesmo n\u00EDvel de estrelas, enquanto houver.")),
        React.createElement("div", { style: CARTAO },
            React.createElement(Opcao, { marcada: cfg.incluirBaixaPrioridade, aoMudar: (v) => setCfg({ ...cfg, incluirBaixaPrioridade: v }), cor: C.card }, "Incluir b\u00F4nus de at\u00E9 uma estrela na agenda"),
            React.createElement("div", { style: { fontSize: 12, color: C.ink2, marginTop: 10, lineHeight: 1.55 } }, "Ligado, entram no fim da fila. Desligado, ficam dispon\u00EDveis s\u00F3 na aba B\u00F4nus.")),
        React.createElement(Secao, { titulo: "Exportar e restaurar" },
            React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap" } },
                React.createElement("button", { style: BOTAO, onClick: () => exportar("backup") }, "Backup completo"),
                React.createElement("button", { style: BOTAO2, onClick: () => exportar("plano") }, "Plano semanal"),
                React.createElement("button", { style: BOTAO2, onClick: () => exportar("historico") }, "Hist\u00F3rico")),
            saida && (React.createElement("div", { style: { marginTop: 11 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } },
                    React.createElement("span", { style: { fontSize: 12, color: C.ink2 } }, nome),
                    React.createElement("button", { style: { ...BOTAO2, padding: "6px 12px", fontSize: 12.5 }, onClick: async () => { try {
                            await navigator.clipboard.writeText(saida);
                            setMsg("Copiado.");
                        }
                        catch {
                            setMsg("Selecione e copie.");
                        } } }, "Copiar")),
                React.createElement("textarea", { readOnly: true, rows: 6, value: saida, onClick: (e) => e.target.select(), style: { ...CAMPO, fontFamily: "monospace", fontSize: 11.5 } }))),
            React.createElement("textarea", { rows: 3, style: { ...CAMPO, marginTop: 11, fontFamily: "monospace", fontSize: 12.5 }, placeholder: "Cole o JSON do backup", value: texto, onChange: (e) => setTexto(e.target.value) }),
            React.createElement("button", { style: { ...BOTAO2, marginTop: 8, width: "100%" }, onClick: () => {
                    try {
                        const d = JSON.parse(texto);
                        if (!d.blocos)
                            throw new Error();
                        aplicarEstado({ cfg: { ...DEFAULT_CFG, ...(d.cfg || {}) }, blocos: d.blocos, bonus: d.bonus || bonus,
                            registro: d.registro || {}, adiados: d.adiados || {}, excluidos: d.excluidos || {}, anki: d.anki, bonusAdiado: d.bonusAdiado });
                        setMsg("Backup restaurado.");
                        setTexto("");
                    }
                    catch {
                        setMsg("JSON inválido.");
                    }
                } }, "Restaurar backup"),
            msg && React.createElement("div", { style: { fontSize: 12.5, color: C.teal, marginTop: 9 } }, msg)),
        React.createElement(Secao, { titulo: "Semana atual e prova" },
            React.createElement("input", { style: CAMPO, type: "number", min: "1", max: "46", value: cfg.semanaAtual, onChange: (e) => setCfg({ ...cfg, semanaAtual: Number(e.target.value) || 1, semanaBaseSeg: sabado(hoje) }) }),
            React.createElement("div", { style: nota(7) }, "A semana avan\u00E7a sozinha todo s\u00E1bado. Ajuste aqui s\u00F3 se o extensivo pausar ou se voc\u00EA quiser pular."),
            React.createElement("button", { style: { ...BOTAO2, marginTop: 9, width: "100%" }, onClick: () => { setBlocos(seed(cfg, hoje)); setMsg("Estado recalculado."); } }, "Recalcular estado das semanas"),
            React.createElement("input", { style: { ...CAMPO, marginTop: 13 }, value: cfg.nomeProva, onChange: (e) => setCfg({ ...cfg, nomeProva: e.target.value }) }),
            React.createElement("input", { style: { ...CAMPO, marginTop: 8 }, type: "date", value: cfg.dataProva, onChange: (e) => setCfg({ ...cfg, dataProva: e.target.value, provisorio: false }) }),
            cfg.provisorio && React.createElement("div", { style: { fontSize: 12.5, color: C.amber, marginTop: 8, lineHeight: 1.45 } }, "Data provis\u00F3ria; editais de 2027 ainda n\u00E3o publicados."))));
}
/* ---------- peças de interface reaproveitadas ---------- */
const CARTAO = { background: C.surface, padding: 13, marginBottom: 12 };
const CAMPO = { width: "100%", padding: "9px 10px", border: `1px solid ${C.line}`, fontSize: 15, fontFamily: SANS,
    background: C.base, color: C.ink, colorScheme: "dark", boxSizing: "border-box" };
const BOTAO = { background: C.teal, color: C.base, border: "none", padding: "10px 14px", fontSize: 13.5, cursor: "pointer", fontFamily: SANS };
const BOTAO2 = { ...BOTAO, background: "transparent", color: C.teal, border: `1px solid ${C.teal}` };
const nota = (mt = 7, cor = C.ink2) => ({ fontSize: 12, color: cor, marginTop: mt, lineHeight: 1.5 });
const rotulo = { fontSize: 12.5, color: C.ink2, display: "block" };
const Secao = ({ titulo, cor, children }) => (React.createElement(React.Fragment, null,
    React.createElement(SecaoTitulo, { texto: titulo, cor: cor }),
    React.createElement("div", { style: CARTAO }, children)));
const Opcao = ({ marcada, aoMudar, cor = C.card, children }) => (React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 9, fontSize: 13, cursor: "pointer" } },
    React.createElement("input", { type: "checkbox", checked: marcada, onChange: (e) => aoMudar(e.target.checked), style: { accentColor: cor, width: 17, height: 17, flexShrink: 0 } }),
    children));
const Faixa = ({ cfg, setCfg, chave, min, max, passo = 1, cor = C.teal, mt }) => (React.createElement("input", { type: "range", min: min, max: max, step: passo, value: cfg[chave], style: { width: "100%", accentColor: cor, ...(mt ? { marginTop: mt } : {}) }, onChange: (e) => setCfg({ ...cfg, [chave]: Number(e.target.value) }) }));
const Aviso = ({ cor = C.amber, fundo = C.amberSoft, children }) => (React.createElement("div", { style: { background: fundo, borderLeft: `3px solid ${cor}`, padding: "11px 12px", fontSize: 12.5, lineHeight: 1.5 } }, children));
/* ---------- primitivos ---------- */
const SecaoTitulo = ({ texto, cor }) => (React.createElement("h2", { style: { fontSize: 13, fontWeight: 600, color: cor || C.ink2, margin: "18px 0 9px" } }, texto));
const Vazio = ({ texto }) => (React.createElement("div", { style: { background: C.surface, padding: "16px 13px", fontSize: 13.5, color: C.ink2, lineHeight: 1.5, borderLeft: `3px solid ${C.line}` } }, texto));
/* ---------- montagem ---------- */
ReactDOM.createRoot(document.getElementById("raiz")).render(React.createElement(App, null));
