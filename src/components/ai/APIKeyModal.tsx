import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, ExternalLink } from "lucide-react";
import { AIProvider } from "@/types/ai-providers";

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  provider: AIProvider;
}

export const APIKeyModal = ({ isOpen, onClose, onSave, provider }: APIKeyModalProps) => {
  const [apiKey, setApiKey] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(provider.keyName, apiKey);
      onSave(apiKey);
      onClose();
      setApiKey("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <span className="mr-2">{provider.icon}</span>
            Configurar API Key - {provider.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiKey">API Key do {provider.name}</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Cole sua API key aqui..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">
                Obtenha sua API key em:
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs text-primary hover:text-primary/80"
                onClick={() => window.open(provider.getApiKeyUrl, '_blank')}
              >
                {provider.getApiKeyUrl.replace('https://', '')}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};