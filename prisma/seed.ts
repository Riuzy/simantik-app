import { PrismaClient } from '@prisma/client';
import { encryptSecret } from '../src/server/utils/encryption';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcrypt');
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('Seeding...');
  const password = await hashPassword('Password123!');

  // Create user
  const user = await prisma.user.upsert({
    where: { email: 'tester@simantik.local' },
    update: { name: 'Tester', isActive: true, mustChangePassword: false },
    create: {
      name: 'Tester',
      email: 'tester@simantik.local',
      password,
      isActive: true,
      tokenVersion: 0,
      mustChangePassword: false,
    },
  });

  console.log('User: tester@simantik.local / Password123!');

  // Project config is the single source of truth for the automation engine.
  const projectConfig = {
    name: 'SIMANTIK',
    slug: 'simantik',
    description: 'Automation Testing Platform SIMANTIK.',
    baseUrl: 'http://localhost:3000',
    // Automation
    browser: 'CHROMIUM',
    environment: 'Local Development',
    headless: true,
    timeout: 30000,
    slowMo: 0,
    viewportWidth: 1280,
    viewportHeight: 720,
    debugMode: false,
    // Authentication
    authenticationEnabled: true,
    loginUrl: '/login',
    loginEmail: 'tester@simantik.local',
    loginPassword: encryptSecret('Password123!'),
    loginMethod: 'BROWSER',
    sessionStrategy: 'REUSE_CONTEXT',
    framework: 'PLAYWRIGHT',
    status: 'ACTIVE',
  } as const;

  const project = await prisma.project.upsert({
    where: { slug: 'simantik' },
    update: {
      ...projectConfig,
      code: 'PRJ-0001',
      createdById: user.id,
    },
    create: {
      code: 'PRJ-0001',
      ...projectConfig,
      createdById: user.id,
    },
  });

  console.log('Project:', project.name, '(', project.code, ')');

  // Create test cases for SIMANTIK
  interface SeedStep {
    stepNumber: number;
    action: string;
    description?: string;
    target?: string;
    locators?: Array<{ strategy: string; value: string }>;
    locatorStrategy?: string;
    locatorValue?: string;
    inputValue?: string;
    expectedResult?: string;
  }

  interface SeedTestCase {
    code: string;
    title: string;
    description: string;
    module: string;
    priority: 'HIGH' | 'MEDIUM';
    status: 'READY';
    type: 'AUTOMATION';
    tags: string[];
    steps: SeedStep[];
  }

  const testCases: SeedTestCase[] = [
    {
      code: 'TC-0001',
      title: 'Login to SIMANTIK',
      description: 'Automated login test using the project authentication config',
      module: 'Authentication',
      priority: 'HIGH' as const,
      status: 'READY' as const,
      type: 'AUTOMATION' as const,
      tags: ['login', 'auth', 'smoke'],
      steps: [
        { stepNumber: 1, action: 'OPEN_BROWSER', description: 'Open browser', expectedResult: 'Browser opens successfully' },
        { stepNumber: 2, action: 'NAVIGATE', description: 'Navigate to dashboard after auto login', target: '/dashboard', expectedResult: 'Authenticated page loads' },
        { stepNumber: 3, action: 'VERIFY_URL', description: 'Verify redirected to dashboard', inputValue: '/dashboard', expectedResult: 'URL matches dashboard' },
        { stepNumber: 4, action: 'VERIFY_TEXT', description: 'Verify dashboard title', locatorStrategy: 'CSS', locatorValue: 'h2', inputValue: 'Dashboard', expectedResult: 'Dashboard title visible' },
      ],
    },
    {
      code: 'TC-0002',
      title: 'Create Project',
      description: 'Create a new automation project in SIMANTIK',
      module: 'Project Management',
      priority: 'MEDIUM' as const,
      status: 'READY' as const,
      type: 'AUTOMATION' as const,
      tags: ['project', 'crud', 'positive'],
      steps: [
        { stepNumber: 1, action: 'OPEN_BROWSER', description: 'Open browser', expectedResult: 'Browser opens' },
        { stepNumber: 2, action: 'NAVIGATE', description: 'Navigate to create project page', target: '/projects/create', expectedResult: 'Create project page loads' },
        {
          stepNumber: 3,
          action: 'TYPE',
          description: 'Enter project name',
          locators: [
            { strategy: 'LABEL', value: 'Project Name' },
            { strategy: 'PLACEHOLDER', value: 'e.g. Automation Suite' },
            { strategy: 'ROLE', value: 'textbox:Project Name' },
            { strategy: 'NAME', value: 'name' },
            { strategy: 'ID', value: 'name' },
            { strategy: 'CSS', value: 'input[name="name"]' },
            { strategy: 'XPATH', value: '//input[@name="name"]' },
          ],
          inputValue: 'Test Project',
          expectedResult: 'Name entered',
        },
        {
          stepNumber: 4,
          action: 'TYPE',
          description: 'Enter project slug',
          locators: [
            { strategy: 'LABEL', value: 'Slug' },
            { strategy: 'PLACEHOLDER', value: 'project-name' },
            { strategy: 'ROLE', value: 'textbox:Slug' },
            { strategy: 'NAME', value: 'slug' },
            { strategy: 'ID', value: 'slug' },
            { strategy: 'CSS', value: 'input[name="slug"]' },
            { strategy: 'XPATH', value: '//input[@name="slug"]' },
          ],
          inputValue: 'test-project',
          expectedResult: 'Slug entered',
        },
        {
          stepNumber: 5,
          action: 'CLICK',
          description: 'Submit form',
          locators: [
            { strategy: 'ROLE', value: 'button:Create Project' },
            { strategy: 'TEXT', value: 'Create Project' },
            { strategy: 'CSS', value: 'button[type="submit"]' },
          ],
          expectedResult: 'Project created',
        },
        {
          stepNumber: 6,
          action: 'VERIFY_TEXT',
          description: 'Verify redirected to projects list',
          locators: [
            { strategy: 'ROLE', value: 'heading:Projects' },
            { strategy: 'TEXT', value: 'Projects' },
            { strategy: 'CSS', value: 'h2' },
          ],
          inputValue: 'Projects',
          expectedResult: 'Projects page visible',
        },
      ],
    },
    {
      code: 'TC-0003',
      title: 'Create Test Case',
      description: 'Create a new test case with steps',
      module: 'Test Management',
      priority: 'MEDIUM' as const,
      status: 'READY' as const,
      type: 'AUTOMATION' as const,
      tags: ['testcase', 'crud', 'positive'],
      steps: [
        { stepNumber: 1, action: 'OPEN_BROWSER', description: 'Open browser', expectedResult: 'Browser opens' },
        { stepNumber: 2, action: 'NAVIGATE', description: 'Navigate to test cases', target: '/test-cases', expectedResult: 'Test cases page loads' },
        { stepNumber: 3, action: 'VERIFY_TEXT', description: 'Verify test cases page', locators: [{ strategy: 'ROLE', value: 'heading:Test Cases' }, { strategy: 'TEXT', value: 'Test Cases' }, { strategy: 'CSS', value: 'h2' }], inputValue: 'Test Cases', expectedResult: 'Test cases page visible' },
      ],
    },
    {
      code: 'TC-0004',
      title: 'Execute Automation',
      description: 'Execute automation test and verify results',
      module: 'Automation',
      priority: 'HIGH' as const,
      status: 'READY' as const,
      type: 'AUTOMATION' as const,
      tags: ['automation', 'execution', 'smoke'],
      steps: [
        { stepNumber: 1, action: 'OPEN_BROWSER', description: 'Open browser', expectedResult: 'Browser opens' },
        { stepNumber: 2, action: 'NAVIGATE', description: 'Navigate to automation page', target: '/automation', expectedResult: 'Automation page loads' },
        { stepNumber: 3, action: 'VERIFY_TEXT', description: 'Verify automation page', locatorStrategy: 'CSS', locatorValue: 'h2', inputValue: 'Automation', expectedResult: 'Automation page visible' },
      ],
    },
    {
      code: 'TC-0005',
      title: 'Generate Report',
      description: 'Generate and verify execution report',
      module: 'Reporting',
      priority: 'MEDIUM' as const,
      status: 'READY' as const,
      type: 'AUTOMATION' as const,
      tags: ['report', 'reporting', 'verification'],
      steps: [
        { stepNumber: 1, action: 'OPEN_BROWSER', description: 'Open browser', expectedResult: 'Browser opens' },
        { stepNumber: 2, action: 'NAVIGATE', description: 'Navigate to reports page', target: '/reports', expectedResult: 'Reports page loads' },
        { stepNumber: 3, action: 'VERIFY_TEXT', description: 'Verify reports page', locatorStrategy: 'CSS', locatorValue: 'h2', inputValue: 'Reports', expectedResult: 'Reports page visible' },
      ],
    },
    {
      code: 'TC-0006',
      title: 'Capture Screenshot',
      description: 'Capture and verify execution screenshot',
      module: 'Automation',
      priority: 'HIGH' as const,
      status: 'READY' as const,
      type: 'AUTOMATION' as const,
      tags: ['screenshot', 'artifact', 'verification'],
      steps: [
        { stepNumber: 1, action: 'OPEN_BROWSER', description: 'Open browser', expectedResult: 'Browser opens' },
        { stepNumber: 2, action: 'NAVIGATE', description: 'Navigate to executions', target: '/executions', expectedResult: 'Executions page loads' },
        { stepNumber: 3, action: 'VERIFY_TEXT', description: 'Verify executions page', locatorStrategy: 'CSS', locatorValue: 'h2', inputValue: 'Executions', expectedResult: 'Executions page visible' },
      ],
    },
  ];

  for (const tc of testCases) {
    const { steps, ...tcData } = tc;
    const testCase = await prisma.testCase.upsert({
      where: { code: tcData.code },
      update: {
        ...tcData,
        projectId: project.id,
        createdById: user.id,
        status: tcData.status,
      },
      create: {
        ...tcData,
        projectId: project.id,
        createdById: user.id,
      },
    });

    // Delete existing steps and recreate
    await prisma.testStep.deleteMany({ where: { testCaseId: testCase.id } });

    for (const step of steps) {
      const locators = step.locators;
      await prisma.testStep.create({
        data: {
          testCaseId: testCase.id,
          stepNumber: step.stepNumber,
          action: step.action,
          description: step.description,
          target: step.target,
          locatorStrategy: step.locatorStrategy,
          locatorValue: step.locatorValue,
          ...(locators && locators.length > 0 ? { locators } : {}),
          inputValue: step.inputValue,
          expectedResult: step.expectedResult,
        },
      });
    }

    console.log('Test case created:', testCase.code, '-', testCase.title);
  }

  console.log('Done! Seeded SIMANTIK project with test cases.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());