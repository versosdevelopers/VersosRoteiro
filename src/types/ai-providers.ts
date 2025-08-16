export interface AIProvider {
  id: string;
  name: string;
  icon: string;
  endpoint: string;
  keyName: string;
  getApiKeyUrl: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '🟢',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    keyName: 'gemini_api_key',
    getApiKeyUrl: 'https://makersuite.google.com/app/apikey'
  },
  {
    id: 'openai',
    name: 'OpenAI ChatGPT',
    icon: '🟡',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    keyName: 'openai_api_key',
    getApiKeyUrl: 'https://platform.openai.com/api-keys'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    icon: '🔵',
    endpoint: 'https://api.anthropic.com/v1/messages',
    keyName: 'claude_api_key',
    getApiKeyUrl: 'https://console.anthropic.com/'
  },
  {
    id: 'grok',
    name: 'Grok (X.AI)',
    icon: '⚫',
    endpoint: 'https://api.x.ai/v1/chat/completions',
    keyName: 'grok_api_key',
    getApiKeyUrl: 'https://console.x.ai/'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: '🟣',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    keyName: 'mistral_api_key',
    getApiKeyUrl: 'https://console.mistral.ai/'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔴',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    keyName: 'deepseek_api_key',
    getApiKeyUrl: 'https://platform.deepseek.com/api_keys'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '🟠',
    endpoint: 'https://api.perplexity.ai/chat/completions',
    keyName: 'perplexity_api_key',
    getApiKeyUrl: 'https://www.perplexity.ai/settings/api'
  }
];

export interface ScriptData {
  topic: string;
  duration: string;
  style: string;
  styleKeywords: string;
  language: string;
  niche: string;
  subniche: string;
  microniche: string;
  nanoniche: string;
  audience: string;
  additionalInfo: string;
  youtubeLink: string;
  qualified: boolean;
}