import chalk from 'chalk';
import * as readline from 'readline';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Config } from './config. js';
import { DeepSeekClient } from './utils/deepseek-client.js';
import { TrustManager, APIKeyValidator } from './utils/trust-manager.js';
import { Logger } from './utils/logger.js';
import { FileHandler } from './utils/file-handler.js';
import { analyzeCommand } from './commands/analyze.js';
import { generateCommand } from './commands/generate.js';
import { explainCommand } from './commands/explain. js';
import { refactorCommand } from './commands/refactor.js';

const WELCOME_TEXT = `
╭─── ${chalk.bold.cyan('DeepSeek Code v1.0.0')} ${'─'.repeat(50)}╮
│                                                                     │
│       ${chalk.cyan('Welcome back')} ${chalk.bold(process.env.USER || 'User')}!      │
│                                                                     │
│            ${chalk.yellow('🔍 Code Analysis & Generation')}              │
│            ${chalk.yellow('🚀 Powered by DeepSeek API')}                 │
│                                                                     │
│   ${chalk.gray('Tips for getting started:')}                          │
│   • ${chalk.cyan('/login')} - Set or update your API key                 │
│   • ${chalk.cyan('/analyze <file>')} - Analyze code in a file             │
│   • ${chalk.cyan('/generate <description>')} - Generate code             │
│   • ${chalk. cyan('/explain <file>')} - Explain code                      │
│   • ${chalk. cyan('/refactor <file>')} - Refactor code                    │
│   • ${chalk.cyan('/help')} - Show all commands                           │
│   • ${chalk.cyan('/exit')} - Exit the application                        │
│                                                                     │
╰─────────────────────────────────────────────────────────────────╯
`;

export class InteractiveShell {
  private rl: readline.Interface;
  private config: Config | null = null;
  private workingDir: string;

