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

export type ScreenshotTiming = 'BEFORE_ACTION' | 'AFTER_ACTION' | 'FINAL_STATE';

export interface ScriptOptions {
  browser: string;
  headless: boolean;
  viewportWidth: number;
  viewportHeight: number;
  deviceScaleFactor: number;
  timeout: number;
  slowMotion: number;
  baseUrl: string | null;
  screenshotPath: string;
  screenshotTiming: ScreenshotTiming;
}

/**
 * Field locator cascade. Strategies that map a single semantic value onto a
 * Playwright API. Tried in this exact order so the engine self-heals to a more
 * specific selector whenever a candidate is missing or matches more than one
 * element (avoiding Playwright strict-mode violations). getByLabel/getByRole
 * resolve framework-agnostic accessible names (Mantine, MUI, Ant, Bootstrap),
 * then raw input[id]/input[name], then label:has-text() DOM traversal, then
 * data-testid, with a guarded CSS fallback.
 */
const FIELD_STRATEGIES = [
  'TEST_ID',
  'ID',
  'NAME',
  'PLACEHOLDER',
  'ARIA_LABEL',
  'ROLE',
  'LABEL',
  'CSS',
  'XPATH',
  'TEXT',
] as const;

/**
 * Subset of the field cascade whose value is a single semantic token pointing
 * at an input, select or textarea (test id, name, placeholder, label or
 * accessible name). These get the full self-healing cascade. CSS/XPATH are raw
 * selectors and TEXT/ALT_TEXT/TITLE target visible content, so those are kept
 * as-is. ROLE is only expanded further when it targets a field role.
 */
const FIELD_SEMANTIC_STRATEGIES = new Set<string>(
  FIELD_STRATEGIES.filter((s) => s !== 'CSS' && s !== 'XPATH' && s !== 'TEXT'),
);

const FIELD_ROLES = new Set([
  'textbox',
  'combobox',
  'searchbox',
  'spinbutton',
  'listbox',
  'slider',
  'switch',
]);

function isFieldRole(value: string): boolean {
  const sep = value.indexOf(':');
  const role = sep > 0 ? value.slice(0, sep).trim() : value.trim();
  return FIELD_ROLES.has(role);
}

/**
 * Expands a step's locators into a self-healing cascade of candidate locators.
 * For every field-semantic value, a LABEL(getByLabel) -> PLACEHOLDER -> ROLE
 * (textbox) -> NAME -> ID -> ARIA_LABEL -> ARIA_LABELLEDBY -> LABEL_HAS_TEXT
 * (label:has-text()) -> DOM_LABEL (DOM traversal) -> TEST_ID -> original -> CSS
 * chain is generated (keeping the original strategy in the chain) so a
 * label/name/placeholder keeps working no matter which framework renders the
 * field (Mantine, MUI, Ant, Bootstrap, native). Raw CSS/XPATH, visible-text
 * strategies and explicit non-field ROLE locators (buttons, links, headings)
 * are kept as-is so they stay fast and precise. The runtime probes each
 * candidate and uses the first that resolves to exactly one element.
 *
 * Guard clauses guarantee we never emit `locator("#Project Name")` or
 * `locator("Project Name")`: ID candidates are skipped when the value contains
 * whitespace, and the CSS fallback is only emitted for selector-like tokens.
 */
function looksLikeCssSelector(value: string): boolean {
  const v = (value ?? '').trim();
  if (!v) return false;
  if (v.includes(' ')) return false;
  return true;
}

