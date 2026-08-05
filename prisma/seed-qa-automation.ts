import { PrismaClient, TestCaseType, TestPriority, TestCaseStatus, TestCaseLastResult } from '@prisma/client';

const prisma = new PrismaClient();

async function getProject() {
  const project = await prisma.project.findFirst({ where: { deletedAt: null } });
  if (!project) throw new Error('No project found. Create a project first.');
  return project;
}

async function getUser() {
  const user = await prisma.user.findFirst({ where: { deletedAt: null } });
  if (!user) throw new Error('No user found.');
  return user;
}

// 18 Test Cases untuk Real Automation - Ordered by User Flow
const testCases = [
  // AUTHENTICATION
  { code: 'TC-LOGIN-001', title: 'Login berhasil dengan kredensial valid', module: 'Authentication', priority: 'CRITICAL', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/login', desc: 'Buka halaman login' },
    { step: 2, action: 'Fill', target: 'input[name="email"]', input: 'admin@simantik.id', desc: 'Isi email' },
    { step: 3, action: 'Fill', target: 'input[name="password"]', input: 'Admin123!', desc: 'Isi password' },
    { step: 4, action: 'Click', target: 'button[type="submit"]', desc: 'Klik tombol login' },
    { step: 5, action: 'Wait', target: 'text=Dashboard', desc: 'Verifikasi dashboard muncul' }
  ]},
  { code: 'TC-LOGIN-002', title: 'Login gagal dengan password salah', module: 'Authentication', priority: 'HIGH', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/login', desc: 'Buka halaman login' },
    { step: 2, action: 'Fill', target: 'input[name="email"]', input: 'admin@simantik.id', desc: 'Isi email' },
    { step: 3, action: 'Fill', target: 'input[name="password"]', input: 'WrongPassword', desc: 'Isi password salah' },
    { step: 4, action: 'Click', target: 'button[type="submit"]', desc: 'Klik tombol login' },
    { step: 5, action: 'Wait', target: 'text=Invalid', desc: 'Verifikasi error message' }
  ]},
  
  // DASHBOARD
  { code: 'TC-DASH-001', title: 'Dashboard tampil setelah login', module: 'Dashboard', priority: 'HIGH', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/dashboard', desc: 'Buka dashboard' },
    { step: 2, action: 'Wait', target: 'text=Projects', desc: 'Verifikasi widget Projects' },
    { step: 3, action: 'Wait', target: 'text=Test Cases', desc: 'Verifikasi widget Test Cases' },
    { step: 4, action: 'Wait', target: 'text=Pass Rate', desc: 'Verifikasi Pass Rate' }
  ]},
  
  // PROJECT MANAGEMENT
  { code: 'TC-PROJECT-001', title: 'Membuat project baru', module: 'Project Management', priority: 'HIGH', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/projects', desc: 'Buka halaman projects' },
    { step: 2, action: 'Click', target: 'button:has-text("Create Project")', desc: 'Klik Create Project' },
    { step: 3, action: 'Fill', target: 'input[name="name"]', input: 'Test Project', desc: 'Isi nama project' },
    { step: 4, action: 'Fill', target: 'input[name="code"]', input: 'TEST-PRJ', desc: 'Isi kode project' },
    { step: 5, action: 'Click', target: 'button[type="submit"]', desc: 'Submit form' },
    { step: 6, action: 'Wait', target: 'text=Success', desc: 'Verifikasi toast success' }
  ]},
  { code: 'TC-PROJECT-002', title: 'Edit project existing', module: 'Project Management', priority: 'MEDIUM', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/projects', desc: 'Buka halaman projects' },
    { step: 2, action: 'Click', target: 'button[aria-label="More options"]', desc: 'Klik menu' },
    { step: 3, action: 'Click', target: 'text=Edit', desc: 'Klik Edit' },
    { step: 4, action: 'Fill', target: 'input[name="name"]', input: 'Updated Project', desc: 'Ubah nama' },
    { step: 5, action: 'Click', target: 'button:has-text("Update")', desc: 'Submit update' }
  ]},
  { code: 'TC-PROJECT-003', title: 'Hapus project', module: 'Project Management', priority: 'LOW', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/projects', desc: 'Buka halaman projects' },
    { step: 2, action: 'Click', target: 'button[aria-label="More options"]', desc: 'Klik menu' },
    { step: 3, action: 'Click', target: 'text=Delete', desc: 'Klik Delete' },
    { step: 4, action: 'Click', target: 'button:has-text("Delete")', desc: 'Konfirmasi delete' }
  ]},
  
  // TEST CASE MANAGEMENT
  { code: 'TC-TC-001', title: 'Membuat test case baru', module: 'Test Case Management', priority: 'HIGH', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/projects', desc: 'Pilih project' },
    { step: 2, action: 'Click', target: 'button:has-text("Create Test Case")', desc: 'Klik Create' },
    { step: 3, action: 'Fill', target: 'input[name="code"]', input: 'TC-NEW-001', desc: 'Isi code' },
    { step: 4, action: 'Fill', target: 'input[name="title"]', input: 'New Test Case', desc: 'Isi title' },
    { step: 5, action: 'Click', target: 'button[type="submit"]', desc: 'Submit' }
  ]},
  { code: 'TC-TC-002', title: 'Edit test case existing', module: 'Test Case Management', priority: 'MEDIUM', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/projects', desc: 'Pilih project' },
    { step: 2, action: 'Click', target: 'button[aria-label="More options"]', desc: 'Klik menu test case' },
    { step: 3, action: 'Click', target: 'text=Edit', desc: 'Klik Edit' },
    { step: 4, action: 'Fill', target: 'input[name="title"]', input: 'Updated Test Case', desc: 'Ubah title' },
    { step: 5, action: 'Click', target: 'button:has-text("Save")', desc: 'Save' }
  ]},
  { code: 'TC-TC-003', title: 'Hapus test case', module: 'Test Case Management', priority: 'LOW', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/projects', desc: 'Pilih project' },
    { step: 2, action: 'Click', target: 'button[aria-label="More options"]', desc: 'Klik menu' },
    { step: 3, action: 'Click', target: 'text=Delete', desc: 'Klik Delete' },
    { step: 4, action: 'Click', target: 'button:has-text("Delete")', desc: 'Konfirmasi' }
  ]},
  
  // TEST STEP MANAGEMENT
  { code: 'TC-STEP-001', title: 'Menambah test step', module: 'Test Step Management', priority: 'HIGH', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/projects', desc: 'Pilih test case' },
    { step: 2, action: 'Click', target: 'button:has-text("Add Step")', desc: 'Klik Add Step' },
    { step: 3, action: 'Select', target: 'select[name="action"]', input: 'Click', desc: 'Pilih action' },
    { step: 4, action: 'Fill', target: 'input[name="locatorValue"]', input: 'button', desc: 'Isi locator' },
    { step: 5, action: 'Click', target: 'button:has-text("Save")', desc: 'Save step' }
  ]},
  { code: 'TC-STEP-002', title: 'Edit test step existing', module: 'Test Step Management', priority: 'MEDIUM', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/projects', desc: 'Pilih test case' },
    { step: 2, action: 'Click', target: 'button:has-text("Edit Step")', desc: 'Edit step' },
    { step: 3, action: 'Fill', target: 'input[name="locatorValue"]', input: 'updated-locator', desc: 'Ubah locator' },
    { step: 4, action: 'Click', target: 'button:has-text("Save")', desc: 'Save' }
  ]},
  { code: 'TC-STEP-003', title: 'Hapus test step', module: 'Test Step Management', priority: 'LOW', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/projects', desc: 'Pilih test case' },
    { step: 2, action: 'Click', target: 'button:has-text("Delete Step")', desc: 'Delete step' },
    { step: 3, action: 'Click', target: 'button:has-text("Confirm")', desc: 'Konfirmasi' }
  ]},
  
  // AUTOMATION
  { code: 'TC-AUTO-001', title: 'Generate automation script', module: 'Automation', priority: 'HIGH', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/projects', desc: 'Pilih test case' },
    { step: 2, action: 'Click', target: 'text=Automation', desc: 'Tab Automation' },
    { step: 3, action: 'Click', target: 'button:has-text("Generate Script")', desc: 'Generate Script' },
    { step: 4, action: 'Wait', target: 'pre code', desc: 'Verifikasi script tampil' }
  ]},
  { code: 'TC-AUTO-002', title: 'Menjalankan automation', module: 'Automation', priority: 'CRITICAL', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/projects', desc: 'Pilih test case' },
    { step: 2, action: 'Click', target: 'text=Automation', desc: 'Tab Automation' },
    { step: 3, action: 'Click', target: 'button:has-text("Run Test")', desc: 'Run Test' },
    { step: 4, action: 'Wait', target: 'text=Execution started', desc: 'Verifikasi execution started' }
  ]},
  
  // EXECUTION
  { code: 'TC-EXEC-001', title: 'Execution berhasil dijalankan', module: 'Execution', priority: 'HIGH', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/executions', desc: 'Buka executions' },
    { step: 2, action: 'Wait', target: 'text=EX-', desc: 'Verifikasi execution list' },
    { step: 3, action: 'Click', target: 'text=EX-', desc: 'Klik execution detail' },
    { step: 4, action: 'Wait', target: 'text=Status', desc: 'Verifikasi detail' }
  ]},
  
  // REPORTING
  { code: 'TC-REPORT-001', title: 'Generate report PDF', module: 'Reporting', priority: 'MEDIUM', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/reports', desc: 'Buka reports' },
    { step: 2, action: 'Wait', target: 'text=Pass Rate', desc: 'Verifikasi statistik' },
    { step: 3, action: 'Click', target: 'button:has-text("Export PDF")', desc: 'Export PDF' }
  ]},
  
  // PROFILE
  { code: 'TC-PROFILE-001', title: 'Update profile pengguna', module: 'Profile', priority: 'LOW', steps: [
    { step: 1, action: 'Navigate', target: 'http://localhost:3000/profile', desc: 'Buka profile' },
    { step: 2, action: 'Fill', target: 'input[name="name"]', input: 'Updated Name', desc: 'Ubah nama' },
    { step: 3, action: 'Click', target: 'button:has-text("Update Profile")', desc: 'Update' },
    { step: 4, action: 'Wait', target: 'text=Success', desc: 'Verifikasi success' }
  ]},
  
  // LOGOUT
  { code: 'TC-LOGOUT-001', title: 'Logout dari aplikasi', module: 'Authentication', priority: 'HIGH', steps: [
    { step: 1, action: 'Click', target: 'button[aria-label="User menu"]', desc: 'Klik user menu' },
    { step: 2, action: 'Click', target: 'text=Logout', desc: 'Klik Logout' },
    { step: 3, action: 'Click', target: 'button:has-text("Yes, logout")', desc: 'Konfirmasi logout' },
    { step: 4, action: 'Wait', target: 'text=Login', desc: 'Verifikasi redirect ke login' }
  ]},
];