  constructor(workingDir: string = process. cwd()) {
    this.workingDir = workingDir;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });
  }

  async start(): Promise<void> {
    // Check trust
    const trusted = await TrustManager.checkTrust(this.workingDir);
    if (!trusted) {
      return;
    }

    console.clear();
    console.log(WELCOME_TEXT);

    // Load config
    this.config = await Config.load();
    if (!this.config) {
      Logger.warning('No API key configured. Use /login to set your API key.');
    }

    await this.showPrompt();
  }

  private async showPrompt(): Promise<void> {
    this.rl.question(
      chalk.cyan('\n> '),
      async (input: string) => {
        const trimmed = input.trim();

        if (!trimmed) {
          await this.showPrompt();
          return;
        }

        await this.handleCommand(trimmed);
        await this.showPrompt();
      }
    );
  }

  private async handleCommand(input: string): Promise<void> {
    const parts = input.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case '/login':
        await this.handleLogin();
        break;
      case '/analyze':
        if (args.length === 0) {
          Logger.error('Usage: /analyze <file>');
        } else {
          await this. handleAnalyze(args. join(' '));
        }
        break;
      case '/generate':
        if (args.length === 0) {
          Logger.error('Usage: /generate <description>');
        } else {
          await this.handleGenerate(args.join(' '));
        }
        break;
      case '/explain':
        if (args.length === 0) {
          Logger.error('Usage: /explain <file>');
        } else {
          await this. handleExplain(args.join(' '));
        }
        break;
      case '/refactor':
        if (args.length === 0) {
          Logger.error('Usage: /refactor <file>');
        } else {
          await this.handleRefactor(args.join(' '));
        }
        break;
      case '/help':
        this.showHelp();
        break;
      case '/exit': 
      case '/quit':
        this.exit();
        break;
      case '?':
        this.showShortcuts();
        break;
      default:
        Logger.error(`Unknown command: ${command}. Type /help for available commands.`);
    }
  }

  private async handleLogin(): Promise<void> {
    return new Promise((resolve) => {
      this.rl.question(chalk.cyan('Enter your DeepSeek API key: '), async (apiKey:  string) => {
        if (!apiKey. trim()) {
          Logger.error('API key cannot be empty');
          resolve();
          return;
        }

        console.log(chalk.gray('Validating API key...'));
        const isValid = await APIKeyValidator. validateKey(apiKey);

        if (isValid) {
          const config = new Config(apiKey);
          await config.save();
          this.config = config;
          Logger.success('✓ API key is valid and has been saved! ');
          console.log(chalk.cyan(`API Key: ${apiKey. slice(0, 10)}...${apiKey.slice(-4)}`));
        } else {
          Logger.error('✗ API key invalid, please type another api key');
        }
        resolve();
      });
    });
  }

  private async handleAnalyze(filePath: string): Promise<void> {
    if (!this.config) {
      Logger.error('No API key configured. Use /login first.');
      return;
    }

    try {
      const client = new DeepSeekClient(this.config. getConfig());
      await analyzeCommand(filePath, client);
    } catch (error:  any) {
      Logger.error(error.message);
    }
  }

  private async handleGenerate(description: string): Promise<void> {
    if (!this.config) {
      Logger.error('No API key configured. Use /login first.');
      return;
    }

    return new Promise((resolve) => {
      this.rl.question(
        chalk.cyan('Programming language (default: javascript): '),
        async (language: string) => {
          this.rl.question(
            chalk.cyan('Output file path (optional): '),
            async (outputPath: string) => {
              try {
                const client = new DeepSeekClient(this.config! .getConfig());
                await generateCommand(
                  description,
                  language || 'javascript',
                  outputPath,
                  undefined,
                  client
                );
              } catch (error: any) {
                Logger.error(error. message);
              }
              resolve();
            }
          );
        }
      );
    });
  }

  private async handleExplain(filePath:  string): Promise<void> {
    if (!this.config) {
      Logger.error('No API key configured. Use /login first.');
      return;
    }

    try {
      const client = new DeepSeekClient(this.config.getConfig());
      await explainCommand(filePath, client);
    } catch (error: any) {
      Logger.error(error.message);
    }
  }

  private async handleRefactor(filePath: string): Promise<void> {
    if (!this.config) {
      Logger.error('No API key configured. Use /login first.');
      return;
    }

    return new Promise((resolve) => {
      this.rl.question(
        chalk.cyan('Output file path (optional): '),
        async (outputPath: string) => {
          this.rl.question(
            chalk.cyan('Refactoring goals (optional): '),
            async (goals: string) => {
              try {
                const client = new DeepSeekClient(this.config!.getConfig());
                await refactorCommand(
                  filePath,
                  outputPath,
                  goals,
                  client
                );
              } catch (error: any) {
                Logger.error(error.message);
              }
              resolve();
            }
          );
        }
      );
    });
  }

  private showHelp(): void {
    console.log(chalk.bold.cyan('\n📚 Available Commands:\n'));
    console.log(chalk.cyan('  /login <apiKey>              ') + 'Set or update your DeepSeek API key');
    console.log(chalk.cyan('  /analyze <file>              ') + 'Analyze code for bugs and issues');
    console.log(chalk.cyan('  /generate <description>      ') + 'Generate code from description');
    console.log(chalk.cyan('  /explain <file>              ') + 'Get detailed explanation of code');
    console.log(chalk.cyan('  /refactor <file>             ') + 'Refactor code for better quality');
    console.log(chalk.cyan('  /help                        ') + 'Show this help message');
    console.log(chalk.cyan('  ?                             ') + 'Show keyboard shortcuts');
    console.log(chalk.cyan('  /exit                        ') + 'Exit the application\n');
  }

  private showShortcuts(): void {
    console.log(chalk.bold.cyan('\n⌨️  Keyboard Shortcuts:\n'));
    console.log(chalk.gray('  Ctrl+C          ') + 'Exit application');
    console.log(chalk.gray('  Tab             ') + 'Toggle thinking mode');
    console.log(chalk.gray('  Up/Down         ') + 'Navigate command history');
    console.log(chalk.gray('  Ctrl+U          ') + 'Clear current line\n');
  }

  private exit(): void {
    console.log(chalk.cyan('\n👋 Goodbye!\n'));
    this.rl.close();
    process.exit(0);
  }
}

