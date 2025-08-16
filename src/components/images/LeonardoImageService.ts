export interface GenerateImageOptions {
  prompt: string;
  width?: number;
  height?: number;
  modelId?: string; // Leonardo default model
}

const LEONARDO_API = "https://cloud.leonardo.ai/api/rest/v1";

// Poll helper
async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateLeonardoImage(apiKey: string, options: GenerateImageOptions): Promise<string> {
  const { prompt, width = 1024, height = 1024, modelId = "e316348f-7773-490e-9ce1-2fa6f8ad5f2b" } = options;

  const createRes = await fetch(`${LEONARDO_API}/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      modelId,
      num_images: 1,
      width,
      height,
      public: false,
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`Falha ao criar geração (${createRes.status}): ${text}`);
  }

  const created = await createRes.json();
  const generationId: string | undefined = created?.sdGenerationJob?.generationId || created?.generationId || created?.id;
  if (!generationId) {
    throw new Error("Resposta inesperada da API Leonardo (sem generationId)");
  }

  // Poll até completar (máx ~60s)
  const start = Date.now();
  while (Date.now() - start < 60000) {
    await wait(2000);
    const pollRes = await fetch(`${LEONARDO_API}/generations/${generationId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!pollRes.ok) continue;
    const data = await pollRes.json();

    // Tentar diferentes formatos de resposta conhecidos
    const byPk = data?.generations_by_pk || data?.generation || data;
    const status: string | undefined = byPk?.status || byPk?.generation?.status || byPk?.sdGenerationJob?.status;
    const images = byPk?.generated_images || byPk?.images || byPk?.generation?.generated_images || [];

    if (images?.length) {
      const url = images[0]?.url || images[0]?.image?.url;
      if (url) return url;
    }

    if (status && ["FAILED", "CANCELED", "ERROR"].includes(status.toUpperCase())) {
      throw new Error(`Geração falhou com status: ${status}`);
    }
  }

  throw new Error("Tempo esgotado aguardando a imagem da Leonardo AI");
}
