import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Image as ImageIcon, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APIKeyModal } from "@/components/ai/APIKeyModal";
import { AIProvider } from "@/types/ai-providers";
import { generateLeonardoImage } from "./LeonardoImageService";

interface ImageGenerationSectionProps {
  script: string;
}

interface TopicItem {
  id: string;
  title: string;
  prompt: string;
  imageUrl?: string;
  loading?: boolean;
  error?: string;
}

const LEONARDO_PROVIDER: AIProvider = {
  id: "leonardo",
  name: "Leonardo AI",
  icon: "🎨",
  endpoint: "https://cloud.leonardo.ai/api/rest/v1",
  keyName: "leonardo_api_key",
  getApiKeyUrl: "https://cloud.leonardo.ai/api-access",
};

const KLING_PROVIDER: AIProvider = {
  id: "kling",
  name: "Kling AI",
  icon: "🖼️",
  endpoint: "",
  keyName: "kling_api_key",
  getApiKeyUrl: "https://klingai.com/",
};

const MIDJOURNEY_PROVIDER: AIProvider = {
  id: "midjourney",
  name: "Midjourney",
  icon: "🖌️",
  endpoint: "",
  keyName: "midjourney_api_key",
  getApiKeyUrl: "https://www.midjourney.com/",
};

function extractTopics(script: string): string[] {
  if (!script) return [];
  const topics: string[] = [];
  const seen = new Set<string>();
  const lines = script.split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Markdown headings
    if (/^#{1,6}\s+/.test(line)) {
      const t = line.replace(/^#{1,6}\s+/, "").trim();
      if (t.length > 3 && !seen.has(t)) { topics.push(t); seen.add(t); }
      continue;
    }

    // Numbered sections: 1. Título ou 1) Título
    if (/^\d+[\.|\)]\s+/.test(line)) {
      const t = line.replace(/^\d+[\.|\)]\s+/, "").trim();
      if (t.length > 3 && !seen.has(t)) { topics.push(t); seen.add(t); }
      continue;
    }

    // Explicit section keywords
    if (/^(t[óo]pico|se[cç][aã]o|cap[íi]tulo|parte)[:\-]\s+/i.test(line)) {
      const t = line.replace(/^(t[óo]pico|se[cç][aã]o|cap[íi]tulo|parte)[:\-]\s+/i, "").trim();
      if (t.length > 3 && !seen.has(t)) { topics.push(t); seen.add(t); }
      continue;
    }
  }

  // Fallback: use paragraphs if nothing matched
  if (topics.length === 0) {
    const paragraphs = script.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    paragraphs.slice(0, 6).forEach((p, i) => {
      const t = p.split(/\.|\!|\?/)[0].slice(0, 90).trim();
      if (t.length > 3 && !seen.has(t)) { topics.push(t); seen.add(t); }
    });
  }

  return topics.slice(0, 20); // limitar para UX
}

