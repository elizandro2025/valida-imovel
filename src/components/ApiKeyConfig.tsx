import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, ExternalLink, Info, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyConfigProps {
  onApiKeyChange: (apiKey: string) => void;
}

export const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem('mistral_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
      setIsValid(true);
    }
  }, [onApiKeyChange]);

  const validateApiKey = async (key: string) => {
    if (!key || key.trim().length < 20 || /\s/.test(key)) {
      setIsValid(false);
      return false;
    }

    setIsValidating(true);
    try {
      // Basic format validation for common Mistral key patterns
      const isValidFormat =
        /^(sk-[A-Za-z0-9]{20,}|mistral-[A-Za-z0-9_-]{20,}|[A-Za-z0-9]{24,})$/.test(key);
      
      if (isValidFormat) {
        setIsValid(true);
        localStorage.setItem('mistral_api_key', key);
        onApiKeyChange(key);
        toast({
          title: "Chave API salva",
          description: "Validação básica concluída. Testaremos ao processar o documento.",
        });
        return true;
      } else {
        setIsValid(false);
        return false;
      }
    } catch (error) {
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    setIsValid(null);
    
    if (newKey.length === 0) {
      localStorage.removeItem('mistral_api_key');
      onApiKeyChange('');
    }
  };

  const handleSaveKey = () => {
    validateApiKey(apiKey);
  };

  const handleRemoveKey = () => {
    setApiKey('');
    setIsValid(null);
    localStorage.removeItem('mistral_api_key');
    onApiKeyChange('');
    toast({
      title: "Chave API removida",
      description: "A chave API foi removida com sucesso.",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Configuração da API Mistral</CardTitle>
            <CardDescription>
              Configure sua chave API para usar o serviço de análise
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Justificativa para criação da chave API */}
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <div className="space-y-3">
              <p><strong>Por que você precisa de uma chave API Mistral?</strong></p>
              <div className="space-y-2 text-muted-foreground">
                <p>• <strong>Análise Inteligente:</strong> Utilizamos a IA da Mistral para processar e analisar suas matrículas imobiliárias com precisão profissional</p>
                <p>• <strong>Segurança:</strong> Sua chave permanece apenas no seu navegador - garantimos total privacidade dos seus dados</p>
                <p>• <strong>Qualidade:</strong> O modelo Mistral AI oferece análises detalhadas e relatórios precisos sobre documentos complexos</p>
                <p>• <strong>Custo-benefício:</strong> Você paga apenas pelo que usa diretamente na Mistral, sem intermediários</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Alert className="border-info/20 bg-info/5">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p><strong>Como obter sua chave API:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Acesse <a href="https://console.mistral.ai/api-keys" target="_blank" rel="noopener noreferrer" className="text-info hover:text-info/80 underline inline-flex items-center gap-1">console.mistral.ai/api-keys <ExternalLink className="w-3 h-3" /></a></li>
                <li>Faça login ou crie uma conta</li>
                <li>Vá em "API Keys" no menu lateral</li>
                <li>Clique em "Create new key" e copie a chave gerada</li>
                <li>Cole a chave no campo abaixo</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              Chave API Mistral
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={apiKey}
                onChange={handleApiKeyChange}
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isValid === true && (
                  <Check className="w-4 h-4 text-success" />
                )}
                {isValid === false && (
                  <X className="w-4 h-4 text-destructive" />
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSaveKey} 
              disabled={!apiKey || isValidating}
              className="flex-1"
            >
              {isValidating ? 'Validando...' : 'Salvar Chave'}
            </Button>
            {apiKey && (
              <Button 
                variant="outline" 
                onClick={handleRemoveKey}
                className="px-3"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {isValid === false && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>
                Chave API inválida. Verifique se você copiou a chave completa do console Mistral.
              </AlertDescription>
            </Alert>
          )}

          {isValid === true && (
            <Alert className="border-success/20 bg-success/5">
              <Check className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Chave API validada e salva com sucesso!
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Segurança:</strong> Sua chave API é armazenada apenas no seu navegador</p>
            <p><strong>Privacidade:</strong> Não compartilhamos ou armazenamos suas chaves em nossos servidores</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};