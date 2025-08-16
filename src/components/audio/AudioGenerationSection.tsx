import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Volume2, Download, Loader2, Settings } from "lucide-react";

interface AudioGenerationSectionProps {
  script: string;
}

const ELEVEN_KEY_NAME = "elevenlabs_api_key";

const DEFAULT_VOICES: { id: string; name: string }[] = [
  { name: "Aria", id: "9BWtsMINqrJLrRacOk9x" },
  { name: "Roger", id: "CwhRBWXzGAHq8TQ4Fs17" },
  { name: "Sarah", id: "EXAVITQu4vr4xnSDxMaL" },
  { name: "Laura", id: "FGY2WhTYpPnrIDTdsKH5" },
  { name: "Charlie", id: "IKne3meq5aSn9XLyUdCD" },
  { name: "George", id: "JBFqnCBsd6RMkjVDRZzb" },
  { name: "Callum", id: "N2lVS1w4EtoT3dr4eOWO" },
  { name: "River", id: "SAz9YHcvj6GT2YYXdXww" },
  { name: "Liam", id: "TX3LPaxmHKxFdv7VOQHJ" },
  { name: "Charlotte", id: "XB0fDUnXU5powFXDhCwa" },
  { name: "Alice", id: "Xb7hH8MSUJpSbSDYk0k2" },
  { name: "Matilda", id: "XrExE9yKIg1WjnnlVkGX" },
  { name: "Will", id: "bIHbv24MWmeRgasZH58o" },
  { name: "Jessica", id: "cgSgspJ2msm6clMCkdW9" },
  { name: "Eric", id: "cjVigY5qzO86Huf0OWal" },
  { name: "Chris", id: "iP95p4xoKVk53GoZ742B" },
  { name: "Brian", id: "nPczCjzI2devNBz1zQrb" },
  { name: "Daniel", id: "onwK4e9ZLuTAKqWW03F9" },
  { name: "Lily", id: "pFZP5JQG7iQjIQuC4Bku" },
  { name: "Bill", id: "pqHfZKP75CvOlQylNhV4" },
];

const MODELS = [
  { id: "eleven_multilingual_v2", name: "Eleven Multilingual v2" },
  { id: "eleven_turbo_v2_5", name: "Eleven Turbo v2.5" },
  { id: "eleven_turbo_v2", name: "Eleven Turbo v2" },
];

export function AudioGenerationSection({ script }: AudioGenerationSectionProps) {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem(ELEVEN_KEY_NAME) || "");
  const [voiceId, setVoiceId] = useState<string>(DEFAULT_VOICES[0].id);
  const [modelId, setModelId] = useState<string>(MODELS[0].id);
  const [text, setText] = useState<string>(script || "");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedName, setImportedName] = useState<string>("");

  const onImportClick = () => fileInputRef.current?.click();
  const onFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioUrl((prev) => {
      if (prev) {
        try { URL.revokeObjectURL(prev); } catch {}
      }
      return url;
    });
    setImportedName(file.name);
    toast({ title: "Áudio importado", description: file.name });
  };

  useEffect(() => {
    setText(script || "");
  }, [script]);

  const saveKey = () => {
    localStorage.setItem(ELEVEN_KEY_NAME, apiKey.trim());
    toast({ title: "API salva", description: "ElevenLabs" });
  };

  const canGenerate = useMemo(() => Boolean(text && text.trim().length > 0), [text]);

  const generateAudio = async () => {
    const key = localStorage.getItem(ELEVEN_KEY_NAME);
    if (!key) {
      toast({ title: "API key necessária", description: "Informe sua API do ElevenLabs.", variant: "destructive" });
      return;
    }
    if (!canGenerate) {
      toast({ title: "Sem conteúdo", description: "Gere ou cole um roteiro para converter em áudio." });
      return;
    }

    setIsLoading(true);
    setAudioUrl("");
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Erro ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      toast({ title: "Áudio gerado", description: "Reprodução pronta." });
    } catch (e: any) {
      toast({ title: "Falha ao gerar áudio", description: e?.message || "Erro", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mt-6">
      <Card className="shadow-dark">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Gerar Áudio do Roteiro
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={saveKey}>
                <Settings className="w-4 h-4 mr-1" /> Salvar API
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
            <div>
              <Label htmlFor="eleven-api">ElevenLabs API Key</Label>
              <Input
                id="eleven-api"
                type="password"
                placeholder="Cole sua API key do ElevenLabs"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {localStorage.getItem(ELEVEN_KEY_NAME) ? "API key configurada" : "Cole sua API key para habilitar a geração de áudio."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Voz</Label>
                <Select value={voiceId} onValueChange={setVoiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a voz" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-64 overflow-auto">
                    {DEFAULT_VOICES.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Modelo</Label>
                <Select value={modelId} onValueChange={setModelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="audio-text">Texto para conversão</Label>
            <Textarea
              id="audio-text"
              placeholder="O texto do seu roteiro aparecerá aqui. Você pode editar antes de gerar o áudio."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[160px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={onFileChange} />
            <Button variant="outline" onClick={onImportClick}>Importar Áudio</Button>
            <Button onClick={generateAudio} disabled={isLoading || !canGenerate}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Gerar Áudio"
              )}
            </Button>
            {audioUrl && (
              <a href={audioUrl} download>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" /> Baixar Áudio
                </Button>
              </a>
            )}
            {importedName && (
              <span className="text-xs text-muted-foreground truncate max-w-[160px]">Arquivo: {importedName}</span>
            )}
          </div>

          {audioUrl && (
            <div className="mt-2">
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
