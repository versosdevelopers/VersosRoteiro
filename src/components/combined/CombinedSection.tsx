import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, Volume2, FileDown } from "lucide-react";

interface CombinedSectionProps {
  script: string;
}

export function CombinedSection({ script }: CombinedSectionProps) {
  const { toast } = useToast();

  const [text, setText] = useState<string>(script || "");

  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [audioDataUrl, setAudioDataUrl] = useState<string>("");
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(script || "");
  }, [script]);

  const pickImage = () => imageInputRef.current?.click();
  const pickAudio = () => audioInputRef.current?.click();

  const handleImageFile = (file: File) => {
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
    const tempUrl = URL.createObjectURL(file);
    setImageUrl(tempUrl);
    toast({ title: "Imagem importada", description: file.name });
  };

  const handleAudioFile = (file: File) => {
    setAudioFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setAudioDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
    const tempUrl = URL.createObjectURL(file);
    setAudioUrl(tempUrl);
    toast({ title: "Áudio importado", description: file.name });
  };

  const onImageFileChange = (e: any) => {
    const f = e.target.files?.[0];
    if (f) handleImageFile(f);
  };

  const onAudioFileChange = (e: any) => {
    const f = e.target.files?.[0];
    if (f) handleAudioFile(f);
  };

  const handleImageUrlPaste = (val: string) => {
    setImageUrl(val);
    setImageDataUrl("");
  };

  const handleAudioUrlPaste = (val: string) => {
    setAudioUrl(val);
    setAudioDataUrl("");
  };

  const buildHtmlAndDownload = async () => {
    // Preferir data URLs quando disponíveis; caso contrário, usar URLs fornecidas
    const imgSrc = imageDataUrl || imageUrl;
    const audSrc = audioDataUrl || audioUrl;

    if (!imgSrc || !audSrc || !text.trim()) {
      toast({ title: "Faltam dados", description: "Selecione imagem, áudio e texto do roteiro.", variant: "destructive" });
      return;
    }

    const safeText = text
      .split('\n')
      .map((p) => `<p>${p.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`) 
      .join("\n");

    const html = `<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Projeto combinado</title>
  <meta name="description" content="Página com imagem, áudio e roteiro combinados" />
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'; }
    .wrap { display: grid; gap: 16px; padding: 16px; max-width: 960px; margin: 0 auto; }
    .media { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb22; }
    .media img { width: 100%; height: auto; display: block; }
    .overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(180deg, #0000, #000a); color: #fff; padding: 16px; }
    .script { line-height: 1.6; }
    .audio { width: 100%; }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="media">
      <img src="${imgSrc}" alt="Imagem do projeto combinado" />
      <div class="overlay">
        <strong>Resumo do Roteiro</strong>
      </div>
    </section>
    <section>
      <audio class="audio" controls src="${audSrc}"></audio>
    </section>
    <article class="script">${safeText}</article>
  </main>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projeto-combinado.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "Arquivo gerado", description: "Baixamos um HTML com tudo combinado." });
  };

  return (
    <section className="mt-6">
      <Card className="shadow-dark">
        <CardHeader>
          <CardTitle>Combinar Roteiro, Imagem e Áudio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="combined-text">Roteiro</Label>
            <Textarea
              id="combined-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Seu roteiro aparecerá aqui. Você pode editar."
              className="min-h-[160px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Imagem</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Cole uma URL de imagem"
                  value={imageDataUrl ? "(imagem do arquivo selecionada)" : imageUrl}
                  onChange={(e) => handleImageUrlPaste(e.target.value)}
                  disabled={Boolean(imageDataUrl)}
                />
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={onImageFileChange} />
                <Button variant="outline" onClick={pickImage}>
                  <ImageIcon className="w-4 h-4 mr-1" /> Importar
                </Button>
              </div>
              {(imageUrl || imageDataUrl) && (
                <img
                  src={imageDataUrl || imageUrl}
                  alt="Pré-visualização da imagem combinada"
                  className="rounded-md border max-h-48 object-cover"
                />)
              }
              {imageFileName && (
                <p className="text-xs text-muted-foreground">Arquivo: {imageFileName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Áudio</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Cole uma URL de áudio"
                  value={audioDataUrl ? "(áudio do arquivo selecionado)" : audioUrl}
                  onChange={(e) => handleAudioUrlPaste(e.target.value)}
                  disabled={Boolean(audioDataUrl)}
                />
                <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={onAudioFileChange} />
                <Button variant="outline" onClick={pickAudio}>
                  <Volume2 className="w-4 h-4 mr-1" /> Importar
                </Button>
              </div>
              {(audioUrl || audioDataUrl) && (
                <audio controls src={audioDataUrl || audioUrl} className="w-full" />
              )}
              {audioFileName && (
                <p className="text-xs text-muted-foreground">Arquivo: {audioFileName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={buildHtmlAndDownload}>
              <FileDown className="w-4 h-4 mr-2" /> Baixar página HTML
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
