import { DeepSeekClient } from '../utils/deepseek-client.js';
import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';
import { ExplanationResult } from '../types.js';

export async function explainCommand(filePath: string, client: DeepSeekClient): Promise<void> {
  try {
    Logger.info(`Explaining code from: ${filePath}`);
    
    const code = await FileHandler.readFile(filePath);
    const ext = FileHandler.getFileExtension(filePath);
    const language = FileHandler.getLanguageFromExtension(ext);

    const result = await client.explainCode(code, language);
    
    try {
      const explanation: ExplanationResult = JSON.parse(result);
      
      Logger.header('Code Explanation');
      
      console.log(`📋 Summary:\n${explanation.summary}\n`);
      
      console.log('📚 Details:');
      explanation.details.forEach((detail, index) => {
        console.log(`${index + 1}. ${detail}`);
      });

      console.log(`\n⏱️ Complexity: ${explanation.complexity}\n`);
      
      console.log('🔑 Key Points:');
      explanation.key_points.forEach((point, index) => {
        console.log(`${index + 1}. ${point}`);
      });
    } catch {
      console.log(result);
    }
  } catch (error: any) {
    Logger.error(`Explanation failed: ${error.message}`);
    process.exit(1);
  }
}