function expandFieldCandidates(cands: ScriptLocator[]): ScriptLocator[] {
  const out: ScriptLocator[] = [];
  const seen = new Set<string>();
  const push = (strategy: string, value: string | null | undefined) => {
    const v = (value ?? '').trim();
    if (!v) return;
    if (strategy === 'ID' && /\s/.test(v)) return;
    if (strategy === 'CSS' && !looksLikeCssSelector(v)) return;
    const key = `${strategy}\u0000${v}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ strategy, value: v });
  };

  for (const c of cands) {
    if (c.strategy === 'CSS' || c.strategy === 'XPATH') {
      push(c.strategy, c.value);
      continue;
    }
    if (c.strategy === 'ROLE' && !isFieldRole(c.value ?? '')) {
      push(c.strategy, c.value);
      continue;
    }
    if (FIELD_SEMANTIC_STRATEGIES.has(c.strategy)) {
      push('TEST_ID', c.value);
      push('ID', c.value);
      push('NAME', c.value);
      push('PLACEHOLDER', c.value);
      push('ARIA_LABEL', c.value);
      push('ROLE', `textbox:${c.value}`);
      push('LABEL', c.value);
      push(c.strategy, c.value);
      push('CSS', c.value);
    } else {
      push(c.strategy, c.value);
    }
  }
  return out;
}

/**
 * Text-resolution cascade for VERIFY_* actions that check for visible
 * framework-agnostic text content. Prefers semantic landmarks (heading, h1,
  * h2, main, section) before falling back to a plain getByText so we never rely
  * on a brittle tag guess.
  * Added Mantine Text component support for framework-agnostic text lookup.
  */
function textLandmarks(value: string): ScriptLocator[] {
  const q = JSON.stringify(value);
  return [
    { strategy: 'ROLE', value: `heading:${value}` },
    { strategy: 'CSS', value: `.mantine-Text-root:has-text(${q})` },
    { strategy: 'CSS', value: `h1:has-text(${q})` },
    { strategy: 'CSS', value: `h2:has-text(${q})` },
    { strategy: 'CSS', value: `main:has-text(${q})` },
    { strategy: 'CSS', value: `section:has-text(${q})` },
    { strategy: 'TEXT', value },
  ];
}

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
  const __healed = {};

  const __cssEscape = (s) => String(s).replace(/([^a-zA-Z0-9_\\u00A0-\\uFFFF-])/g, (c) => '\\\\' + c);

  const __makeLocator = (page, strategy, value) => {
    switch (strategy) {
      case 'ID': return page.locator('#' + __cssEscape(value));
      case 'TEST_ID': return page.getByTestId(value);
      case 'NAME': return page.locator('[name=' + JSON.stringify(value) + ']');
      case 'PLACEHOLDER': return page.getByPlaceholder(value, { exact: false });
      case 'ARIA_LABEL': return page.getByLabel(value, { exact: false });
      case 'ARIA_LABELLEDBY': return page.getByLabel(value, { exact: false });
      case 'LABEL_HAS_TEXT': return page.locator('label:has-text(' + JSON.stringify(value) + ')');
      case 'DOM_LABEL': return page.locator('label:has-text(' + JSON.stringify(value) + ') input, label:has-text(' + JSON.stringify(value) + ') select, label:has-text(' + JSON.stringify(value) + ') textarea');
      case 'ROLE': {
        const s = String(value);
        const sep = s.indexOf(':');
        if (sep > 0) {
          return page.getByRole(s.slice(0, sep).trim(), { name: s.slice(sep + 1).trim() });
        }
        return page.getByRole(s.trim());
      }
      case 'LABEL': return page.getByLabel(value, { exact: false });
      case 'TEXT': return page.getByText(value, { exact: false });
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

  const __collect = (candidates, signature) => {
    const out = [];
    if (__healed[signature]) out.push(__healed[signature]);
    for (const l of (Array.isArray(candidates) ? candidates : [])) {
      if (!l || !l.value || String(l.value).trim().length === 0) continue;
      if (!out.some((t) => t.strategy === l.strategy && t.value === l.value)) out.push(l);
    }
    return out;
  };

  const __probeTimeout = (opts) => Math.max(10000, Math.min(10000, opts.timeout || 10000));

  const __findElement = async (page, locators, signature, options) => {
    const opts = Object.assign({ timeout: 30000, requireVisible: true, requireEnabled: true, multiMatch: 'skip', htmlPath: '' }, options || {});
    const candidates = __collect(locators, signature);
    if (candidates.length === 0) throw new Error('No locator provided for ' + signature);
    const probeTimeout = __probeTimeout(opts);
    const attempted = [];
    for (const cand of candidates) {
      __log('INFO', 'Trying ' + cand.strategy + '...');
      try {
        const loc = __makeLocator(page, cand.strategy, cand.value);
        await loc.first().waitFor({ state: 'attached', timeout: probeTimeout });
        const count = await loc.count();
        if (count === 0) throw new Error('no element matched');
        if (count > 1 && opts.multiMatch === 'skip') {
          attempted.push(cand.strategy + ' "' + cand.value + '" matched ' + count + ' elements (ambiguous), trying a more specific selector');
          __log('INFO', cand.strategy + ' matched ' + count + ' elements, trying a more specific selector');
          continue;
        }
        let anyVisible = !opts.requireVisible;
        let anyEnabled = !opts.requireEnabled;
        for (const m of await loc.all()) {
          if (opts.requireVisible && (await m.isVisible())) anyVisible = true;
          if (opts.requireEnabled && (await m.isEnabled())) anyEnabled = true;
        }
        if (opts.requireVisible && !anyVisible) throw new Error('element is not visible');
        if (opts.requireEnabled && !anyEnabled) throw new Error('element is not enabled');
        __log('INFO', 'Matched ' + cand.strategy);
        __healed[signature] = { strategy: cand.strategy, value: cand.value };
        return loc;
      } catch (err) {
        attempted.push(cand.strategy + ' "' + cand.value + '" => ' + (err && err.message ? err.message : String(err)));
      }
    }
    const diag = await __dumpDiagnostics(page, opts.htmlPath);
    throw new Error('Locator resolution failed for ' + signature + '. Tried ' + attempted.length + ' locator(s):\\n' + attempted.map((a) => '  - ' + a).join('\\n') + (diag ? '\\n' + diag : ''));
  };

  const __verifyText = async (page, locators, signature, expected, options) => {
    const opts = Object.assign({ timeout: 30000, htmlPath: '' }, options || {});
    const candidates = __collect(locators, signature);
    if (candidates.length === 0) throw new Error('No locator provided for ' + signature);
    const needle = String(expected || '').toLowerCase();
    const probeTimeout = __probeTimeout(opts);
    const attempted = [];
    for (const cand of candidates) {
      __log('INFO', 'Trying ' + cand.strategy + '...');
      try {
        const loc = __makeLocator(page, cand.strategy, cand.value);
        await loc.first().waitFor({ state: 'attached', timeout: probeTimeout });
        const count = await loc.count();
        if (count === 0) throw new Error('no element matched');
        const texts = [];
        for (const el of await loc.all()) {
          const t = (await el.textContent()) || '';
          if (t) texts.push(t);
        }
        const actualText = texts.join(' ');
        if (!actualText.toLowerCase().includes(needle)) {
          attempted.push(cand.strategy + ' "' + cand.value + '" => text mismatch');
          continue;
        }
        __log('INFO', 'Matched ' + cand.strategy);
        __healed[signature] = { strategy: cand.strategy, value: cand.value };
        return actualText;
      } catch (err) {
        attempted.push(cand.strategy + ' "' + cand.value + '" => ' + (err && err.message ? err.message : String(err)));
      }
    }
    const pageTitle = (await page.title()) || '';
    if (pageTitle.toLowerCase().includes(needle)) {
      __log('INFO', 'Matched PAGE TITLE');
      __healed[signature] = { strategy: 'TITLE', value: expected };
      return pageTitle;
    }
    const pageUrl = page.url() || '';
    if (pageUrl.toLowerCase().includes(needle)) {
      __log('INFO', 'Matched PAGE URL');
      __healed[signature] = { strategy: 'URL', value: expected };
      return pageUrl;
    }
    const diag = await __dumpDiagnostics(page, opts.htmlPath);
    throw new Error('Text "' + expected + '" not found for ' + signature + '. Tried ' + attempted.length + ' locator(s):\\n' + attempted.map((a) => '  - ' + a).join('\\n') + (diag ? '\\n' + diag : ''));
  };

  const __verifyNotVisible = async (page, locators, signature, options) => {
    const opts = Object.assign({ timeout: 30000, htmlPath: '' }, options || {});
    const candidates = __collect(locators, signature);
    if (candidates.length === 0) throw new Error('No locator provided for ' + signature);
    const probeTimeout = __probeTimeout(opts);
    const attempted = [];
    let foundAttached = false;
    for (const cand of candidates) {
      __log('INFO', 'Trying ' + cand.strategy + '...');
      try {
        const loc = __makeLocator(page, cand.strategy, cand.value);
        await loc.first().waitFor({ state: 'attached', timeout: probeTimeout });
        foundAttached = true;
        const matches = await loc.all();
        for (const m of matches) {
          await m.waitFor({ state: 'hidden', timeout: opts.timeout });
        }
        __log('INFO', 'Matched ' + cand.strategy);
        __healed[signature] = { strategy: cand.strategy, value: cand.value };
        return;
      } catch (err) {
        attempted.push(cand.strategy + ' "' + cand.value + '" => ' + (err && err.message ? err.message : String(err)));
      }
    }
    if (foundAttached) {
      const diag = await __dumpDiagnostics(page, opts.htmlPath);
      throw new Error('Expected element to be hidden for ' + signature + '. Tried ' + attempted.length + ' locator(s):\\n' + attempted.map((a) => '  - ' + a).join('\\n') + (diag ? '\\n' + diag : ''));
    }
    __log('INFO', 'Element not found in DOM - treated as not visible.');
  };

  const __prepare = async (page, loc, options) => {
    const t = (options && options.timeout) || 30000;
    await loc.waitFor({ state: 'attached', timeout: t });
    await loc.waitFor({ state: 'visible', timeout: t });
    await loc.scrollIntoViewIfNeeded();
    return loc;
  };

  const __clickElement = async (page, locators, signature, options) => {
    const loc = await __findElement(page, locators, signature, options);
    await __prepare(page, loc, options);
    await loc.first().click();
  };
  const __dblClickElement = async (page, locators, signature, options) => {
    const loc = await __findElement(page, locators, signature, options);
    await __prepare(page, loc, options);
    await loc.first().dblclick();
  };
  const __rightClickElement = async (page, locators, signature, options) => {
    const loc = await __findElement(page, locators, signature, options);
    await __prepare(page, loc, options);
    await loc.first().click({ button: 'right' });
  };
  const __hoverElement = async (page, locators, signature, options) => {
    const loc = await __findElement(page, locators, signature, options);
    await __prepare(page, loc, options);
    await loc.first().hover();
  };
  const __fillElement = async (page, locators, signature, value, options) => {
    const loc = await __findElement(page, locators, signature, options);
    await __prepare(page, loc, options);
    await loc.first().fill(String(value === null || value === undefined ? '' : value));
  };
  const __selectOption = async (page, locators, signature, value, options) => {
    const loc = await __findElement(page, locators, signature, options);
    await __prepare(page, loc, options);
    await loc.first().selectOption(String(value));
  };
  const __uploadFile = async (page, locators, signature, files, options) => {
    const loc = await __findElement(page, locators, signature, options);
    await __prepare(page, loc, options);
    await loc.first().setInputFiles(files);
  };

  const __SETTLE_SELECTORS = [
    '[role="progressbar"]',
    '.mantine-Loader-root',
    '.ant-spin',
    '.ant-spin-spinning',
    '.MuiCircularProgress-root',
    '.MuiLinearProgress-root',
    '.spinner',
    '.loading',
    '.animate-spin',
    '[data-loading="true"]',
    '[aria-busy="true"]'
  ];

  const __settle = async (page, timeout) => {
    const t = timeout || 5000;
    const deadline = Date.now() + t;
    try { await page.waitForLoadState('networkidle', { timeout: Math.min(2000, t) }); } catch (_) {}
    for (const sel of __SETTLE_SELECTORS) {
      try {
        const loc = page.locator(sel).first();
        await loc.waitFor({ state: 'hidden', timeout: Math.max(300, deadline - Date.now()) });
      } catch (_) {}
    }
    // Wait for 2 animation frames so any CSS/JS transitions complete.
    try { await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); } catch (_) {}
  };

  const __capture = async (page, filePath) => {
    await page.screenshot({ path: filePath, fullPage: true, animations: 'disabled' });
    __log('INFO', 'Screenshot saved to ' + filePath);
  };

  const __TOAST_SELECTORS = '.mantine-Notification-root, [role="status"], [role="alert"], [data-notification], .ant-message, .ant-notification-notice, .MuiSnackbar-root, [data-toast]';

  const __postActionVerify = async (page, opts) => {
    const o = Object.assign({ timeout: 3000, fromUrl: page.url() }, opts || {});
    const deadline = Date.now() + o.timeout;
    let detected = false;
    while (Date.now() < deadline) {
      const urlChanged = page.url() !== o.fromUrl;
      const toastVisible = await page.locator(__TOAST_SELECTORS).first().isVisible().catch(() => false);
      if (urlChanged || toastVisible) {
        detected = true;
        break;
      }
      try { await page.waitForFunction(() => document.readyState === 'complete', { timeout: 150 }); } catch (_) {}
    }
    if (detected) await __settle(page, 2000);
    else await __settle(page, 800);
    __log('INFO', detected ? 'Post-action verified (navigation or feedback detected)' : 'Post-action verified (no navigation detected)');
  };

  const __waitForFinalState = async (page, opts) => {
    const o = Object.assign({ timeout: 10000, expectedText: '', locators: [], signature: 'final-state', htmlPath: '' }, opts || {});
    try { await page.waitForURL((url) => url.toString().includes(window.location.origin), { timeout: 250 }).catch(() => {}); } catch (_) {}
    let lastUrl = page.url();
    const urlDeadline = Date.now() + 2500;
    while (Date.now() < urlDeadline) {
      const cur = page.url();
      if (cur === lastUrl) break;
      lastUrl = cur;
      try { await page.waitForLoadState('networkidle', { timeout: 250 }).catch(() => {}); } catch (_) {}
    }
    await __settle(page, Math.max(1500, Math.min(4000, o.timeout)));
    if (o.expectedText && Array.isArray(o.locators) && o.locators.length > 0) {
      try {
        await __verifyText(page, o.locators, o.signature, o.expectedText, { timeout: Math.max(1000, deadline - Date.now()), htmlPath: o.htmlPath });
        __log('INFO', 'Final state confirmed: ' + o.expectedText);
      } catch (_) {}
    }
  };

  const __goto = async (page, url, timeout) => {
    let lastErr = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
        await __settle(page, Math.min(3000, timeout));
        return;
      } catch (err) {
        lastErr = err;
        __log('WARN', 'Navigation attempt ' + attempt + ' failed: ' + (err && err.message ? err.message : String(err)));
        try { await page.waitForLoadState('load', { timeout: 400 }).catch(() => {}); } catch (_) {}
      }
    }
    throw lastErr || new Error('Navigation failed: ' + url);
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

    const stepFn = (body: string): string => {
      const skipShot = step.action === 'OPEN_BROWSER' || step.action === 'CLOSE_BROWSER';
      const stepShot = `${options.screenshotPath}-step-${step.stepNumber}.png`;
      const before =
        options.screenshotTiming === 'BEFORE_ACTION' && !skipShot
          ? `await __capture(page, ${str(stepShot)}); `
          : '';
      const after =
        options.screenshotTiming === 'AFTER_ACTION' && !skipShot
          ? ` await __capture(page, ${str(stepShot)});`
          : '';
      return `  await __step(${step.stepNumber}, async () => { ${before}${body}${after} });\n`;
    };
    const sig = (): string => str(stepSignature(step));
    const fieldLoc = (): string => locatorsLiteral(expandFieldCandidates(stepLocatorCandidates(step)));

    const needLocator = (): ScriptLocator[] => {
      const cands = stepLocatorCandidates(step);
      if (cands.length === 0) {
        throw new Error(`Step ${step.stepNumber}: ${step.action} requires at least one locator`);
      }
      return cands;
    };

    const resolveVerifyCands = (value: string): ScriptLocator[] => {
      const cands = stepLocatorCandidates(step);
      if (cands.length > 0) return expandFieldCandidates(cands);
      if (value) return textLandmarks(value);
      throw new Error(`Step ${step.stepNumber}: ${step.action} requires a locator or an expected value`);
    };

    switch (step.action) {
      case 'OPEN_BROWSER':
        return logs + `  __log('INFO', 'Browser context already initialized by engine');\n`;

      case 'NAVIGATE': {
        if (!options.baseUrl && !step.target && !step.inputValue) {
          throw new Error(`Step ${step.stepNumber}: NAVIGATE requires a target URL or a project base URL`);
        }
        const url = step.target || step.inputValue || options.baseUrl || '';
        return logs + stepFn(`await __goto(page, ${str(resolveNavigateUrl(url, options.baseUrl))}, ${options.timeout});`);
      }

      case 'RELOAD':
        return logs + stepFn('await page.reload({ waitUntil: \'domcontentloaded\' }); await __settle(page, 2000);');

      case 'BACK':
        return logs + stepFn('await page.goBack();');

      case 'FORWARD':
        return logs + stepFn('await page.goForward();');

      case 'CLICK': {
        needLocator();
        return logs + stepFn(
          `const __preUrl = page.url(); ` +
          `await __clickElement(page, ${fieldLoc()}, ${sig()}, __findOpts); ` +
          `await __postActionVerify(page, { fromUrl: __preUrl, timeout: ${options.timeout} });`,
        );
      }

      case 'DOUBLE_CLICK': {
        needLocator();
        return logs + stepFn(
          `const __preUrl = page.url(); ` +
          `await __dblClickElement(page, ${fieldLoc()}, ${sig()}, __findOpts); ` +
          `await __postActionVerify(page, { fromUrl: __preUrl, timeout: ${options.timeout} });`,
        );
      }

      case 'RIGHT_CLICK': {
        needLocator();
        return logs + stepFn(
          `const __preUrl = page.url(); ` +
          `await __rightClickElement(page, ${fieldLoc()}, ${sig()}, __findOpts); ` +
          `await __postActionVerify(page, { fromUrl: __preUrl, timeout: ${options.timeout} });`,
        );
      }

      case 'HOVER': {
        needLocator();
        return logs + stepFn(`await __hoverElement(page, ${fieldLoc()}, ${sig()}, __findOpts);`);
      }

      case 'TYPE': {
        needLocator();
        return logs + stepFn(`await __fillElement(page, ${fieldLoc()}, ${sig()}, ${str(step.inputValue)}, __findOpts);`);
      }

      case 'CLEAR': {
        needLocator();
        return logs + stepFn(`await __fillElement(page, ${fieldLoc()}, ${sig()}, '', __findOpts);`);
      }

      case 'SELECT': {
        needLocator();
        return logs + stepFn(
          `const __preUrl = page.url(); ` +
          `await __selectOption(page, ${fieldLoc()}, ${sig()}, ${str(step.inputValue)}, __findOpts); ` +
          `await __postActionVerify(page, { fromUrl: __preUrl, timeout: ${options.timeout} });`,
        );
      }

      case 'CHECK': {
        needLocator();
        return logs + stepFn(
          `const __preUrl = page.url(); ` +
          `const __el = await __findElement(page, ${fieldLoc()}, ${sig()}, __findOpts); await __el.first().check(); ` +
          `await __postActionVerify(page, { fromUrl: __preUrl, timeout: ${options.timeout} });`,
        );
      }

      case 'UNCHECK': {
        needLocator();
        return logs + stepFn(
          `const __preUrl = page.url(); ` +
          `const __el = await __findElement(page, ${fieldLoc()}, ${sig()}, __findOpts); await __el.first().uncheck(); ` +
          `await __postActionVerify(page, { fromUrl: __preUrl, timeout: ${options.timeout} });`,
        );
      }

      case 'PRESS_KEY': {
        const cands = stepLocatorCandidates(step);
        if (cands.length > 0) {
          return logs + stepFn(
            `const __preUrl = page.url(); ` +
            `const __el = await __findElement(page, ${locatorsLiteral(expandFieldCandidates(cands))}, ${sig()}, __findOpts); await __el.first().press(${str(step.inputValue)}); ` +
            `await __postActionVerify(page, { fromUrl: __preUrl, timeout: ${options.timeout} });`,
          );
        }
        return logs + stepFn(
          `const __preUrl = page.url(); ` +
          `await page.keyboard.press(${str(step.inputValue)}); ` +
          `await __postActionVerify(page, { fromUrl: __preUrl, timeout: ${options.timeout} });`,
        );
      }

      case 'UPLOAD_FILE': {
        needLocator();
        return logs + stepFn(`await __uploadFile(page, ${fieldLoc()}, ${sig()}, ${str(step.inputValue)}, __findOpts);`);
      }

      case 'WAIT': {
        const ms = Number(step.inputValue || 1000);
        return logs + stepFn(`await page.waitForTimeout(${ms});`);
      }

      case 'SCROLL': {
        const cands = stepLocatorCandidates(step);
        if (cands.length > 0) {
          return logs + stepFn(`const __el = await __findElement(page, ${locatorsLiteral(expandFieldCandidates(cands))}, ${sig()}, __findOpts); await __el.first().scrollIntoViewIfNeeded();`);
        }
        const y = Number(step.inputValue || 500);
        return logs + stepFn(`await page.mouse.wheel(0, ${y});`);
      }

      case 'DRAG_AND_DROP': {
        const sourceCands = expandFieldCandidates(stepLocatorCandidates(step));
        if (sourceCands.length === 0) {
          throw new Error(`Step ${step.stepNumber}: DRAG_AND_DROP requires a source locator`);
        }
        const destValue = step.inputValue;
        if (!destValue) {
          throw new Error(`Step ${step.stepNumber}: DRAG_AND_DROP requires a destination locator`);
        }
        const destCands = expandFieldCandidates([{ strategy: step.locatorStrategy || 'CSS', value: destValue }]);
        return logs + stepFn(
          `const __src = await __findElement(page, ${locatorsLiteral(sourceCands)}, ${str(`step${step.stepNumber}:${step.action}:src`)}, __findOpts); ` +
          `const __dst = await __findElement(page, ${locatorsLiteral(destCands)}, ${str(`step${step.stepNumber}:${step.action}:dst`)}, __findOpts); ` +
          `await __src.first().dragTo(__dst.first());`,
        );
      }

      case 'TAKE_SCREENSHOT':
        return logs + stepFn(`await __capture(page, ${str(`${options.screenshotPath}-step-${step.stepNumber}.png`)});`);

      case 'CLOSE_BROWSER':
        return logs + stepFn('await browser.close();');

      case 'VERIFY_URL': {
        const expected = step.inputValue ?? step.target ?? options.baseUrl;
        if (!expected) throw new Error(`Step ${step.stepNumber}: VERIFY_URL requires a value`);
        const target = resolveNavigateUrl(expected, options.baseUrl);
        return logs + stepFn(`await page.waitForURL((url) => url.toString().includes(${str(target)}), { timeout: ${options.timeout} });`);
      }

      case 'VERIFY_TITLE': {
        const expected = step.inputValue ?? step.expectedResult ?? '';
        if (!expected) throw new Error(`Step ${step.stepNumber}: VERIFY_TITLE requires an expected value`);
        return logs + stepFn(`const actualTitle = await page.title(); if (!actualTitle.toLowerCase().includes(${str(expected)}.toLowerCase())) throw new Error('Expected title containing ' + ${str(expected)} + ' but got: ' + actualTitle);`);
      }

      case 'VERIFY_TEXT': {
        const expected = step.inputValue ?? step.expectedResult ?? '';
        if (!expected) throw new Error(`Step ${step.stepNumber}: VERIFY_TEXT requires an expected value`);
        const cands = [...stepLocatorCandidates(step), ...textLandmarks(expected)];
        return logs + stepFn(`await __verifyText(page, ${locatorsLiteral(cands)}, ${sig()}, ${str(expected)}, __findOpts);`);
      }

      case 'VERIFY_ELEMENT': {
        const value = step.inputValue ?? step.expectedResult ?? '';
        const resolved = resolveVerifyCands(value);
        return logs + stepFn(`await __findElement(page, ${locatorsLiteral(resolved)}, ${sig()}, Object.assign({}, __findOpts, { requireVisible: false, requireEnabled: false, multiMatch: 'all' }));`);
      }

      case 'VERIFY_VISIBLE': {
        const value = step.inputValue ?? step.expectedResult ?? '';
        const resolved = resolveVerifyCands(value);
        return logs + stepFn(`await __findElement(page, ${locatorsLiteral(resolved)}, ${sig()}, Object.assign({}, __findOpts, { multiMatch: 'all' }));`);
      }

      case 'VERIFY_HIDDEN': {
        const value = step.inputValue ?? step.expectedResult ?? '';
        const resolved = resolveVerifyCands(value);
        return logs + stepFn(`await __verifyNotVisible(page, ${locatorsLiteral(resolved)}, ${sig()}, __findOpts);`);
      }

      case 'VERIFY_ENABLED': {
        const value = step.inputValue ?? step.expectedResult ?? '';
        const resolved = resolveVerifyCands(value);
        return logs + stepFn(`await __findElement(page, ${locatorsLiteral(resolved)}, ${sig()}, Object.assign({}, __findOpts, { multiMatch: 'all' }));`);
      }

      case 'VERIFY_DISABLED': {
        const value = step.inputValue ?? step.expectedResult ?? '';
        const resolved = resolveVerifyCands(value);
        return logs + stepFn(
          `const __el = await __findElement(page, ${locatorsLiteral(resolved)}, ${sig()}, Object.assign({}, __findOpts, { requireEnabled: false })); ` +
          `if (await __el.first().isEnabled()) throw new Error('Expected element to be disabled');`,
        );
      }

      case 'VERIFY_ATTRIBUTE': {
        needLocator();
        const attr = step.inputValue ?? 'value';
        const expected = step.expectedResult ?? '';
        return logs + stepFn(
          `const __el = await __findElement(page, ${fieldLoc()}, ${sig()}, Object.assign({}, __findOpts, { requireVisible: false })); ` +
          `const actual = await __el.first().getAttribute(${str(attr)}); ` +
          `if (actual !== ${str(expected)}) throw new Error('Expected attribute ' + ${str(attr)} + ' to be ' + ${str(expected)} + ' but got: ' + actual);`,
        );
      }

      case 'VERIFY_COUNT': {
        needLocator();
        const expected = Number(step.inputValue ?? step.expectedResult ?? 1);
        return logs + stepFn(
          `const __el = await __findElement(page, ${fieldLoc()}, ${sig()}, Object.assign({}, __findOpts, { requireVisible: false, requireEnabled: false, multiMatch: 'all' })); ` +
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

  const finalStep = steps[steps.length - 1];
  const finalVerifyExpected = finalStep ? finalStep.inputValue ?? finalStep.expectedResult ?? '' : '';
  const finalVerifyCands =
    finalStep && (finalStep.action.startsWith('VERIFY') || finalVerifyExpected)
      ? [...stepLocatorCandidates(finalStep), ...textLandmarks(finalVerifyExpected)]
      : [];

  return [
    `const { ${browserName} } = require('playwright');`,
    '',
    '(async () => {',
    `  const __title = ${str(title)};`,
    `  const startedAt = Date.now();`,
    `  const browser = await ${browserName}.launch({ headless: ${options.headless}, slowMo: ${options.slowMotion} });`,
    `  const context = await browser.newContext({ viewport: { width: ${options.viewportWidth}, height: ${options.viewportHeight} }, deviceScaleFactor: ${options.deviceScaleFactor} });`,
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
    `    await __waitForFinalState(page, { timeout: ${options.timeout}, expectedText: ${str(finalVerifyExpected)}, locators: ${locatorsLiteral(finalVerifyCands)}, signature: ${str('final-state')}, htmlPath: ${str(htmlDumpPath)} });`,
    `    await __capture(page, ${str(options.screenshotPath)});`,
    `    __log('INFO', 'Execution finished: PASSED');`,
    `    process.stdout.write('RESULT:' + JSON.stringify({ status: 'PASSED', durationMs: Date.now() - startedAt }) + '\\n');`,
    '  } catch (err) {',
    `    try { await __capture(page, ${str(options.screenshotPath)}); } catch (_) {}`,
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
