import axios, { AxiosInstance } from 'axios';
import { DeepSeekConfig } from '../types.js';
import { Logger } from './logger.js';

export class DeepSeekClient {
  private client: AxiosInstance;
  private config: DeepSeekConfig;

  constructor(config: DeepSeekConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const response = await this.client.post('/chat/completions', {
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });

      return response.data.choices[0].message.content;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your credentials.');
      }
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async analyzeCode(code: string, language: string): Promise<string> {
    const prompt = `You are a code review expert. Analyze the following ${language} code for:
1. Potential bugs and issues
2. Performance problems
3. Security vulnerabilities
4. Code quality improvements
5. Best practices violations

Provide a detailed analysis with severity levels.

Code:
\`\`\`${language}
${code}
\`\`\`

Format your response as JSON with the following structure:
{
  "issues": [{"line": number, "type": string, "severity": "error|warning|info", "message": string, "suggestion": string}],
  "suggestions": [string],
  "summary": string,
  "quality_score": number (0-100)
}`;

    const response = await this.chat([
      { role: 'user', content: prompt }
    ]);

    return response;
  }

  async generateCode(description: string, language: string, context?: string): Promise<string> {
    let prompt = `Generate ${language} code that: ${description}`;
    
    if (context) {
      prompt += `\n\nContext:\n${context}`;
    }

    prompt += '\n\nProvide clean, well-commented, production-ready code.';

    const response = await this.chat([
      { role: 'user', content: prompt }
    ]);

    return response;
  }

  async explainCode(code: string, language: string): Promise<string> {
    const prompt = `Explain the following ${language} code in detail:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. A clear summary of what the code does
2. Detailed explanation of key parts
3. Time and space complexity if applicable
4. Key points to understand

Format as JSON:
{
  "summary": string,
  "details": [string],
  "complexity": string,
  "key_points": [string]
}`;

    const response = await this.chat([
      { role: 'user', content: prompt }
    ]);

    return response;
  }

  async refactorCode(code: string, language: string, goals?: string): Promise<string> {
    let prompt = `Refactor the following ${language} code for better quality, readability, and performance:

\`\`\`${language}
${code}
\`\`\``;

    if (goals) {
      prompt += `\n\nRefactoring goals: ${goals}`;
    }

    prompt += `\n\nProvide the refactored code with explanations.

Format as JSON:
{
  "original": string,
  "refactored": string,
  "improvements": [string],
  "explanation": string
}`;

    const response = await this.chat([
      { role: 'user', content: prompt }
    ]);

    return response;
  }

  setModel(model: 'deepseek-coder' | 'deepseek-r1' | 'deepseek-chat') {
    this.config.model = model;
  }

  setTemperature(temperature: number) {
    this.config.temperature = temperature;
  }

  setMaxTokens(maxTokens: number) {
    this.config.maxTokens = maxTokens;
  }
}
