import fs from 'fs';

const bibData = JSON.parse(fs.readFileSync('src/lib/bibliotecaData.json', 'utf8'));

// Mapa curado com os IDs reais dos arquivos na biblioteca
const REAL_LIBRARY_MAPPINGS = {
  // A Missão de Deus (Christopher J. H. Wright)
  'A Missão de Deus: Revelando o plano redentor das Escrituras': {
    bibId: 'fmb_1847cbe6fec2',
    driveUrl: 'https://drive.google.com/open?id=1s9KwYttby1gr17zA_wsDAyS37UKmvhxO&usp=drive_copy'
  },
  // A Missão do Povo de Deus (Christopher J. H. Wright)
  'A Missão do Povo de Deus: Uma teologia bíblica da missão da Igreja': {
    bibId: '18QyUJJ88O4Tmhz0Hk8uf_EhHNmmErWNi',
    driveUrl: 'https://drive.google.com/open?id=18QyUJJ88O4Tmhz0Hk8uf_EhHNmmErWNi&usp=drive_copy'
  },
  // Os Puritanos (D. Martyn Lloyd-Jones)
  'Os Puritanos: Suas Origens e Seus Sucessores': {
    bibId: 'fmb_9d513e960a54',
    driveUrl: 'https://drive.google.com/open?id=1Edz8VaptjTk1YZV8bvFYTblMLB-SURjH&usp=drive_copy'
  },
  // Santos no Mundo (Leland Ryken)
  'Santos no Mundo: Os Puritanos como Realmente Eram': {
    bibId: 'fmb_308a2a3383ab',
    driveUrl: 'https://drive.google.com/open?id=15c_iAsgJo5T_8yQLeRieiQpKKbag2YYM&usp=drive_copy'
  },
  // O Livro dos Mártires (John Foxe)
  'O Livro dos Mártires: História das Perseguições e do Testemunho Cristão': {
    bibId: '1fChnOz-_OMMQ4YEl4_ybYVbmi8K2FTdb',
    driveUrl: 'https://drive.google.com/open?id=1fChnOz-_OMMQ4YEl4_ybYVbmi8K2FTdb&usp=drive_copy'
  },
  // Ego Transformado (Timothy Keller)
  'Ego Transformado: A verdadeira humildade cristã': {
    bibId: 'fmb_837f708e6064',
    driveUrl: 'https://drive.google.com/open?id=1MwgW6nKeX1b-Bd6ot_m5y3LCIh1LM_id&usp=drive_copy'
  },
  // Lutero como Conselheiro Espiritual (Martinho Lutero)
  'Lutero como Conselheiro Espiritual: Cartas de Conforto e Cuidado Pastoral': {
    bibId: 'fmb_ab871c994bec',
    driveUrl: 'https://drive.google.com/open?id=1Umxq-c5cv6VoFYD6w00QD-BKs5Vt5PGb&usp=drive_copy'
  },
  // Aconselhamento Cristão (Gary R. Collins)
  'Aconselhamento Cristão: Depressão, Ansiedade, Crises e Suicídio': {
    bibId: '1cRFEHgU1O1emoehE1Fwdr8MrCeGoxB9L_2991',
    driveUrl: 'https://drive.google.com/open?id=1-WMGzLE1r1B_7gabCLXBwg7u01UiAQ4B&usp=drive_copy'
  },
  // Aconselhamento a partir da Cruz (Elyse Fitzpatrick)
  'Aconselhamento a partir da Cruz: O poder do evangelho no cuidado das almas': {
    bibId: '1EZxiGqOQJ_3vttGZRFOsSfsclYV3lK2e',
    driveUrl: 'https://drive.google.com/open?id=15FTDt2QtK4XX-Z5FyKF9fFPzoGf4nk09&usp=drive_copy'
  },
  // Catecismo Maior de Westminster Comentado
  'Catecismo Maior de Westminster Comentado: Exposição Doutrinária': {
    bibId: 'fmb_d4d28638014e',
    driveUrl: 'https://drive.google.com/open?id=14nL60p5-Gs150PAPH904hItyNDRLbFhm&usp=drive_copy'
  },
  // O Catecismo Maior de Westminster
  'O Catecismo Maior de Westminster: Texto Oficial e Exposição dos Dez Mandamentos': {
    bibId: 'fmb_b317123c01c5',
    driveUrl: 'https://drive.google.com/open?id=183_kT4sPIBxHxvZ7sFFnY-tU9AJCe1Fs&usp=drive_copy'
  },
  // Ética Cristã (Norman Geisler)
  'Ética Cristã: Opções e Questões Contemporâneas': {
    bibId: 'fmb_972b8e205f00',
    driveUrl: 'https://drive.google.com/open?id=1ZVcqg_-YbdKXxjRiRkZ6PP9_2-dPQ47o&usp=drive_copy'
  },
  // Pecados Espetaculares (John Piper)
  'Pecados Espetaculares: E o propósito de Deus para a glória de Cristo': {
    bibId: '1ePjuhGPuMcA_st-CBXOBJ3m3fHe-6kR8',
    driveUrl: 'https://drive.google.com/open?id=1ePjuhGPuMcA_st-CBXOBJ3m3fHe-6kR8&usp=drive_copy'
  },
  // Introdução ao Novo Testamento (D. A. Carson)
  'Introdução ao Novo Testamento': {
    bibId: '1bqPhMnDVckT_V2LYQBu7ctc_vLrY9QDR_1513',
    driveUrl: 'https://drive.google.com/open?id=1JHGupwF8vlgKh8NagWGlAsz5Ej54f4bS&usp=drive_copy'
  },
  // A Treliça e a Videira (Colin Marshall)
  'A Treliça e a Videira: A mentalidade bíblica para o crescimento da igreja': {
    bibId: '1Nq43UDBay4TGJK5Rr90_W6HLCmEoqlLB_2950',
    driveUrl: 'https://drive.google.com/open?id=1g81Qo58bMpVVBMmLZPddzBzY3VGbiCmk&usp=drive_copy'
  },
  // Projeto Videira: Guia de Estudo
  'Projeto Videira: Guia de Estudo e Discipulado Prático': {
    bibId: '12BKgg1QOMEjSdOMY6yqKqtic2X4DG8W4',
    driveUrl: 'https://drive.google.com/open?id=1wTT7lhGVdoTV7n9B421pzvR6ikC-ktpF&usp=drive_copy'
  },
  // Projeto Videira: Manual de Implantação
  'Projeto Videira: Manual de Implantação e Revitalização Ministerial': {
    bibId: '1LQfzlgxEDMnJKb4c9NoX26uLK_9pGprT',
    driveUrl: 'https://drive.google.com/open?id=1F4b9lZu_F9TE6baD3xRWn1h6sDHJ4YQZ&usp=drive_copy'
  },
  // Lealdade e Deslealdade (Dag Heward-Mills)
  'Lealdade e Deslealdade: Princípios de Liderança e Caráter no Ministério': {
    bibId: 'fmb_45639a77ee6e',
    driveUrl: 'https://drive.google.com/open?id=1LRTD5GvfL2wT1G2zafSnyJOLfW2-999X&usp=drive_copy'
  },
  // Manual e Modelo de TCC
  'Manual e Modelo Estruturado de Projeto de Pesquisa para TCC Teológico': {
    bibId: 'fmb_9ea00f102250',
    driveUrl: 'https://drive.google.com/open?id=1YxYW8gjofdV-C6YVCEMolo3uUzmZigXV&usp=drive_copy'
  },
  // Declaração de Fé da UIECB
  'Declaração de Fé da UIECB: Princípios e Doutrinas Congregacionais': {
    bibId: 'fmb_cf9eeb597c03',
    driveUrl: 'https://drive.google.com/open?id=1odPOD9m9ztZXJAY17H9nwyQQuYto-vui&usp=drive_copy'
  }
};

console.log('Total mappings curados:', Object.keys(REAL_LIBRARY_MAPPINGS).length);
for (const [title, map] of Object.entries(REAL_LIBRARY_MAPPINGS)) {
  const fileInBib = bibData.find(b => b.id === map.bibId);
  console.log(`[OK] ${title} -> Bib: "${fileInBib ? fileInBib.title : 'NOT FOUND'}" | URL: ${map.driveUrl}`);
}
