import { CommandOptions } from '../types';
import { FileWatcher } from '../watchers/file-watcher';
import { buildCommand } from './build';
import { spawn } from 'child_process';
import { join } from 'path';

export async function devCommand(options: CommandOptions): Promise<void> {
  const {
    specs = 'specs/',
    output = 'apps/api',
    port = '3000',
    open,
  } = options;

  console.log('🚀 Starting ReaderSpec development mode...');
  console.log(`👀 Watching specs in: ${specs}`);
  console.log(`📁 Output directory: ${output}`);
  console.log(`🌐 API server port: ${port}`);

  try {
    // Check if OpenAI API key is available for AI translation
    const apiKey = process.env.OPEN_AI_API_KEY;
    if (!apiKey) {
      console.log(
        '⚠️  No OpenAI API key found. AI translation will be disabled.'
      );
      console.log(
        '   Set OPEN_AI_API_KEY environment variable to enable automatic translation.'
      );
    }

    // Start file watcher for AI translation (if API key is available)
    let fileWatcher: FileWatcher | null = null;
    if (apiKey) {
      console.log('🤖 Starting AI translation file watcher...');
      fileWatcher = new FileWatcher({ openaiApiKey: apiKey }, [specs]);
      fileWatcher.start();
    }

    // Start the development server
    console.log('🌐 Starting development server...');
    const devServer = startDevServer(output, port);

    // Set up graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development mode...');
      if (fileWatcher) {
        fileWatcher.stop();
      }
      if (devServer) {
        devServer.kill('SIGTERM');
      }
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down development mode...');
      if (fileWatcher) {
        fileWatcher.stop();
      }
      if (devServer) {
        devServer.kill('SIGTERM');
      }
      process.exit(0);
    });

    console.log('\n✅ Development mode started successfully!');
    console.log(`🌐 API server: http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log('👀 Watching for file changes...');
    console.log('🔄 Press Ctrl+C to stop');

    // Keep the process running
    await new Promise(() => {});
  } catch (error) {
    console.error('❌ Dev mode failed:', error);
    process.exit(1);
  }
}

function startDevServer(outputDir: string, port: string): any {
  const apiPath = join(process.cwd(), outputDir);

  // Check if the API directory exists and has the necessary files
  const fs = require('fs');
  if (!fs.existsSync(join(apiPath, 'package.json'))) {
    console.log('📦 API not built yet. Building first...');
    // Build the API first
    buildCommand({ specs: 'specs/', output: outputDir });
  }

  // Start the development server with the specified port
  const devProcess = spawn('npm', ['run', 'dev'], {
    cwd: apiPath,
    stdio: 'pipe',
    shell: true,
    env: {
      ...process.env,
      PORT: port,
    },
  });

  devProcess.stdout?.on('data', (data: Buffer) => {
    const output = data.toString().trim();
    console.log(`[API] ${output}`);
  });

  devProcess.stderr?.on('data', (data: Buffer) => {
    const output = data.toString().trim();
    // Check for port conflict and suggest solution
    if (output.includes('EADDRINUSE')) {
      console.error(`[API Error] Port ${port} is already in use.`);
      console.error('💡 Try one of these solutions:');
      console.error(
        `   1. Kill the process using port ${port}: lsof -ti:${port} | xargs kill -9`
      );
      console.error(`   2. Use a different port: readerspec dev --port 3001`);
      console.error(`   3. Stop any running development servers`);
    } else {
      console.error(`[API Error] ${output}`);
    }
  });

  devProcess.on('error', (error: Error) => {
    console.error('❌ Failed to start development server:', error);
  });

  devProcess.on('exit', (code: number) => {
    if (code !== 0) {
      // Don't restart if it's a port conflict (code 1)
      if (code === 1) {
        console.log(
          '🛑 Development server stopped due to error. Please resolve the issue and try again.'
        );
        return;
      }
      console.log(
        `🔄 Development server exited with code ${code}. Restarting...`
      );
      // Restart the server after a short delay
      setTimeout(() => {
        startDevServer(outputDir, port);
      }, 2000);
    }
  });

  return devProcess;
}