export function ImageGenerationSection({ script }: ImageGenerationSectionProps) {
  const { toast } = useToast();
  const [provider, setProvider] = useState<"leonardo" | "kling" | "midjourney">("leonardo");
  const [items, setItems] = useState<TopicItem[]>([]);
  const [showLeonardoModal, setShowLeonardoModal] = useState(false);
  const [showKlingModal, setShowKlingModal] = useState(false);
  const [showMidjourneyModal, setShowMidjourneyModal] = useState(false);
  const [leonardoKey, setLeonardoKey] = useState<string>(localStorage.getItem(LEONARDO_PROVIDER.keyName) || "");
  const [klingKey, setKlingKey] = useState<string>(localStorage.getItem(KLING_PROVIDER.keyName) || "");
  const [midjourneyKey, setMidjourneyKey] = useState<string>(localStorage.getItem(MIDJOURNEY_PROVIDER.keyName) || "");

  const topics = useMemo(() => extractTopics(script), [script]);

  useEffect(() => {
    // inicializa items quando o script muda
    const initialized = topics.map((t, idx) => ({
      id: `topic-${idx}`,
      title: t,
      prompt: `${t}`,
    }));
    setItems(initialized);
  }, [topics]);

  const handlePromptChange = (id: string, prompt: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, prompt } : it)));
  };

  const ensureKey = (prov: "leonardo" | "kling" | "midjourney"): string | null => {
    const map = {
      leonardo: LEONARDO_PROVIDER.keyName,
      kling: KLING_PROVIDER.keyName,
      midjourney: MIDJOURNEY_PROVIDER.keyName,
    } as const;
    const keyName = map[prov];
    const key = localStorage.getItem(keyName);
    if (!key) {
      if (prov === "leonardo") setShowLeonardoModal(true);
      if (prov === "kling") setShowKlingModal(true);
      if (prov === "midjourney") setShowMidjourneyModal(true);
      toast({ title: "API key necessária", description: `Configure a API do ${prov === "leonardo" ? "Leonardo" : prov === "kling" ? "Kling" : "Midjourney"}.` });
      return null;
    }
    return key;
  };

  const handleSaveKey = (prov: "leonardo" | "kling" | "midjourney") => {
    if (prov === "leonardo") {
      localStorage.setItem(LEONARDO_PROVIDER.keyName, leonardoKey.trim());
      toast({ title: "API salva", description: "Leonardo AI" });
    } else if (prov === "kling") {
      localStorage.setItem(KLING_PROVIDER.keyName, klingKey.trim());
      toast({ title: "API salva", description: "Kling AI" });
    } else {
      localStorage.setItem(MIDJOURNEY_PROVIDER.keyName, midjourneyKey.trim());
      toast({ title: "API salva", description: "Midjourney" });
    }
  };

  const generateOne = async (id: string) => {
    const item = items.find((x) => x.id === id);
    if (!item) return;

    if (provider !== "leonardo") {
      toast({ title: provider === "kling" ? "Kling AI" : "Midjourney", description: "Integração em breve. Forneça endpoint/documentação para habilitar.", variant: "destructive" });
      return;
    }

    const key = ensureKey("leonardo");
    if (!key) return;

    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, loading: true, error: undefined } : x)));
    try {
      const url = await generateLeonardoImage(key, { prompt: item.prompt });
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, imageUrl: url, loading: false } : x)));
      toast({ title: "Imagem gerada", description: item.title });
    } catch (e: any) {
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, loading: false, error: e?.message || "Erro" } : x)));
      toast({ title: "Falha ao gerar imagem", description: e?.message || "Erro", variant: "destructive" });
    }
  };

  const generateAll = async () => {
    if (provider !== "leonardo") {
      toast({ title: provider === "kling" ? "Kling AI" : "Midjourney", description: "Integração em breve.", variant: "destructive" });
      return;
    }
    const key = ensureKey("leonardo");
    if (!key) return;

    for (const it of items) {
      if (it.imageUrl) continue;
      await generateOne(it.id);
    }
  };

  // Render mesmo sem script para exibir campos de API

  return (
    <section className="mt-6">
      <Card className="shadow-dark">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Gerar Imagens por Tópico
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione o provedor" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="leonardo">Leonardo AI</SelectItem>
                  <SelectItem value="kling">Kling AI (em breve)</SelectItem>
                  <SelectItem value="midjourney">Midjourney (em breve)</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => {
                if (provider === "leonardo") setShowLeonardoModal(true);
                else if (provider === "kling") setShowKlingModal(true);
                else setShowMidjourneyModal(true);
              }}>
                <Settings className="w-4 h-4 mr-1" /> API
              </Button>

              <Button variant="secondary" size="sm" onClick={generateAll}>
                Gerar todas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium">Chaves de API</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="api-leonardo">Leonardo AI</Label>
                <div className="flex gap-2">
                  <Input id="api-leonardo" type="password" value={leonardoKey} onChange={(e) => setLeonardoKey(e.target.value)} placeholder="Cole a API key" />
                  <Button variant="outline" size="sm" onClick={() => handleSaveKey("leonardo")}>Salvar</Button>
                </div>
              </div>
              <div>
                <Label htmlFor="api-kling">Kling AI</Label>
                <div className="flex gap-2">
                  <Input id="api-kling" type="password" value={klingKey} onChange={(e) => setKlingKey(e.target.value)} placeholder="Cole a API key" />
                  <Button variant="outline" size="sm" onClick={() => handleSaveKey("kling")}>Salvar</Button>
                </div>
              </div>
              <div>
                <Label htmlFor="api-midjourney">Midjourney</Label>
                <div className="flex gap-2">
                  <Input id="api-midjourney" type="password" value={midjourneyKey} onChange={(e) => setMidjourneyKey(e.target.value)} placeholder="Cole a API key" />
                  <Button variant="outline" size="sm" onClick={() => handleSaveKey("midjourney")}>Salvar</Button>
                </div>
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum tópico identificado no roteiro.</p>
          ) : (
            items.map((it, idx) => (
              <div key={it.id} className="border rounded-lg p-4 bg-muted/30">
                <div className="flex flex-col md:flex-row md:items-end gap-3">
                  <div className="flex-1">
                    <Label htmlFor={`prompt-${it.id}`}>Tópico {idx + 1}: {it.title}</Label>
                    <Input id={`prompt-${it.id}`} value={it.prompt} onChange={(e) => handlePromptChange(it.id, e.target.value)} />
                  </div>
                  <Button onClick={() => generateOne(it.id)} disabled={!!it.loading}>
                    {it.loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando...</>) : "Gerar"}
                  </Button>
                </div>

                {it.error && (
                  <p className="text-xs text-destructive mt-2">{it.error}</p>
                )}

                {it.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={it.imageUrl}
                      alt={`Imagem gerada para o tópico ${it.title}`}
                      loading="lazy"
                      className="w-full max-w-md rounded-md border"
                    />
                    <div className="mt-2">
                      <a href={it.imageUrl} download target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm">Baixar</Button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modais de API */}
      <APIKeyModal
        isOpen={showLeonardoModal}
        onClose={() => setShowLeonardoModal(false)}
        onSave={() => {}}
        provider={LEONARDO_PROVIDER}
      />
      <APIKeyModal
        isOpen={showKlingModal}
        onClose={() => setShowKlingModal(false)}
        onSave={() => {}}
        provider={KLING_PROVIDER}
      />
      <APIKeyModal
        isOpen={showMidjourneyModal}
        onClose={() => setShowMidjourneyModal(false)}
        onSave={() => {}}
        provider={MIDJOURNEY_PROVIDER}
      />
    </section>
  );
}
