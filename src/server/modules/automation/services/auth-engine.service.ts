import { LoginMethod, SessionStrategy } from '@prisma/client';

/**
 * Resolved authentication settings for a single execution.
 * The password is provided here in plain text - it is decrypted only in the
 * service layer right before the script is generated and never persisted or
 * returned to any client.
 */
export interface AuthConfig {
  enabled: boolean;
  baseUrl: string | null;
  loginUrl: string | null;
  email: string | null;
  password: string | null;
  loginMethod: LoginMethod;
  sessionStrategy: SessionStrategy;
  timeout: number;
}

export class AuthEngine {
  private readonly options: AuthConfig;

  constructor(options: AuthConfig) {
    this.options = options;
  }

  get hasCredentials(): boolean {
    return this.options.enabled && Boolean(this.options.email && this.options.password);
  }

  get loginPageUrl(): string {
    const raw = this.options.loginUrl || '/login';
    const normalized = raw.startsWith('/') ? raw : `/${raw}`;
    const base = this.options.baseUrl || '';
    return `${base}${normalized}`;
  }

  /**
   * Returns the bootstrap code that authenticates the session on the current
   * page/context before the test steps run. Returns an empty string when
   * authentication is disabled or credentials are missing.
   */
  loginCode(varName = 'page'): string {
    if (!this.hasCredentials) {
      return '';
    }

    const email = JSON.stringify(this.options.email);
    const password = JSON.stringify(this.options.password);
    const loginPageUrl = JSON.stringify(this.loginPageUrl);
    const baseUrl = JSON.stringify(this.options.baseUrl || '');
    const timeout = this.options.timeout;

    // BROWSER: drive the login form directly on the login page.
    // API: perform an API login and travel to the app to consume the session.
    const body =
      this.options.loginMethod === LoginMethod.API
        ? this.buildApiLogin(email, password, loginPageUrl, baseUrl, timeout)
        : this.buildBrowserLogin(varName, email, password, loginPageUrl, timeout);

    return `\n  // [AuthEngine] Project-level auto login (${this.options.loginMethod})\n  try {\n${body}\n  } catch (err) {\n    __log('WARN', 'AuthEngine: auto login failed - ' + (err && err.message ? err.message : String(err)));\n  }`;
  }

  private buildBrowserLogin(varName: string, email: string, password: string, loginPageUrl: string, timeout: number): string {
    return [
      `    await ${varName}.goto(${loginPageUrl}, { timeout: ${timeout} });`,
      `    const __loginEmail = await __findElement(${varName}, [`,
      `      { strategy: 'LABEL', value: 'Email' },`,
      `      { strategy: 'PLACEHOLDER', value: 'Email' },`,
      `      { strategy: 'ROLE', value: 'textbox:Email' },`,
      `      { strategy: 'NAME', value: 'email' },`,
      `      { strategy: 'ID', value: 'email' },`,
      `      { strategy: 'CSS', value: 'input[name="email"]' },`,
      `      { strategy: 'XPATH', value: '//input[@type="email"]' }`,
      `    ], 'auth:email', { timeout: ${timeout}, requireVisible: true, requireEnabled: true });`,
      `    await __loginEmail.fill(${email});`,
      `    const __loginPassword = await __findElement(${varName}, [`,
      `      { strategy: 'LABEL', value: 'Password' },`,
      `      { strategy: 'PLACEHOLDER', value: 'Password' },`,
      `      { strategy: 'ROLE', value: 'textbox:Password' },`,
      `      { strategy: 'NAME', value: 'password' },`,
      `      { strategy: 'ID', value: 'password' },`,
      `      { strategy: 'CSS', value: 'input[name="password"]' },`,
      `      { strategy: 'XPATH', value: '//input[@type="password"]' }`,
      `    ], 'auth:password', { timeout: ${timeout}, requireVisible: true, requireEnabled: true });`,
      `    await __loginPassword.fill(${password});`,
      `    const __loginSubmit = await __findElement(${varName}, [`,
      `      { strategy: 'ROLE', value: 'button:Sign in' },`,
      `      { strategy: 'TEXT', value: 'Sign in' },`,
      `      { strategy: 'CSS', value: 'button[type="submit"]' }`,
      `    ], 'auth:submit', { timeout: ${timeout}, requireVisible: true, requireEnabled: true });`,
      `    await __loginSubmit.click();`,
      `    await ${varName}.waitForSelector('nav, [data-authenticated="true"], main', { timeout: ${timeout} }).catch(() => {});`,
      `    __log('INFO', 'AuthEngine: browser login completed');`,
    ].join('\n');
  }

  private buildApiLogin(email: string, password: string, loginPageUrl: string, baseUrl: string, timeout: number): string {
    return [
      `    const __apiLogin = await context.request.post(${loginPageUrl}, {`,
      `      data: { email: ${email}, password: ${password} },`,
      `      timeout: ${timeout},`,
      `    });`,
      `    if (!__apiLogin.ok()) { throw new Error('API login rejected with ' + __apiLogin.status()); }`,
      `    const __loginBody = await __apiLogin.json();`,
      `    const __token = __loginBody.accessToken || __loginBody.token || __loginBody.access_token || __loginBody.data?.accessToken || __loginBody.data?.token;`,
      `    if (__token) {`,
      `      await page.evaluate((t) => {`,
      `        const keys = ['access_token', 'token', 'auth_token', 'accessToken'];`,
      `        for (const k of keys) { try { localStorage.setItem(k, t); } catch (_) {} }`,
      `      }, __token);`,
      `    }`,
      `    await page.goto(${baseUrl} || '/', { timeout: ${timeout} });`,
      `    __log('INFO', 'AuthEngine: API login completed');`,
    ].join('\n');
  }
}