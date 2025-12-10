import * as fs from 'fs-extra';
import * as path from 'path';
import { DeepSeekConfig } from './types.js';

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.deepseek-code');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export class Config {
  private config: DeepSeekConfig;

  constructor(apiKey: string, model: string = 'deepseek-r1') {
    this.config = {
      apiKey,
      baseUrl: 'https://api.deepseek.com/v1',
      model: (model as any) || 'deepseek-r1',
      maxTokens: 4096,
      temperature: 0.7
    };
  }

  getConfig(): DeepSeekConfig {
    return this.config;
  }

  setModel(model: 'deepseek-coder' | 'deepseek-r1' | 'deepseek-chat') {
    this.config.model = model;
  }

  setTemperature(temp: number) {
    if (temp < 0 || temp > 1) {
      throw new Error('Temperature must be between 0 and 1');
    }
    this.config.temperature = temp;
  }

  setMaxTokens(tokens: number) {
    if (tokens < 1) {
      throw new Error('Max tokens must be at least 1');
    }
    this.config.maxTokens = tokens;
  }

  async save() {
    try {
      await fs.ensureDir(CONFIG_DIR);
      await fs.writeJSON(CONFIG_FILE, this.config, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  static async load(): Promise<Config | null> {
    try {
      if (await fs.pathExists(CONFIG_FILE)) {
        const data = await fs.readJSON(CONFIG_FILE);
        const config = new Config(data.apiKey, data.model);
        config.config = data;
        return config;
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
    return null;
  }
}