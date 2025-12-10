# DeepSeek Code CLI

A powerful command-line tool for code analysis, generation, and refactoring using DeepSeek API.

## Features

- 🔍 **Code Analysis** - Detect bugs, security issues, and quality problems
- 🚀 **Code Generation** - Generate code from descriptions
- 📚 **Code Explanation** - Understand complex code
- 🔧 **Code Refactoring** - Improve code quality
- 🤖 **Multiple Models** - Support for DeepSeek-R1, DeepSeek-Coder, and DeepSeek-Chat
- ⚙️ **Configurable** - Customize temperature, max tokens, and more

## Installation

```bash
npm install -g deepseek-code
```

Or for development:

```bash
git clone https://github.com/KolyanCat128/deepseek-code.git
cd deepseek-code
npm install
npm run build
npm start
```

## Setup

First, configure your DeepSeek API key:

```bash
deepseek config sk-your-api-key-here
```

Optionally specify a model:

```bash
deepseek config sk-your-api-key-here --model deepseek-r1
```

Available models:
- `deepseek-r1` (Default) - Best for reasoning and analysis
- `deepseek-coder` - Optimized for code generation
- `deepseek-chat` - General purpose chat model

## Usage

### Analyze Code

Analyze a file for bugs, security issues, and quality problems:

```bash
deepseek analyze ./example.js
```

Output includes:
- Quality score (0-100)
- Identified issues with severity levels
- Suggestions for improvement
- Summary analysis

### Generate Code

Generate code based on a description:

```bash
deepseek generate "Create a function to fetch user data from API" \
  --language javascript \
  --output ./api.js
```

Options:
- `--language, -l` - Programming language (default: javascript)
- `--output, -o` - Save generated code to file
- `--context, -c` - Additional context for generation

Supported languages:
- javascript, typescript, python, java, cpp, c, rust, go, php, ruby, csharp, swift, kotlin, jsx, tsx

### Explain Code

Get detailed explanation of code:

```bash
deepseek explain ./complex-function.ts
```

Output includes:
- Summary of what the code does
- Detailed explanation of key parts
- Complexity analysis
- Key points to understand

### Refactor Code

Improve code quality and readability:

```bash
deepseek refactor ./old-code.js \
  --output ./refactored-code.js \
  --goals "improve performance and readability"
```

Options:
- `--output, -o` - Save refactored code to file
- `--goals, -g` - Specific refactoring goals

## Configuration

Configuration is stored in `~/.deepseek-code/config.json`

You can modify:
- API key
- Model selection
- Max tokens (default: 4096)
- Temperature (default: 0.7, range: 0-1)

## API Key

Get your API key from [DeepSeek API Console](https://api.deepseek.com)

**Important:** Never commit your API key to version control. Use environment variables or `.env` files.

## Examples

### Analyze TypeScript file

```bash
deepseek analyze ./src/utils/helpers.ts
```

### Generate Python function

```bash
deepseek generate "Create a decorator for memoization" \
  --language python \
  --output ./memoize.py
```

### Explain complex algorithm

```bash
deepseek explain ./algorithms/quicksort.js
```

### Refactor with specific goals

```bash
deepseek refactor ./legacy.js \
  --goals "convert to ES6+, add error handling, improve performance" \
  --output ./modern.js
```

## Environment Variables

- `DEBUG=1` - Enable debug logging
- `HOME` - Used to locate config directory (if not using Windows)

## Troubleshooting

### "No configuration found"
Run: `deepseek config sk-your-api-key`

### "Invalid API key"
Check that your API key is correct and has valid credits

### "Rate limit exceeded"
Wait a moment and try again, or upgrade your API plan

### "Connection timeout"
Check your internet connection and API endpoint

## Development

```bash
# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Run tests
npm run test

# Build and watch
npx tsc --watch
```

## Project Structure

```
src/
├── index.ts              # Main CLI entry point
├── config.ts             # Configuration management
├── types.ts              # TypeScript interfaces
├── commands/
│   ├── analyze.ts        # Code analysis command
│   ├── generate.ts       # Code generation command
│   ├── explain.ts        # Code explanation command
│   └── refactor.ts       # Code refactoring command
└── utils/
    ├── deepseek-client.ts # API client
    ├── file-handler.ts    # File operations
    └── logger.ts          # Logging utilities
```

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Changelog

### v1.0.0
- Initial release
- Code analysis, generation, explanation, and refactoring
- Support for multiple DeepSeek models
- Configuration management
- File handling utilities