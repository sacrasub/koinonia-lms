import { CornellNote } from '@/types';

export type AIProvider = 'auto' | 'openai' | 'gemini' | 'native';
export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4.1' | 'gpt-5.5' | 'gpt-4-turbo';

export interface CornellTransformRequest {
  url?: string;
  text?: string;
  disciplina_name?: string;
  disciplina_code?: string;
  professor_name?: string;
  date?: string;
  provider?: AIProvider;
  openai_api_key?: string;
  openai_model?: string;
  gemini_api_key?: string;
}

export interface CornellTransformResult {
  theme?: string;
  biblical_references?: string;
  cues: string;
  notes: string;
  summary: string;
  sourceText?: string;
  detectedDocTitle?: string;
  usedProvider?: string;
  usedModel?: string;
}

/**
 * Envia o link do Google Docs ou o texto do resumo/transcrição da aula
 * para a API de Inteligência Artificial para estruturação no Método Cornell.
 */
export async function transformToCornell(
  params: CornellTransformRequest
): Promise<{ success: boolean; data?: CornellTransformResult; error?: string }> {
  try {
    const response = await fetch('/api/ai/transform-cornell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.error || 'Falha ao processar o conteúdo para o Método Cornell.',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Erro de conexão ao solicitar transformação para o Método Cornell.',
    };
  }
}
