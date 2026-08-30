/**
 * soundEffects.ts - Gerador de Bipes e Alarmes Sonoros de Alta Potência para o LMS UIECB
 * Utiliza a Web Audio API nativa com compressor dinâmico e sobreposição harmônica
 * para produzir sinais sonoros altos, límpidos e perfeitamente distinguíveis mesmo
 * durante aulas síncronas com transmissão de voz no Google Meet.
 */

// Instância singleton do AudioContext para evitar limites de contextos do navegador
let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return null;
    if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
      globalAudioCtx = new AudioCtxClass();
    }
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch (e) {
    console.warn('[soundEffects] Web Audio API não disponível:', e);
    return null;
  }
}

/**
 * Toca um tom harmônico encorpado (fundamental + oitava harmônica)
 * com ganho e rampa suave de ataque e decaimento.
 */
export function playHarmonicTone({
  fundamentalFreq = 880,
  duration = 0.22,
  type = 'triangle',
  volume = 0.85,
  harmonicRatio = 2,
  harmonicVolume = 0.35,
}: {
  fundamentalFreq?: number;
  duration?: number;
  type?: OscillatorType;
  volume?: number;
  harmonicRatio?: number;
  harmonicVolume?: number;
}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Compressor dinâmico para maximizar o volume e clareza sem distorcer no fone/alto-falante
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, now);
    compressor.knee.setValueAtTime(30, now);
    compressor.ratio.setValueAtTime(10, now);
    compressor.attack.setValueAtTime(0.003, now);
    compressor.release.setValueAtTime(0.25, now);
    compressor.connect(ctx.destination);

    // Master Gain
    const masterGain = ctx.createGain();
    const safeVolume = Math.min(1.0, Math.max(0.1, volume));
    masterGain.gain.setValueAtTime(safeVolume, now);
    masterGain.connect(compressor);

    // 1. Oscilador Fundamental
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = type;
    osc1.frequency.setValueAtTime(fundamentalFreq, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.8, now + 0.02); // Ataque rápido
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decaimento

    osc1.connect(gain1);
    gain1.connect(masterGain);

    // 2. Oscilador Harmônico Superior (corta frequências de voz humana)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(fundamentalFreq * harmonicRatio, now);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(harmonicVolume, now + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.9);

    osc2.connect(gain2);
    gain2.connect(masterGain);

    // Iniciar e finalizar osciladores
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  } catch (err) {
    console.warn('[soundEffects] Erro ao reproduzir tom harmônico:', err);
  }
}

/**
 * 🚨 Alarme de Início de Transmissão / Gravação
 * Sequência penetrante de 3 notas ascendentes vibrantes (Dó5 -> Sol5 -> Dó6)
 * com repetição enérgica para chamar atenção imediata do monitor.
 */
export function playRecordingAlarm(volume = 0.85) {
  // Nota 1: Dó5 (523.25 Hz)
  playHarmonicTone({ fundamentalFreq: 523.25, duration: 0.14, type: 'triangle', volume, harmonicRatio: 2 });
  
  // Nota 2: Sol5 (783.99 Hz)
  setTimeout(() => {
    playHarmonicTone({ fundamentalFreq: 783.99, duration: 0.16, type: 'triangle', volume, harmonicRatio: 2 });
  }, 130);

  // Nota 3: Dó6 (1046.50 Hz) - Tom Agudo Final com sustentação
  setTimeout(() => {
    playHarmonicTone({ fundamentalFreq: 1046.50, duration: 0.32, type: 'triangle', volume: volume * 1.05, harmonicRatio: 2 });
  }, 270);

  // Eco de reforço após 600ms (duplo alerta)
  setTimeout(() => {
    playHarmonicTone({ fundamentalFreq: 1046.50, duration: 0.28, type: 'triangle', volume: volume * 0.9, harmonicRatio: 1.5 });
  }, 620);
}

/**
 * 📋 Alarme de Disparo de Chamada / Presença (50% de Aula)
 * Duplo Chime Cristalino de alta frequência (Lá5 880Hz -> Mi6 1318.5Hz -> Lá6 1760Hz)
 * Altamente distinguível de qualquer notificação do Google Meet ou Windows.
 */
export function playPresenceAlarm(volume = 0.85) {
  // Chime 1
  playHarmonicTone({ fundamentalFreq: 880, duration: 0.12, type: 'sine', volume, harmonicRatio: 2 });
  
  setTimeout(() => {
    playHarmonicTone({ fundamentalFreq: 1318.51, duration: 0.16, type: 'triangle', volume, harmonicRatio: 2 });
  }, 110);

  setTimeout(() => {
    playHarmonicTone({ fundamentalFreq: 1760, duration: 0.35, type: 'triangle', volume: volume * 1.05, harmonicRatio: 1.5 });
  }, 240);

  // Segundo Chime de Confirmação
  setTimeout(() => {
    playHarmonicTone({ fundamentalFreq: 1318.51, duration: 0.14, type: 'triangle', volume: volume * 0.9, harmonicRatio: 2 });
  }, 500);
  setTimeout(() => {
    playHarmonicTone({ fundamentalFreq: 1760, duration: 0.38, type: 'triangle', volume, harmonicRatio: 1.5 });
  }, 630);
}

/**
 * ⏳ Alarme de Encerramento (10 minutos para o fim da aula)
 * Sequência suave descendente com 3 toques nítidos (Mi5 -> Ré5 -> Dó5).
 */
export function playClosingAlarm(volume = 0.85) {
  playHarmonicTone({ fundamentalFreq: 659.25, duration: 0.16, type: 'triangle', volume });
  
  setTimeout(() => {
    playHarmonicTone({ fundamentalFreq: 587.33, duration: 0.16, type: 'triangle', volume });
  }, 160);

  setTimeout(() => {
    playHarmonicTone({ fundamentalFreq: 523.25, duration: 0.32, type: 'triangle', volume: volume * 1.05 });
  }, 320);
}

/**
 * 🔔 Som de Teste Rápido do Bipe (usado no botão "Testar Bipe")
 */
export function playTestBeep(volume = 0.85) {
  playHarmonicTone({ fundamentalFreq: 880, duration: 0.12, type: 'triangle', volume });
  setTimeout(() => {
    playHarmonicTone({ fundamentalFreq: 1318.51, duration: 0.24, type: 'triangle', volume: volume * 1.05 });
  }, 120);
}
