import { AIProvider, ScriptData } from "@/types/ai-providers";

export class ScriptGeneratorAPI {
  static async generateScript(provider: AIProvider, scriptData: ScriptData, apiKey: string): Promise<string> {
    const prompt = this.buildPrompt(scriptData);

    switch (provider.id) {
      case 'gemini':
        return this.callGemini(apiKey, prompt);
      case 'openai':
        return this.callOpenAI(apiKey, prompt);
      case 'claude':
        return this.callClaude(apiKey, prompt);
      case 'grok':
        return this.callGrok(apiKey, prompt);
      case 'mistral':
        return this.callMistral(apiKey, prompt);
      case 'deepseek':
        return this.callDeepSeek(apiKey, prompt);
      case 'perplexity':
        return this.callPerplexity(apiKey, prompt);
      default:
        throw new Error(`Provider ${provider.id} não suportado`);
    }
  }

  private static buildPrompt(scriptData: ScriptData): string {
    return `
Crie um roteiro detalhado para um vídeo do YouTube com as seguintes especificações:

**Tópico:** ${scriptData.topic}
**Duração:** ${scriptData.duration} minutos
**Estilo:** ${scriptData.style}
**Palavras-chave do estilo:** ${scriptData.styleKeywords || "Nenhuma"}
**Idioma:** ${scriptData.language || "Português (Brasil)"}
**Nicho:** ${scriptData.niche || "Não informado"}
**Sobrenicho:** ${scriptData.subniche || "Não informado"}
**Micronicho:** ${scriptData.microniche || "Não informado"}
**Nanonicho:** ${scriptData.nanoniche || "Não informado"}
**Link de referência (YouTube):** ${scriptData.youtubeLink || "Nenhum"}
**Público qualificado:** ${scriptData.qualified ? "Sim" : "Não"}
**Público-alvo:** ${scriptData.audience || "Geral"}
**Informações adicionais:** ${scriptData.additionalInfo || "Nenhuma"}

O roteiro deve incluir:
1. Hook inicial (primeiros 15 segundos)
2. Introdução e apresentação do problema/tópico
3. Desenvolvimento do conteúdo principal (dividido em seções)
4. Call-to-action para inscrição e likes
5. Conclusão e próximos passos
6. Outro (final do vídeo)

Formate o roteiro de forma clara, com indicações de tempo aproximado para cada seção.
Use uma linguagem envolvente e adequada para YouTube.
Inclua sugestões de elementos visuais quando relevante.
Adapte o tom e a linguagem conforme as palavras-chave do estilo fornecidas.
Adapte o conteúdo ao nicho e subnichos especificados.
Se houver link do YouTube, use-o apenas como referência (sem copiar), destacando diferenciais e atualizações.
Se o público for qualificado, aprofunde a terminologia e a complexidade; caso contrário, simplifique e use exemplos práticos.
Escreva todo o roteiro no idioma especificado pelo usuário.
`;
  }

  private static async callGemini(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) throw new Error("Erro ao gerar roteiro com Gemini");
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private static async callOpenAI(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("Erro ao gerar roteiro com OpenAI");
    
    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callClaude(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error("Erro ao gerar roteiro com Claude");
    
    const data = await response.json();
    return data.content[0].text;
  }

  private static async callGrok(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "grok-beta",
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("Erro ao gerar roteiro com Grok");
    
    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callMistral(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("Erro ao gerar roteiro com Mistral");
    
    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callDeepSeek(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("Erro ao gerar roteiro com DeepSeek");
    
    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callPerplexity(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("Erro ao gerar roteiro com Perplexity");
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
}