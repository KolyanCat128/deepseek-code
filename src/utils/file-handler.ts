import * as fs from 'fs-extra';
import * as path from 'path';

export class FileHandler {
  static async readFile(filePath: string): Promise<string> {
    try {
      const absolutePath = path.resolve(filePath);
      return await fs.readFile(absolutePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const absolutePath = path.resolve(filePath);
      await fs.ensureDir(path.dirname(absolutePath));
      await fs.writeFile(absolutePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error}`);
    }
  }

  static async appendFile(filePath: string, content: string): Promise<void> {
    try {
      const absolutePath = path.resolve(filePath);
      await fs.ensureDir(path.dirname(absolutePath));
      await fs.appendFile(absolutePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to append to file ${filePath}: ${error}`);
    }
  }

  static async fileExists(filePath: string): Promise<boolean> {
    try {
      const absolutePath = path.resolve(filePath);
      return await fs.pathExists(absolutePath);
    } catch {
      return false;
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      const absolutePath = path.resolve(filePath);
      await fs.remove(absolutePath);
    } catch (error) {
      throw new Error(`Failed to delete file ${filePath}: ${error}`);
    }
  }

  static getFileExtension(filePath: string): string {
    return path.extname(filePath).slice(1);
  }

  static getLanguageFromExtension(ext: string): string {
    const languageMap: { [key: string]: string } = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      rs: 'rust',
      go: 'go',
      php: 'php',
      rb: 'ruby',
      cs: 'csharp',
      swift: 'swift',
      kt: 'kotlin',
      jsx: 'jsx',
      tsx: 'tsx'
    };
    return languageMap[ext] || ext;
  }
}