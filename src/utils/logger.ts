import chalk from 'chalk';

export class Logger {
  static success(message: string) {
    console.log(chalk.green('✓'), message);
  }

  static error(message: string) {
    console.log(chalk.red('✗'), message);
  }

  static warning(message: string) {
    console.log(chalk.yellow('⚠'), message);
  }

  static info(message: string) {
    console.log(chalk.blue('ℹ'), message);
  }

  static debug(message: string) {
    if (process.env.DEBUG) {
      console.log(chalk.gray('◆'), message);
    }
  }

  static header(message: string) {
    console.log(chalk.bold.cyan(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n${message}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));
  }
}