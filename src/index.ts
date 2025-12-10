#!/usr/bin/env node
import { Command } from 'commander';
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

program
  .command('config <apiKey>')
  .option('-m, --model <model>', 'Model to use (deepseek-r1, deepseek-coder, deepseek-chat)', 'deepseek-r1')
  .description('Configure API key and model')
  .action(async (apiKey: string, options: any) => {
    try {
      const config = new Config(apiKey, options.model);
      await config.save();
      Logger.success('Configuration saved successfully!');
      Logger.info(`API Key: ${apiKey.slice(0, 5)}...`);
      Logger.info(`Model: ${options.model}`);
    } catch (error: any) {
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
        Logger.error('No configuration found. Please run: deepseek config <apiKey>');
        process.exit(1);
      }

      const client = new DeepSeekClient(config.getConfig());
      await analyzeCommand(filePath, client);
    } catch (error: any) {
      Logger.error(`Failed to analyze: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('generate <description>')
  .option('-l, --language <language>', 'Programming language (javascript, python, etc.)', 'javascript')
  .option('-o, --output <path>', 'Output file path')
  .option('-c, --context <context>', 'Additional context')
  .description('Generate code based on description')
  .action(async (description: string, options: any) => {
    try {
      const config = await Config.load();
      if (!config) {
        Logger.error('No configuration found. Please run: deepseek config <apiKey>');
        process.exit(1);
      }

      const client = new DeepSeekClient(config.getConfig());
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
    } catch (error: any) {
      Logger.error(`Failed to refactor: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}