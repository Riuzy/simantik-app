import { Framework } from '@prisma/client';
import { TEST_STEP_ACTION_LABELS, type TestStepAction } from '../../../../constants/test-step-actions';
import { AuthEngine } from './auth-engine.service';

export interface ScriptLocator {
  strategy: string;
  value: string;
}

export interface ScriptStep {
  stepNumber: number;
  action: string;
  description: string | null;
  locatorStrategy: string | null;
  locatorValue: string | null;
  locators?: ScriptLocator[] | null;
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

/**
 * Universal Locator Engine priority. Semantic Playwright APIs are tried first,
 * CSS/XPATH act as the last-resort fallback so the engine works with any modern
 * web framework (Mantine, MUI, Ant Design, Bootstrap, Tailwind, native HTML).
 */
const LOCATOR_PRIORITY = [
  'LABEL',
  'PLACEHOLDER',
  'ROLE',
  'TEXT',
  'TEST_ID',
  'NAME',
  'ID',
  'CSS',
  'XPATH',
  'ALT_TEXT',
  'TITLE',
];

function str(value: string | null | undefined): string {
  return JSON.stringify(value ?? '');
}

/**
 * Resolves a step's locator candidates. The engine prefers the multi-locator
 * array but stays fully compatible with legacy steps that only store a single
 * locatorStrategy/locatorValue.
 */
function stepLocatorCandidates(step: ScriptStep): ScriptLocator[] {
  if (Array.isArray(step.locators) && step.locators.length > 0) {
    return step.locators.map((l) => ({ strategy: l.strategy, value: l.value }));
  }
  if (step.locatorStrategy && step.locatorValue) {
    return [{ strategy: step.locatorStrategy, value: step.locatorValue }];
  }
  return [];
}

function locatorsLiteral(candidates: ScriptLocator[]): string {
  return `[${candidates.map((c) => `{ strategy: ${str(c.strategy)}, value: ${str(c.value)} }`).join(', ')}]`;
}

function stepSignature(step: ScriptStep): string {
  return `step${step.stepNumber}:${step.action}`;
}

/**
 * Joins a step's navigation target with the project base URL when the target
 * is a relative path, so no absolute URL ever needs to be hard-coded in steps.
 */
function resolveNavigateUrl(target: string | null, baseUrl: string | null): string {
  if (target && /^https?:\/\//i.test(target)) return target;
  if (baseUrl && target) {
    const path = target.startsWith('/') ? target : `/${target}`;
    return `${baseUrl.replace(/\/$/, '')}${path}`;
  }
  return baseUrl || target || '';
}

/**
 * Runtime code for the Universal Locator Engine injected into every script.
 * Pure string concatenation (no template literals) so it embeds cleanly.
 */
const locatorEngineHelpers = `
  const LOCATOR_PRIORITY = ${JSON.stringify(LOCATOR_PRIORITY)};

  const __healed = {};

  const __cssEscape = (s) => String(s).replace(/([^a-zA-Z0-9_\\u00A0-\\uFFFF-])/g, (c) => '\\\\' + c);

  const __makeLocator = (page, strategy, value) => {
    switch (strategy) {
      case 'LABEL': return page.getByLabel(value, { exact: false });
      case 'PLACEHOLDER': return page.getByPlaceholder(value, { exact: false });
      case 'ROLE': {
        const s = String(value);
        const sep = s.indexOf(':');
        if (sep > 0) {
          return page.getByRole(s.slice(0, sep).trim(), { name: s.slice(sep + 1).trim() });
        }
        return page.getByRole(s.trim());
      }
      case 'TEXT': return page.getByText(value, { exact: false });
      case 'TEST_ID': return page.getByTestId(value);
      case 'NAME': return page.locator('[name=' + JSON.stringify(value) + ']');
      case 'ID': return page.locator('#' + __cssEscape(value));
      case 'CSS': return page.locator(value);
      case 'XPATH': return page.locator('xpath=' + value);
      case 'ALT_TEXT': return page.getByAltText(value, { exact: false });
      case 'TITLE': return page.getByTitle(value);
      default: return page.locator(value);
    }
  };

  const __dumpDiagnostics = async (page, htmlPath) => {
    if (!htmlPath) return '';
    try {
      const content = await page.content();
      const fs = require('fs');
      fs.writeFileSync(htmlPath, content);
      return 'HTML snapshot saved to ' + htmlPath;
    } catch (err) {
      return 'HTML snapshot failed: ' + (err && err.message ? err.message : String(err));
    }
  };

  const __findElement = async (page, locators, signature, options) => {
    const opts = Object.assign({ timeout: 30000, requireVisible: true, requireEnabled: true, htmlPath: '' }, options || {});
    const candidates = [];
    if (__healed[signature]) {
      candidates.push({ strategy: __healed[signature].strategy, value: __healed[signature].value });
    }
    const ordered = (Array.isArray(locators) ? locators : [])
      .filter((l) => l && l.value && String(l.value).length > 0)
      .sort((a, b) => (LOCATOR_PRIORITY.indexOf(a.strategy) + 1 || 999) - (LOCATOR_PRIORITY.indexOf(b.strategy) + 1 || 999));
    for (const c of ordered) {
      if (!candidates.some((t) => t.strategy === c.strategy && t.value === c.value)) {
        candidates.push(c);
      }
    }
    if (candidates.length === 0) {
      throw new Error('No locator provided for ' + signature);
    }
    const probeTimeout = Math.max(1500, Math.min(opts.timeout, Math.ceil(opts.timeout / Math.max(candidates.length, 1))));
    const attempted = [];
    for (const cand of candidates) {
      __log('INFO', 'Trying ' + cand.strategy + ' ...');
      try {
        const loc = __makeLocator(page, cand.strategy, cand.value);
        await loc.waitFor({ state: 'attached', timeout: probeTimeout });
        if (opts.requireVisible && !(await loc.isVisible())) {
          throw new Error('element is not visible');
        }
        if (opts.requireEnabled && !(await loc.isEnabled())) {
          throw new Error('element is not enabled');
        }
        __log('INFO', cand.strategy + ' matched.');
        __healed[signature] = { strategy: cand.strategy, value: cand.value };
        return loc;
      } catch (err) {
        attempted.push(cand.strategy + ' "' + cand.value + '" => ' + (err && err.message ? err.message : String(err)));
      }
    }
    const diag = await __dumpDiagnostics(page, opts.htmlPath);
    throw new Error('Locator resolution failed for ' + signature + '. Tried ' + attempted.length + ' locator(s):\\n' + attempted.map((a) => '  - ' + a).join('\\n') + (diag ? '\\n' + diag : ''));
  };

  const __clickElement = async (page, locators, signature, options) => {
    const loc = await __findElement(page, locators, signature, options);
    await loc.click();
  };
  const __fillElement = async (page, locators, signature, value, options) => {
    const loc = await __findElement(page, locators, signature, options);
    await loc.fill(String(value === null || value === undefined ? '' : value));
  };
  const __selectOption = async (page, locators, signature, value, options) => {
    const loc = await __findElement(page, locators, signature, options);
    await loc.selectOption(String(value));
  };
  const __uploadFile = async (page, locators, signature, files, options) => {
    const loc = await __findElement(page, locators, signature, options);
    await loc.setInputFiles(files);
  };
`;

export function generatePlaywrightScript(
  title: string,
  steps: ScriptStep[],
  options: ScriptOptions,
  framework: Framework = 'PLAYWRIGHT',
  authEngine?: AuthEngine,
): string {
  if (framework !== 'PLAYWRIGHT') {
    throw new Error(`Script generation is only supported for PLAYWRIGHT, got ${framework}`);
  }

  const browserName = options.browser.toLowerCase();

  const helpers = `
  const __log = (level, message) => process.stdout.write('LOG:' + level + ':' + String(message).replace(/\\n/g, ' | ') + '\\n');
  const __step = async (n, fn) => { try { await fn(); __log('STEP', 'Step ' + n + ' passed'); } catch (err) { __log('ERROR', 'Step ' + n + ' failed: ' + (err && err.message ? err.message : String(err))); throw err; } };`;

  const renderStep = (step: ScriptStep): string => {
    const label = step.description || TEST_STEP_ACTION_LABELS[step.action as TestStepAction] || step.action;
    const logs = `  __log('INFO', 'Step ${step.stepNumber}: ${label}');\n`;

    const stepFn = (body: string): string => `  await __step(${step.stepNumber}, async () => { ${body} });\n`;
    const loc = (): string => locatorsLiteral(stepLocatorCandidates(step));
    const sig = (): string => str(stepSignature(step));

    const needLocator = (): ScriptLocator[] => {
      const cands = stepLocatorCandidates(step);
      if (cands.length === 0) {
        throw new Error(`Step ${step.stepNumber}: ${step.action} requires at least one locator`);
      }
      return cands;
    };

    switch (step.action) {
      case 'OPEN_BROWSER':
        return logs + `  __log('INFO', 'Browser context already initialized by engine');\n`;

      case 'NAVIGATE': {
        if (!options.baseUrl && !step.target && !step.inputValue) {
          throw new Error(`Step ${step.stepNumber}: NAVIGATE requires a target URL or a project base URL`);
        }
        const url = step.target || step.inputValue || options.baseUrl || '';
        return logs + stepFn(`await page.goto(${str(resolveNavigateUrl(url, options.baseUrl))});`);
      }

      case 'RELOAD':
        return logs + stepFn('await page.reload();');

      case 'BACK':
        return logs + stepFn('await page.goBack();');

      case 'FORWARD':
        return logs + stepFn('await page.goForward();');

      case 'CLICK': {
        needLocator();
        return logs + stepFn(`await __clickElement(page, ${loc()}, ${sig()}, __findOpts);`);
      }

      case 'DOUBLE_CLICK': {
        needLocator();
        return logs + stepFn(`const __el = await __findElement(page, ${loc()}, ${sig()}, __findOpts); await __el.dblclick();`);
      }

      case 'RIGHT_CLICK': {
        needLocator();
        return logs + stepFn(`const __el = await __findElement(page, ${loc()}, ${sig()}, __findOpts); await __el.click({ button: 'right' });`);
      }

      case 'HOVER': {
        needLocator();
        return logs + stepFn(`const __el = await __findElement(page, ${loc()}, ${sig()}, __findOpts); await __el.hover();`);
      }

      case 'TYPE': {
        needLocator();
        return logs + stepFn(`await __fillElement(page, ${loc()}, ${sig()}, ${str(step.inputValue)}, __findOpts);`);
      }

      case 'CLEAR': {
        needLocator();
        return logs + stepFn(`await __fillElement(page, ${loc()}, ${sig()}, '', __findOpts);`);
      }

      case 'SELECT': {
        needLocator();
        return logs + stepFn(`await __selectOption(page, ${loc()}, ${sig()}, ${str(step.inputValue)}, __findOpts);`);
      }

      case 'CHECK': {
        needLocator();
        return logs + stepFn(`const __el = await __findElement(page, ${loc()}, ${sig()}, __findOpts); await __el.check();`);
      }

      case 'UNCHECK': {
        needLocator();
        return logs + stepFn(`const __el = await __findElement(page, ${loc()}, ${sig()}, __findOpts); await __el.uncheck();`);
      }

      case 'PRESS_KEY': {
        const cands = stepLocatorCandidates(step);
        if (cands.length > 0) {
          return logs + stepFn(`const __el = await __findElement(page, ${locatorsLiteral(cands)}, ${sig()}, __findOpts); await __el.press(${str(step.inputValue)});`);
        }
        return logs + stepFn(`await page.keyboard.press(${str(step.inputValue)});`);
      }

      case 'UPLOAD_FILE': {
        needLocator();
        return logs + stepFn(`await __uploadFile(page, ${loc()}, ${sig()}, ${str(step.inputValue)}, __findOpts);`);
      }

      case 'WAIT': {
        const ms = Number(step.inputValue || 1000);
        return logs + stepFn(`await page.waitForTimeout(${ms});`);
      }

      case 'SCROLL': {
        const cands = stepLocatorCandidates(step);
        if (cands.length > 0) {
          return logs + stepFn(`const __el = await __findElement(page, ${locatorsLiteral(cands)}, ${sig()}, __findOpts); await __el.scrollIntoViewIfNeeded();`);
        }
        const y = Number(step.inputValue || 500);
        return logs + stepFn(`await page.mouse.wheel(0, ${y});`);
      }

      case 'DRAG_AND_DROP': {
        const sourceCands = stepLocatorCandidates(step);
        if (sourceCands.length === 0) {
          throw new Error(`Step ${step.stepNumber}: DRAG_AND_DROP requires a source locator`);
        }
        const destValue = step.inputValue;
        if (!destValue) {
          throw new Error(`Step ${step.stepNumber}: DRAG_AND_DROP requires a destination locator`);
        }
        const destCands = [{ strategy: step.locatorStrategy || 'CSS', value: destValue }];
        return logs + stepFn(
          `const __src = await __findElement(page, ${locatorsLiteral(sourceCands)}, ${str(`step${step.stepNumber}:${step.action}:src`)}, __findOpts); ` +
          `const __dst = await __findElement(page, ${locatorsLiteral(destCands)}, ${str(`step${step.stepNumber}:${step.action}:dst`)}, __findOpts); ` +
          `await __src.dragTo(__dst);`,
        );
      }

      case 'TAKE_SCREENSHOT':
        return logs + stepFn(`await page.screenshot({ path: ${str(`${options.screenshotPath}-step-${step.stepNumber}.png`)} });`);

      case 'CLOSE_BROWSER':
        return logs + stepFn('await browser.close();');

      case 'VERIFY_URL': {
        const expected = step.inputValue ?? step.target ?? options.baseUrl;
        if (!expected) throw new Error(`Step ${step.stepNumber}: VERIFY_URL requires a value`);
        const target = resolveNavigateUrl(expected, options.baseUrl);
        return logs + stepFn(`await page.waitForURL(${str(target)}, { timeout: ${options.timeout} });`);
      }

      case 'VERIFY_TITLE': {
        const expected = step.inputValue ?? step.expectedResult ?? '';
        return logs + stepFn(`const actualTitle = await page.title(); if (actualTitle !== ${str(expected)}) throw new Error('Expected title ' + ${str(expected)} + ' but got: ' + actualTitle);`);
      }

      case 'VERIFY_TEXT': {
        needLocator();
        const expected = step.inputValue ?? step.expectedResult ?? '';
        return logs + stepFn(
          `const __el = await __findElement(page, ${loc()}, ${sig()}, __findOpts); ` +
          `const actualText = (await __el.textContent()) ?? ''; ` +
          `if (!actualText.includes(${str(expected)})) throw new Error('Expected text ' + ${str(expected)} + ' but got: ' + actualText);`,
        );
      }

      case 'VERIFY_ELEMENT': {
        needLocator();
        return logs + stepFn(`await __findElement(page, ${loc()}, ${sig()}, Object.assign({}, __findOpts, { requireVisible: false, requireEnabled: false }));`);
      }

      case 'VERIFY_VISIBLE': {
        needLocator();
        return logs + stepFn(`await __findElement(page, ${loc()}, ${sig()}, __findOpts);`);
      }

      case 'VERIFY_HIDDEN': {
        needLocator();
        return logs + stepFn(`const __el = await __findElement(page, ${loc()}, ${sig()}, Object.assign({}, __findOpts, { requireVisible: false, requireEnabled: false })); await __el.waitFor({ state: 'hidden', timeout: ${options.timeout} });`);
      }

      case 'VERIFY_ENABLED': {
        needLocator();
        return logs + stepFn(`await __findElement(page, ${loc()}, ${sig()}, __findOpts);`);
      }

      case 'VERIFY_DISABLED': {
        needLocator();
        return logs + stepFn(`const __el = await __findElement(page, ${loc()}, ${sig()}, Object.assign({}, __findOpts, { requireEnabled: false })); if (await __el.isEnabled()) throw new Error('Expected element to be disabled');`);
      }

      case 'VERIFY_ATTRIBUTE': {
        needLocator();
        const attr = step.inputValue ?? 'value';
        const expected = step.expectedResult ?? '';
        return logs + stepFn(
          `const __el = await __findElement(page, ${loc()}, ${sig()}, Object.assign({}, __findOpts, { requireVisible: false })); ` +
          `const actual = await __el.getAttribute(${str(attr)}); ` +
          `if (actual !== ${str(expected)}) throw new Error('Expected attribute ' + ${str(attr)} + ' to be ' + ${str(expected)} + ' but got: ' + actual);`,
        );
      }

      case 'VERIFY_COUNT': {
        needLocator();
        const expected = Number(step.inputValue ?? step.expectedResult ?? 1);
        return logs + stepFn(
          `const __el = await __findElement(page, ${loc()}, ${sig()}, Object.assign({}, __findOpts, { requireVisible: false, requireEnabled: false })); ` +
          `const count = await __el.count(); ` +
          `if (count !== ${expected}) throw new Error('Expected ${expected} elements but found: ' + count);`,
        );
      }

      default:
        throw new Error(`Step ${step.stepNumber}: unsupported action ${step.action}`);
    }
  };

  const renderedSteps = steps.map(renderStep).join('');

  const htmlDumpPath = options.screenshotPath.replace(/\.png$/i, '.html');

  return [
    `const { ${browserName} } = require('playwright');`,
    '',
    '(async () => {',
    `  const __title = ${str(title)};`,
    `  const startedAt = Date.now();`,
    `  const browser = await ${browserName}.launch({ headless: ${options.headless}, slowMo: ${options.slowMotion} });`,
    `  const context = await browser.newContext({ viewport: { width: ${options.viewportWidth}, height: ${options.viewportHeight} } });`,
    `  const page = await context.newPage();`,
    `  page.setDefaultTimeout(${options.timeout});`,
    '',
    helpers,
    locatorEngineHelpers,
    '',
    `  page.on('console', (msg) => __log('INFO', '[browser] ' + msg.type() + ': ' + msg.text()));`,
    `  page.on('pageerror', (err) => __log('ERROR', '[browser] ' + (err.message || String(err))));`,
    '',
    '  try {',
    `    const __findOpts = { timeout: ${options.timeout}, htmlPath: ${str(htmlDumpPath)} };`,
    authEngine ? authEngine.loginCode('page') : '',
    renderedSteps,
    `    await page.screenshot({ path: ${str(options.screenshotPath)}, fullPage: true });`,
    `    __log('INFO', 'Execution finished: PASSED');`,
    `    process.stdout.write('RESULT:' + JSON.stringify({ status: 'PASSED', durationMs: Date.now() - startedAt }) + '\\n');`,
    '  } catch (err) {',
    `    try { await page.screenshot({ path: ${str(options.screenshotPath)}, fullPage: true }); } catch (_) {}`,
    `    __log('ERROR', 'Execution finished: FAILED - ' + (err && err.message ? err.message : String(err)));`,
    `    process.stdout.write('RESULT:' + JSON.stringify({ status: 'FAILED', durationMs: Date.now() - startedAt, error: (err && err.message ? err.message : String(err)) }) + '\\n');`,
    '  } finally {',
    '    await browser.close();',
    '  }',
    '})().catch((err) => {',
    `  process.stdout.write('RESULT:' + JSON.stringify({ status: 'ERROR', durationMs: 0, error: (err && err.message ? err.message : String(err)) }) + '\\n');`,
    '});',
  ].join('\n');
}
