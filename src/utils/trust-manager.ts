import chalk from 'chalk';
import * as readline from 'readline';
import * as fs from 'fs-extra';
import * as path from 'path';
import axios from 'axios';

const TRUST_FILE = '.deepseek-trust';

export class TrustManager {
  static async checkTrust(workingDir: string): Promise<boolean> {
    const trustFilePath = path.join(workingDir, TRUST_FILE);
    
    if (await fs.pathExists(trustFilePath)) {
      return true;
    }

    await this.showTrustPrompt(workingDir);
    return await fs.pathExists(trustFilePath);
  }

  private static async showTrustPrompt(workingDir: string): Promise<void> {
    console.clear();
    console.log(chalk.bold.yellow('🔒 Security Check'));
    console.log(chalk.gray('─'.repeat(80)));
    console.log();
    console.log(chalk.white('Do you trust the files in this folder?'));
    console.log();
    console.log(chalk.cyan(workingDir));
    console.log();
    console.log(chalk.gray('DeepSeek may read, write, or execute files contained in this directory.'));
    console.log(chalk.gray('This can pose security risks, so only use files from trusted sources.'));
    console.log();
    console.log(chalk.gray('Learn more: https://deepseek.com/security'));
    console.log();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      console.log(chalk.cyan('  > 1. Yes, proceed'));
      console.log(chalk.cyan('    2. No, exit'));
      console.log();

      rl.question(chalk.cyan('Enter to confirm · Esc to exit: '), async (answer) => {
        rl.close();

        if (answer === '1' || answer.toLowerCase() === 'yes') {
          const trustFilePath = path.join(workingDir, TRUST_FILE);
          await fs.writeFile(trustFilePath, 'trusted');
          console.log(chalk.green('✓ Trust established for this folder'));
          console.log();
          resolve();
        } else {
          console.log(chalk.red('✗ Operation cancelled'));
          process.exit(0);
        }
      });
    });
  }
}

export class APIKeyValidator {
  static async validateKey(apiKey: string): Promise<boolean> {
    try {
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      return response.status === 200;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return false;
      }
      return false;
    }
  }
}
