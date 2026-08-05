import { generatePlaywrightScript } from '../services/playwright-script.service';
import { AutomationGenerator, GeneratedScript, GeneratorContext, TestConnectionResult } from './automation-generator';

export const TEMPLATE_PROVIDER = 'RULE_ENGINE';

export class TemplateGenerator implements AutomationGenerator {
  readonly key = TEMPLATE_PROVIDER;

  async generate(context: GeneratorContext): Promise<GeneratedScript> {
    const script = generatePlaywrightScript(
      context.title,
      context.steps,
      context.options,
      context.framework,
      context.authEngine,
    );

    return {
      script,
      generatorType: 'TEMPLATE',
      provider: TEMPLATE_PROVIDER,
      model: null,
    };
  }

  async testConnection(): Promise<TestConnectionResult> {
    return { success: true, message: 'Rule Engine selalu tersedia tanpa API Key.' };
  }
}