export async function startInteractiveShell(): Promise<void> {
  const shell = new InteractiveShell(process.cwd());
  await shell.start();
}
</parameter>

Теперь обновим `src/index.ts` чтобы поддержать интерактивный режим:

```typescript name=src/index.ts
#!/usr/bin/env node
import { Command } from 'commander';
import { startInteractiveShell } from './interactive. js';
import { Config } from './config.js';
import { DeepSeekClient } from './utils/deepseek-client.js';
import { Logger } from './utils/logger.js';
import { analyzeCommand } from './commands/analyze.js';
import { generateCommand } from './commands/generate.js';
import { explainCommand } from './commands/explain.js';
import { refactorCommand } from './commands/refactor.js';

const program = new Command();

program
  .name('deepseek')
  .description('DeepSeek Code CLI - AI-powered code analysis and generation')
  .version('1.0.0');

// Interactive mode (default)
program
  .command('interactive')
  .alias('i')
  .description('Start interactive shell mode')
  .action(async () => {
    await startInteractiveShell();
  });

program
  .command('config <apiKey>')
  .option('-m, --model <model>', 'Model to use (deepseek-r1, deepseek-coder, deepseek-chat)', 'deepseek-r1')
  .description('Configure API key and model')
  .action(async (apiKey: string, options: any) => {
    try {
      const config = new Config(apiKey, options. model);
      await config.save();
      Logger.success('Configuration saved successfully!');
      Logger.info(`API Key: ${apiKey.slice(0, 5)}...`);
      Logger.info(`Model: ${options.model}`);
    } catch (error:  any) {
      Logger.error(`Configuration failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('analyze <file>')
  .description('Analyze code in a file')
  .action(async (filePath: string) => {
    try {
      const config = await Config.load();
      if (!config) {
        Logger.error('No configuration found. Please run:  deepseek config <apiKey>');
        process.exit(1);
      }

      const client = new DeepSeekClient(config. getConfig());
      await analyzeCommand(filePath, client);
    } catch (error: any) {
      Logger.error(`Failed to analyze:  ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('generate <description>')
  .option('-l, --language <language>', 'Programming language (javascript, python, etc.)', 'javascript')
  .option('-o, --output <path>', 'Output file path')
  .option('-c, --context <context>', 'Additional context')
  .description('Generate code based on description')
  .action(async (description: string, options:  any) => {
    try {
      const config = await Config. load();
      if (!config) {
        Logger.error('No configuration found. Please run: deepseek config <apiKey>');
        process.exit(1);
      }

      const client = new DeepSeekClient(config. getConfig());
      await generateCommand(description, options.language, options.output, options.context, client);
    } catch (error: any) {
      Logger.error(`Failed to generate: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('explain <file>')
  .description('Explain code in a file')
  .action(async (filePath: string) => {
    try {
      const config = await Config.load();
      if (!config) {
        Logger.error('No configuration found. Please run: deepseek config <apiKey>');
        process.exit(1);
      }

      const client = new DeepSeekClient(config.getConfig());
      await explainCommand(filePath, client);
    } catch (error: any) {
      Logger.error(`Failed to explain: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('refactor <file>')
  .option('-o, --output <path>', 'Output file path')
  .option('-g, --goals <goals>', 'Refactoring goals')
  .description('Refactor code in a file')
  .action(async (filePath: string, options: any) => {
    try {
      const config = await Config.load();
      if (!config) {
        Logger.error('No configuration found. Please run: deepseek config <apiKey>');
        process.exit(1);
      }

      const client = new DeepSeekClient(config.getConfig());
      await refactorCommand(filePath, options.output, options.goals, client);
    } catch (error:  any) {
      Logger.error(`Failed to refactor: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);

// If no command provided, start interactive mode
if (!process.argv.slice(2).length) {
  startInteractiveShell().catch((error) => {
    Logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}
