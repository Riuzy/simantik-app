import { Framework } from '@prisma/client';
import { TEST_STEP_ACTION_LABELS, type TestStepAction } from '../../../../constants/test-step-actions';

export interface ScriptStep {
  stepNumber: number;
  action: string;
  description: string | null;
  locatorStrategy: string | null;
  locatorValue: string | null;
  inputValue: string | null;
  expectedResult: string | null;
  target: string | null;
}

export interface ScriptOptions {
  browser: string;
  headless: boolean;
  viewportWidth: number;
  viewportHeight: number;
  timeout: number;
  slowMotion: number;
  baseUrl: string | null;
  screenshotPath: string;
}

function str(value: string | null | undefined): string {
  return JSON.stringify(value ?? '');
}

function requireLocator(step: ScriptStep): string {
  const loc = step.locatorValue || step.target;
  if (!loc) throw new Error(`Step ${step.stepNumber}: ${step.action} requires a locator`);
  return loc;
}

export function generatePlaywrightScript(
  title: string,
  steps: ScriptStep[],
  options: ScriptOptions,
  framework: Framework = 'PLAYWRIGHT',
): string {
  if (framework !== 'PLAYWRIGHT') {
    throw new Error(`Script generation is only supported for PLAYWRIGHT, got ${framework}`);
  }

  const browserName = options.browser.toLowerCase();

  const renderStep = (step: ScriptStep): string => {
    const label = step.description || TEST_STEP_ACTION_LABELS[step.action as TestStepAction] || step.action;
    const logs = `  __log('INFO', 'Step ${step.stepNumber}: ${label}');\n`;

    const locatorExpr = (v: string): string => `__locator(page, ${str(step.locatorStrategy)}, ${str(v)})`;
    const stepFn = (body: string): string => `  await __step(${step.stepNumber}, async () => { ${body} });\n`;

    switch (step.action) {
      case 'OPEN_BROWSER':
        return logs + `  await __step(${step.stepNumber}, async () => {});\n`;

      case 'NAVIGATE': {
        const url = step.target || step.inputValue || options.baseUrl;
        if (!url) throw new Error(`Step ${step.stepNumber}: NAVIGATE requires a target URL or project base URL`);
        return logs + stepFn(`await page.goto(${str(url)});`);
      }

      case 'RELOAD':
        return logs + stepFn('await page.reload();');

      case 'BACK':
        return logs + stepFn('await page.goBack();');

      case 'FORWARD':
        return logs + stepFn('await page.goForward();');

      case 'CLICK':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.click();`);

      case 'DOUBLE_CLICK':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.dblclick();`);

      case 'RIGHT_CLICK':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.click({ button: 'right' });`);

      case 'HOVER':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.hover();`);

      case 'TYPE':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.fill(${str(step.inputValue)});`);

      case 'CLEAR':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.fill('');`);

      case 'SELECT':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.selectOption(${str(step.inputValue)});`);

      case 'CHECK':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.check();`);

      case 'UNCHECK':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.uncheck();`);

      case 'PRESS_KEY': {
        const loc = step.locatorValue || step.target;
        if (loc) {
          return logs + stepFn(`await ${locatorExpr(loc)}.press(${str(step.inputValue)});`);
        }
        return logs + stepFn(`await page.keyboard.press(${str(step.inputValue)});`);
      }

      case 'UPLOAD_FILE':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.setInputFiles(${str(step.inputValue)});`);

      case 'WAIT': {
        const ms = Number(step.inputValue || 1000);
        return logs + stepFn(`await page.waitForTimeout(${ms});`);
      }

      case 'SCROLL': {
        const loc = step.locatorValue || step.target;
        if (loc) {
          return logs + stepFn(`await ${locatorExpr(loc)}.scrollIntoViewIfNeeded();`);
        }
        const y = Number(step.inputValue || 500);
        return logs + stepFn(`await page.mouse.wheel(0, ${y});`);
      }

      case 'DRAG_AND_DROP': {
        const source = step.locatorValue || step.target;
        const dest = step.inputValue;
        if (!source) throw new Error(`Step ${step.stepNumber}: DRAG_AND_DROP requires a source locator`);
        if (!dest) throw new Error(`Step ${step.stepNumber}: DRAG_AND_DROP requires a destination locator`);
        return logs + stepFn(`await ${locatorExpr(source)}.dragTo(__locator(page, null, ${str(dest)}));`);
      }

      case 'TAKE_SCREENSHOT':
        return logs + stepFn(`await page.screenshot({ path: ${str(`${options.screenshotPath}-step-${step.stepNumber}.png`)} });`);

      case 'CLOSE_BROWSER':
        return logs + stepFn('await browser.close();');

      case 'VERIFY_URL': {
        const expected = step.inputValue ?? step.target ?? options.baseUrl;
        if (!expected) throw new Error(`Step ${step.stepNumber}: VERIFY_URL requires a value`);
        return logs + stepFn(`if (page.url() !== ${str(expected)}) throw new Error('Expected URL ' + ${str(expected)} + ' but got: ' + page.url());`);
      }

      case 'VERIFY_TITLE': {
        const expected = step.inputValue ?? step.expectedResult ?? '';
        return logs + stepFn(`const actualTitle = await page.title(); if (actualTitle !== ${str(expected)}) throw new Error('Expected title ' + ${str(expected)} + ' but got: ' + actualTitle);`);
      }

      case 'VERIFY_TEXT': {
        const expected = step.inputValue ?? step.expectedResult ?? '';
        return logs + stepFn(`const el = ${locatorExpr(requireLocator(step))}; await el.waitFor({ state: 'visible', timeout: ${options.timeout} }); const text = (await el.textContent()) ?? ''; if (!text.includes(${str(expected)})) throw new Error('Expected text ' + ${str(expected)} + ' but got: ' + text);`);
      }

      case 'VERIFY_ELEMENT':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.waitFor({ state: 'visible', timeout: ${options.timeout} });`);

      case 'VERIFY_VISIBLE':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.waitFor({ state: 'visible', timeout: ${options.timeout} });`);

      case 'VERIFY_HIDDEN':
        return logs + stepFn(`await ${locatorExpr(requireLocator(step))}.waitFor({ state: 'hidden', timeout: ${options.timeout} });`);

      case 'VERIFY_ENABLED':
        return logs + stepFn(`const el = ${locatorExpr(requireLocator(step))}; await el.waitFor({ state: 'visible', timeout: ${options.timeout} }); if (!(await el.isEnabled())) throw new Error('Expected element to be enabled');`);

      case 'VERIFY_DISABLED':
        return logs + stepFn(`const el = ${locatorExpr(requireLocator(step))}; await el.waitFor({ state: 'attached', timeout: ${options.timeout} }); if (await el.isEnabled()) throw new Error('Expected element to be disabled');`);

      case 'VERIFY_ATTRIBUTE': {
        const attr = step.inputValue ?? 'value';
        const expected = step.expectedResult ?? '';
        return logs + stepFn(`const el = ${locatorExpr(requireLocator(step))}; await el.waitFor({ state: 'attached', timeout: ${options.timeout} }); const actual = await el.getAttribute(${str(attr)}); if (actual !== ${str(expected)}) throw new Error('Expected attribute ' + ${str(attr)} + ' to be ' + ${str(expected)} + ' but got: ' + actual);`);
      }

      case 'VERIFY_COUNT': {
        const expected = Number(step.inputValue ?? step.expectedResult ?? 1);
        return logs + stepFn(`const el = ${locatorExpr(requireLocator(step))}; const count = await el.count(); if (count !== ${expected}) throw new Error('Expected ${expected} elements but found: ' + count);`);
      }

      default:
        throw new Error(`Step ${step.stepNumber}: unsupported action ${step.action}`);
    }
  };

  const renderedSteps = steps.map(renderStep).join('');

  return [
    `const { ${browserName} } = require('playwright');`,
    '',
    '(async () => {',
    `  const startedAt = Date.now();`,
    `  const browser = await ${browserName}.launch({ headless: ${options.headless}, slowMo: ${options.slowMotion} });`,
    `  const context = await browser.newContext({ viewport: { width: ${options.viewportWidth}, height: ${options.viewportHeight} } });`,
    `  const page = await context.newPage();`,
    `  page.setDefaultTimeout(${options.timeout});`,
    '',
    `  const __log = (level, message) => process.stdout.write('LOG:' + level + ':' + String(message).replace(/\\n/g, ' | ') + '\\n');`,
    `  const __step = async (n, fn) => { try { await fn(); __log('STEP', 'Step ' + n + ' passed'); } catch (err) { __log('ERROR', 'Step ' + n + ' failed: ' + (err && err.message ? err.message : String(err))); throw err; } };`,
    '',
    `  const __locator = (page, strategy, value) => {`,
    `    if (!value) return null;`,
    `    switch (strategy) {`,
    `      case 'TEXT': return page.getByText(value, { exact: false });`,
    `      case 'PLACEHOLDER': return page.getByPlaceholder(value);`,
    `      case 'ROLE': return page.getByRole(value);`,
    `      case 'LABEL': return page.getByLabel(value);`,
    `      case 'TEST_ID': return page.getByTestId(value);`,
    `      case 'ALT_TEXT': return page.getByAltText(value);`,
    `      case 'TITLE': return page.getByTitle(value);`,
    `      case 'XPATH': return page.locator('xpath=' + value);`,
    `      default: return page.locator(value);`,
    `    }`,
    `  };`,
    '',
    `  page.on('console', (msg) => __log('INFO', '[browser] ' + msg.type() + ': ' + msg.text()));`,
    `  page.on('pageerror', (err) => __log('ERROR', '[browser] ' + (err.message || String(err))));`,
    '',
    `  try {`,
    renderedSteps,
    `    await page.screenshot({ path: ${str(options.screenshotPath)} });`,
    `    __log('INFO', 'Execution finished: PASSED');`,
    `    process.stdout.write('RESULT:' + JSON.stringify({ status: 'PASSED', durationMs: Date.now() - startedAt }) + '\\n');`,
    `  } catch (err) {`,
    `    try { await page.screenshot({ path: ${str(options.screenshotPath)} }); } catch (_) {}`,
    `    __log('ERROR', 'Execution finished: FAILED - ' + (err && err.message ? err.message : String(err)));`,
    `    process.stdout.write('RESULT:' + JSON.stringify({ status: 'FAILED', durationMs: Date.now() - startedAt, error: (err && err.message ? err.message : String(err)) }) + '\\n');`,
    `  } finally {`,
    `    await browser.close();`,
    `  }`,
    `})().catch((err) => {`,
    `  process.stdout.write('RESULT:' + JSON.stringify({ status: 'ERROR', durationMs: 0, error: (err && err.message ? err.message : String(err)) }) + '\\n');`,
    `});`,
  ].join('\n');
}