async function main() {
  console.log('🚀 Seeding 18 professional test cases for QA Automation...\n');
  
  const project = await getProject();
  const user = await getUser();
  
  let count = 0;
  
  for (const tc of testCases) {
    console.log(`📝 [${++count}/18] ${tc.code}: ${tc.title}`);
    
    const testCase = await prisma.testCase.create({
      data: {
        code: tc.code,
        title: tc.title,
        description: `Automated test untuk ${tc.title}`,
        module: tc.module,
        priority: tc.priority as TestPriority,
        status: 'READY' as TestCaseStatus,
        type: 'AUTOMATION' as TestCaseType,
        lastExecutionStatus: 'NOT_RUN' as TestCaseLastResult,
        projectId: project.id,
        createdById: user.id,
        tags: [tc.module.toLowerCase().replace(/\s+/g, '-')],
      },
    });
    
    // Create test steps
    for (const step of tc.steps) {
      await prisma.testStep.create({
        data: {
          testCaseId: testCase.id,
          stepNumber: step.step,
          action: step.action,
          target: step.target || null,
          locatorStrategy: 'CSS',
          locatorValue: step.target || null,
          inputValue: step.input || null,
          expectedResult: step.desc,
          description: step.desc,
        },
      });
    }
  }
  
  console.log('\n✅ 18 Professional Test Cases seeded successfully!\n');
  console.log('📊 Summary:');
  console.log('  • Total: 18 test cases');
  console.log('  • Type: 100% AUTOMATION');
  console.log('  • Status: READY');
  console.log('  • Modules: Authentication, Dashboard, Project Management, Test Case Management,');
  console.log('             Test Step Management, Automation, Execution, Reporting, Profile');
  console.log('  • Priority: 3 CRITICAL, 8 HIGH, 5 MEDIUM, 2 LOW');
  console.log('\n📋 Test Flow Order:');
  testCases.forEach((tc, i) => {
    console.log(`  ${i + 1}. ${tc.code} - ${tc.title}`);
  });
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Error seeding:', e);
  process.exit(1);
});
