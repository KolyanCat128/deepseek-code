import { DeepSeekClient } from '../utils/deepseek-client.js';
import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';

export async function generateCommand(
  description: string,
  language: string,
  outputPath: string,
  context: string | undefined,
  client: DeepSeekClient
): Promise<void> {
  try {
    Logger.info(`Generating ${language} code...`);
    
    const result = await client.generateCode(description, language, context);
    
    Logger.header('Generated Code');
    console.log(result);

    if (outputPath) {
      await FileHandler.writeFile(outputPath, result);
      Logger.success(`Code saved to: ${outputPath}`);
    }
  } catch (error: any) {
    Logger.error(`Generation failed: ${error.message}`);
    process.exit(1);
  }
}