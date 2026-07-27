import { getConfig } from './config';
import { createLogger } from './utils';
import { AutomationEngine, ExecutionManager } from './core';
import { PlaywrightRunner } from './runner';
import { ArtifactManager, LocalStorageProvider, ReportManager, UploadManager, CleanupManager } from './artifacts';
import { Reporter } from './reporters';
import { ApiClient } from './adapters';

async function main(): Promise<void> {
  const config = getConfig();
  const logger = createLogger(config);

  logger.info({ version: '1.0.0' }, 'SIMANTIK Automation Engine starting');

  const storageProvider = new LocalStorageProvider(config.storage.artifactDir, config.storage.reportDir);
  await storageProvider.initialize();

  const apiClient = new ApiClient({
    baseUrl: config.api.baseUrl,
    token: config.api.token,
    apiKey: config.api.apiKey,
    requestTimeout: config.api.requestTimeout,
    retryCount: config.api.retryCount,
    retryDelay: config.api.retryDelay,
  }, logger);

  const runner = new PlaywrightRunner(logger);
  const reporter = new Reporter(logger);
  const artifactManager = new ArtifactManager(storageProvider, logger);
  new ReportManager(storageProvider, logger);
  new UploadManager(apiClient, storageProvider, logger, config.upload.retryCount, config.upload.retryDelay);
  new CleanupManager(storageProvider, logger, config.artifacts.retentionDays);

  const executionManager = new ExecutionManager(
    config,
    logger,
    runner,
    reporter,
    artifactManager,
  );

  const engine = new AutomationEngine(config, logger, executionManager);
  await engine.start();

  logger.info('SIMANTIK Automation Engine started successfully');

  const shutdown = async () => {
    logger.info('Shutting down...');
    await engine.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start automation engine:', err);
  process.exit(1);
});
