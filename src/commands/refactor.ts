import { DeepSeekClient } from '../utils/deepseek-client.js';
import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';
import { RefactorResult } from '../types.js';

export async function refactorCommand(
  filePath: string,
  outputPath: string | undefined,
  goals: string | undefined,
  client: DeepSeekClient
): Promise<void> {
  try {
    Logger.info(`Refactoring code from: ${filePath}`);
    
    const code = await FileHandler.readFile(filePath);
    const ext = FileHandler.getFileExtension(filePath);
    const language = FileHandler.getLanguageFromExtension(ext);

    const result = await client.refactorCode(code, language, goals);
    
    try {
      const refactor: RefactorResult = JSON.parse(result);
      
      Logger.header('Code Refactoring Results');
      
      console.log('🔧 Improvements Made:');
      refactor.improvements.forEach((improvement, index) => {
        console.log(`${index + 1}. ${improvement}`);
      });

      console.log('\n📝 Explanation:');
      console.log(refactor.explanation);

      console.log('\n✨ Refactored Code:');
      console.log(`\`\`\`${language}`);
      console.log(refactor.refactored);
      console.log('```');

      if (outputPath) {
        await FileHandler.writeFile(outputPath, refactor.refactored);
        Logger.success(`Refactored code saved to: ${outputPath}`);
      }
    } catch {
      console.log(result);
    }
  } catch (error: any) {
    Logger.error(`Refactoring failed: ${error.message}`);
    process.exit(1);
  }
}