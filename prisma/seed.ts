import { PrismaClient } from '@prisma/client';

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

  // Create SIMANTIK project
  const project = await prisma.project.upsert({
    where: { code: 'PRJ-0001' },
    update: {
      name: 'SIMANTIK',
      slug: 'simantik',
      description: 'Automation Testing Platform SIMANTIK.',
      baseUrl: 'http://localhost:3000',
      framework: 'PLAYWRIGHT',
      environment: 'Local Development',
      status: 'ACTIVE',
      createdById: user.id,
    },
    create: {
      code: 'PRJ-0001',
      name: 'SIMANTIK',
      slug: 'simantik',
      description: 'Automation Testing Platform SIMANTIK.',
      baseUrl: 'http://localhost:3000',
      framework: 'PLAYWRIGHT',
      environment: 'Local Development',
      status: 'ACTIVE',
      createdById: user.id,
    },
  });

  console.log('Project:', project.name, '(', project.code, ')');

  // Create automation config for SIMANTIK
  await prisma.automationConfig.upsert({
    where: { projectId: project.id },
    update: {
      framework: 'PLAYWRIGHT',
      browser: 'CHROMIUM',
      baseUrl: 'http://localhost:3000',
      headless: true,
      viewportWidth: 1280,
      viewportHeight: 720,
      timeout: 30000,
      retry: 0,
      parallel: 1,
      slowMotion: 0,
    },
    create: {
      projectId: project.id,
      framework: 'PLAYWRIGHT',
      browser: 'CHROMIUM',
      baseUrl: 'http://localhost:3000',
      headless: true,
      viewportWidth: 1280,
      viewportHeight: 720,
      timeout: 30000,
      retry: 0,
      parallel: 1,
      slowMotion: 0,
    },
  });

  console.log('Automation config created');

  // Create test cases for SIMANTIK
  const testCases = [
    {
      code: 'TC-0001',
      title: 'Login to SIMANTIK',
      description: 'Automated login test for SIMANTIK platform',
      module: 'Authentication',
      priority: 'HIGH' as const,
      status: 'READY' as const,
      tags: ['login', 'auth', 'smoke'],
      steps: [
        { stepNumber: 1, action: 'OPEN_BROWSER', description: 'Open browser', expectedResult: 'Browser opens successfully' },
        { stepNumber: 2, action: 'NAVIGATE', description: 'Navigate to SIMANTIK login page', target: 'http://localhost:3000/login', expectedResult: 'Login page loads' },
        { stepNumber: 3, action: 'TYPE', description: 'Enter email', locatorStrategy: 'CSS', locatorValue: 'input[name="email"]', inputValue: 'tester@simantik.local', expectedResult: 'Email entered' },
        { stepNumber: 4, action: 'TYPE', description: 'Enter password', locatorStrategy: 'CSS', locatorValue: 'input[name="password"]', inputValue: 'Password123!', expectedResult: 'Password entered' },
        { stepNumber: 5, action: 'CLICK', description: 'Click login button', locatorStrategy: 'CSS', locatorValue: 'button[type="submit"]', expectedResult: 'Login successful' },
        { stepNumber: 6, action: 'VERIFY_URL', description: 'Verify redirected to dashboard', inputValue: 'http://localhost:3000/dashboard', expectedResult: 'URL matches dashboard' },
        { stepNumber: 7, action: 'VERIFY_TEXT', description: 'Verify welcome message', locatorStrategy: 'TEXT', locatorValue: 'Welcome', expectedResult: 'Welcome message visible' },
      ],
    },
    {
      code: 'TC-0002',
      title: 'Create Project',
      description: 'Create a new automation project in SIMANTIK',
      module: 'Project Management',
      priority: 'MEDIUM' as const,
      status: 'READY' as const,
      tags: ['project', 'crud', 'positive'],
      steps: [
        { stepNumber: 1, action: 'OPEN_BROWSER', description: 'Open browser', expectedResult: 'Browser opens' },
        { stepNumber: 2, action: 'NAVIGATE', description: 'Navigate to projects page', target: 'http://localhost:3000/projects', expectedResult: 'Projects page loads' },
        { stepNumber: 3, action: 'CLICK', description: 'Click create project button', locatorStrategy: 'CSS', locatorValue: 'button:has-text("Create Project")', expectedResult: 'Create modal opens' },
        { stepNumber: 4, action: 'TYPE', description: 'Enter project code', locatorStrategy: 'CSS', locatorValue: 'input[name="code"]', inputValue: 'PRJ-0002', expectedResult: 'Code entered' },
        { stepNumber: 5, action: 'TYPE', description: 'Enter project name', locatorStrategy: 'CSS', locatorValue: 'input[name="name"]', inputValue: 'Test Project', expectedResult: 'Name entered' },
        { stepNumber: 6, action: 'TYPE', description: 'Enter base URL', locatorStrategy: 'CSS', locatorValue: 'input[name="baseUrl"]', inputValue: 'http://localhost:3000', expectedResult: 'Base URL entered' },
        { stepNumber: 7, action: 'CLICK', description: 'Submit form', locatorStrategy: 'CSS', locatorValue: 'button[type="submit"]', expectedResult: 'Project created' },
        { stepNumber: 8, action: 'VERIFY_TEXT', description: 'Verify project in list', locatorStrategy: 'TEXT', locatorValue: 'Test Project', expectedResult: 'Project visible in list' },
      ],
    },
    {
      code: 'TC-0003',
      title: 'Create Test Case',
      description: 'Create a new test case with steps',
      module: 'Test Management',
      priority: 'MEDIUM' as const,
      status: 'READY' as const,
      tags: ['testcase', 'crud', 'positive'],
      steps: [
        { stepNumber: 1, action: 'OPEN_BROWSER', description: 'Open browser', expectedResult: 'Browser opens' },
        { stepNumber: 2, action: 'NAVIGATE', description: 'Navigate to test cases', target: 'http://localhost:3000/projects/simantik/test-cases', expectedResult: 'Test cases page loads' },
        { stepNumber: 3, action: 'CLICK', description: 'Click create test case', locatorStrategy: 'CSS', locatorValue: 'button:has-text("Create Test Case")', expectedResult: 'Create modal opens' },
        { stepNumber: 4, action: 'TYPE', description: 'Enter test case code', locatorStrategy: 'CSS', locatorValue: 'input[name="code"]', inputValue: 'TC-0004', expectedResult: 'Code entered' },
        { stepNumber: 5, action: 'TYPE', description: 'Enter test case title', locatorStrategy: 'CSS', locatorValue: 'input[name="title"]', inputValue: 'Logout Test', expectedResult: 'Title entered' },
        { stepNumber: 6, action: 'CLICK', description: 'Add first step', locatorStrategy: 'CSS', locatorValue: 'button:has-text("Add Step")', expectedResult: 'Step form opens' },
        { stepNumber: 7, action: 'SELECT', description: 'Select OPEN_BROWSER action', locatorStrategy: 'CSS', locatorValue: 'select[name="action"]', inputValue: 'OPEN_BROWSER', expectedResult: 'Action selected' },
        { stepNumber: 8, action: 'CLICK', description: 'Save step', locatorStrategy: 'CSS', locatorValue: 'button:has-text("Save")', expectedResult: 'Step saved' },
        { stepNumber: 9, action: 'CLICK', description: 'Save test case', locatorStrategy: 'CSS', locatorValue: 'button:has-text("Save Test Case")', expectedResult: 'Test case created' },
      ],
    },
    {
      code: 'TC-0004',
      title: 'Execute Automation',
      description: 'Execute automation test and verify results',
      module: 'Automation',
      priority: 'HIGH' as const,
      status: 'READY' as const,
      tags: ['automation', 'execution', 'smoke'],
      steps: [
        { stepNumber: 1, action: 'OPEN_BROWSER', description: 'Open browser', expectedResult: 'Browser opens' },
        { stepNumber: 2, action: 'NAVIGATE', description: 'Navigate to automation page', target: 'http://localhost:3000/automation', expectedResult: 'Automation page loads' },
        { stepNumber: 3, action: 'CLICK', description: 'Select SIMANTIK project', locatorStrategy: 'CSS', locatorValue: 'select[name="projectId"]', expectedResult: 'Project selected' },
        { stepNumber: 4, action: 'CLICK', description: 'Select test case', locatorStrategy: 'CSS', locatorValue: 'select[name="testCaseId"]', expectedResult: 'Test case selected' },
        { stepNumber: 5, action: 'CLICK', description: 'Click run button', locatorStrategy: 'CSS', locatorValue: 'button:has-text("Run")', expectedResult: 'Execution starts' },
        { stepNumber: 6, action: 'WAIT', description: 'Wait for execution to complete', inputValue: '60000', expectedResult: 'Execution completes' },
        { stepNumber: 7, action: 'VERIFY_TEXT', description: 'Verify PASSED status', locatorStrategy: 'TEXT', locatorValue: 'PASSED', expectedResult: 'Status is PASSED' },
        { stepNumber: 8, action: 'CLICK', description: 'View execution detail', locatorStrategy: 'TEXT', locatorValue: 'View Details', expectedResult: 'Detail page opens' },
      ],
    },
    {
      code: 'TC-0005',
      title: 'Generate Report',
      description: 'Generate and verify execution report',
      module: 'Reporting',
      priority: 'MEDIUM' as const,
      status: 'READY' as const,
      tags: ['report', 'reporting', 'verification'],
      steps: [
        { stepNumber: 1, action: 'OPEN_BROWSER', description: 'Open browser', expectedResult: 'Browser opens' },
        { stepNumber: 2, action: 'NAVIGATE', description: 'Navigate to reports page', target: 'http://localhost:3000/reports', expectedResult: 'Reports page loads' },
        { stepNumber: 3, action: 'CLICK', description: 'Click generate report', locatorStrategy: 'CSS', locatorValue: 'button:has-text("Generate Report")', expectedResult: 'Report generation starts' },
        { stepNumber: 4, action: 'WAIT', description: 'Wait for report generation', inputValue: '30000', expectedResult: 'Report generated' },
        { stepNumber: 5, action: 'VERIFY_TEXT', description: 'Verify report data', locatorStrategy: 'TEXT', locatorValue: 'PASSED', expectedResult: 'Report shows passed tests' },
        { stepNumber: 6, action: 'CLICK', description: 'Download report', locatorStrategy: 'CSS', locatorValue: 'button:has-text("Download")', expectedResult: 'Report downloaded' },
      ],
    },
    {
      code: 'TC-0006',
      title: 'Capture Screenshot',
      description: 'Capture and verify execution screenshot',
      module: 'Automation',
      priority: 'HIGH' as const,
      status: 'READY' as const,
      tags: ['screenshot', 'artifact', 'verification'],
      steps: [
        { stepNumber: 1, action: 'OPEN_BROWSER', description: 'Open browser', expectedResult: 'Browser opens' },
        { stepNumber: 2, action: 'NAVIGATE', description: 'Navigate to executions', target: 'http://localhost:3000/executions', expectedResult: 'Executions page loads' },
        { stepNumber: 3, action: 'CLICK', description: 'Click execution with screenshot', locatorStrategy: 'CSS', locatorValue: 'tr:has-text("PASSED")', expectedResult: 'Execution detail opens' },
        { stepNumber: 4, action: 'VERIFY_TEXT', description: 'Verify screenshot section', locatorStrategy: 'TEXT', locatorValue: 'Screenshot', expectedResult: 'Screenshot section visible' },
        { stepNumber: 5, action: 'VERIFY_TEXT', description: 'Verify image loaded', locatorStrategy: 'CSS', locatorValue: 'img[alt="Execution screenshot"]', expectedResult: 'Screenshot image loads' },
        { stepNumber: 6, action: 'CLICK', description: 'Download screenshot', locatorStrategy: 'CSS', locatorValue: 'button:has-text("Download")', expectedResult: 'Screenshot downloaded' },
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
      await prisma.testStep.create({
        data: {
          testCaseId: testCase.id,
          stepNumber: step.stepNumber,
          action: step.action,
          description: step.description,
          locatorStrategy: step.locatorStrategy,
          locatorValue: step.locatorValue,
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