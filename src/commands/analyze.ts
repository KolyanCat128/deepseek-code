import { DeepSeekClient } from '../utils/deepseek-client.js';
import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';
import { CodeAnalysisResult } from '../types.js';

export async function analyzeCommand(filePath: string, client: DeepSeekClient): Promise<void> {
  try {
    Logger.info(`Analyzing file: ${filePath}`);
    
    const code = await FileHandler.readFile(filePath);
    const ext = FileHandler.getFileExtension(filePath);
    const language = FileHandler.getLanguageFromExtension(ext);

    const result = await client.analyzeCode(code, language);
    
    try {
      const analysis: CodeAnalysisResult = JSON.parse(result);
      
      Logger.header('Code Analysis Results');
      
      console.log(`\n📊 Quality Score: ${analysis.quality_score}/100\n`);
      
      if (analysis.issues.length > 0) {
        Logger.warning('Issues Found:');
        analysis.issues.forEach((issue, index) => {
          const severityIcon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
          console.log(`\n${severityIcon} Issue #${index + 1} (Line ${issue.line})`);
          console.log(`   Type: ${issue.type}`);
          console.log(`   Message: ${issue.message}`);
          if (issue.suggestion) {
            console.log(`   Suggestion: ${issue.suggestion}`);
          }
        });
      } else {
        Logger.success('No issues found!');
      }

      if (analysis.suggestions.length > 0) {
        console.log('\n💡 Suggestions:');
        analysis.suggestions.forEach((suggestion, index) => {
          console.log(`${index + 1}. ${suggestion}`);
        });
      }

      console.log(`\n📝 Summary:\n${analysis.summary}`);
    } catch {
      console.log(result);
    }
  } catch (error: any) {
    Logger.error(`Analysis failed: ${error.message}`);
    process.exit(1);
  }
}
