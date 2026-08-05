import { PrismaClient, TestPriority, TestCaseStatus, TestCaseType, TestCaseLastResult } from '@prisma/client';

const prisma = new PrismaClient();

async function getProject() {
  const project = await prisma.project.findFirst({ where: { deletedAt: null } });
  if (!project) throw new Error('No project found');
  return project;
}

async function getUser() {
  const user = await prisma.user.findFirst({ where: { deletedAt: null } });
  if (!user) throw new Error('No user found');
  return user;
}

// 18 Test Cases dengan format kode uniform TC-SIMANTIK-XXX
const testCases = [
  { code: 'TC-SIMANTIK-001', title: 'Login Berhasil', module: 'Authentication', priority: 'CRITICAL', steps: [
    { step: 1, target: 'http://localhost:3000/login', desc: 'Halaman login berhasil dimuat' },
    { step: 2, target: 'input[name="email"]', input: 'admin@simantik.id', desc: 'Email berhasil dimasukkan' },
    { step: 3, target: 'input[name="password"]', input: 'Admin123!', desc: 'Password berhasil dimasukkan' },
    { step: 4, target: 'button[type="submit"]', desc: 'Dashboard muncul setelah login' }
  ]},
  { code: 'TC-SIMANTIK-002', title: 'Login Gagal', module: 'Authentication', priority: 'HIGH', steps: [
    { step: 1, target: 'http://localhost:3000/login', desc: 'Halaman login dimuat' },
    { step: 2, target: 'input[name="email"]', input: 'admin@simantik.id', desc: 'Email diisi' },
    { step: 3, target: 'input[name="password"]', input: 'WrongPassword', desc: 'Password salah diisi' },
    { step: 4, target: 'button[type="submit"]', desc: 'Error message muncul' }
  ]},
  { code: 'TC-SIMANTIK-003', title: 'Dashboard Berhasil Ditampilkan', module: 'Dashboard', priority: 'HIGH', steps: [
    { step: 1, target: 'http://localhost:3000/dashboard', desc: 'Dashboard dimuat' },
    { step: 2, target: 'text=Projects', desc: 'Widget Projects tampil' },
    { step: 3, target: 'text=Test Cases', desc: 'Widget Test Cases tampil' },
    { step: 4, target: 'text=Pass Rate', desc: 'Pass Rate tampil' }
  ]},
  { code: 'TC-SIMANTIK-004', title: 'Membuat Project', module: 'Project Management', priority: 'HIGH', steps: [
    { step: 1, target: 'http://localhost:3000/projects', desc: 'Halaman projects dimuat' },
    { step: 2, target: 'button:has-text("Create Project")', desc: 'Klik Create Project' },
    { step: 3, target: 'input[name="name"]', input: 'Test Project', desc: 'Nama project diisi' },
    { step: 4, target: 'input[name="code"]', input: 'TEST-001', desc: 'Kode project diisi' },
    { step: 5, target: 'button[type="submit"]', desc: 'Project berhasil dibuat' }
  ]},
  { code: 'TC-SIMANTIK-005', title: 'Mengubah Project', module: 'Project Management', priority: 'MEDIUM', steps: [
    { step: 1, target: 'http://localhost:3000/projects', desc: 'Halaman projects dimuat' },
    { step: 2, target: 'button[aria-label="More options"]', desc: 'Klik menu' },
    { step: 3, target: 'text=Edit', desc: 'Klik Edit' },
    { step: 4, target: 'input[name="name"]', input: 'Updated Project', desc: 'Nama diubah' },
    { step: 5, target: 'button:has-text("Update")', desc: 'Project berhasil diupdate' }
  ]},
  { code: 'TC-SIMANTIK-006', title: 'Menghapus Project', module: 'Project Management', priority: 'LOW', steps: [
    { step: 1, target: 'http://localhost:3000/projects', desc: 'Halaman projects dimuat' },
    { step: 2, target: 'button[aria-label="More options"]', desc: 'Klik menu' },
    { step: 3, target: 'text=Delete', desc: 'Klik Delete' },
    { step: 4, target: 'button:has-text("Delete")', desc: 'Project berhasil dihapus' }
  ]},
  { code: 'TC-SIMANTIK-007', title: 'Membuat Test Case', module: 'Test Case Management', priority: 'HIGH', steps: [
    { step: 1, target: 'http://localhost:3000/projects', desc: 'Pilih project' },
    { step: 2, target: 'button:has-text("Create Test Case")', desc: 'Klik Create' },
    { step: 3, target: 'input[name="code"]', input: 'TC-NEW-001', desc: 'Code diisi' },
    { step: 4, target: 'input[name="title"]', input: 'New Test Case', desc: 'Title diisi' },
    { step: 5, target: 'button[type="submit"]', desc: 'Test case berhasil dibuat' }
  ]},
  { code: 'TC-SIMANTIK-008', title: 'Mengubah Test Case', module: 'Test Case Management', priority: 'MEDIUM', steps: [
    { step: 1, target: 'http://localhost:3000/projects', desc: 'Pilih project' },
    { step: 2, target: 'button[aria-label="More options"]', desc: 'Klik menu' },
    { step: 3, target: 'text=Edit', desc: 'Klik Edit' },
    { step: 4, target: 'input[name="title"]', input: 'Updated Test Case', desc: 'Title diubah' },
    { step: 5, target: 'button:has-text("Save")', desc: 'Test case berhasil diupdate' }
  ]},
  { code: 'TC-SIMANTIK-009', title: 'Menghapus Test Case', module: 'Test Case Management', priority: 'LOW', steps: [
    { step: 1, target: 'http://localhost:3000/projects', desc: 'Pilih project' },
    { step: 2, target: 'button[aria-label="More options"]', desc: 'Klik menu' },
    { step: 3, target: 'text=Delete', desc: 'Klik Delete' },
    { step: 4, target: 'button:has-text("Delete")', desc: 'Test case berhasil dihapus' }
  ]},
  { code: 'TC-SIMANTIK-010', title: 'Menambahkan Test Step', module: 'Test Step Management', priority: 'HIGH', steps: [
    { step: 1, target: 'http://localhost:3000/projects', desc: 'Pilih test case' },
    { step: 2, target: 'button:has-text("Add Step")', desc: 'Klik Add Step' },
    { step: 3, target: 'select[name="action"]', input: 'Click', desc: 'Action dipilih' },
    { step: 4, target: 'input[name="locatorValue"]', input: 'button', desc: 'Locator diisi' },
    { step: 5, target: 'button:has-text("Save")', desc: 'Step berhasil ditambahkan' }
  ]},
  { code: 'TC-SIMANTIK-011', title: 'Mengubah Test Step', module: 'Test Step Management', priority: 'MEDIUM', steps: [
    { step: 1, target: 'http://localhost:3000/projects', desc: 'Pilih test case' },
    { step: 2, target: 'button:has-text("Edit Step")', desc: 'Edit step' },
    { step: 3, target: 'input[name="locatorValue"]', input: 'updated-locator', desc: 'Locator diubah' },
    { step: 4, target: 'button:has-text("Save")', desc: 'Step berhasil diupdate' }
  ]},
  { code: 'TC-SIMANTIK-012', title: 'Menghapus Test Step', module: 'Test Step Management', priority: 'LOW', steps: [
    { step: 1, target: 'http://localhost:3000/projects', desc: 'Pilih test case' },
    { step: 2, target: 'button:has-text("Delete Step")', desc: 'Delete step' },
    { step: 3, target: 'button:has-text("Confirm")', desc: 'Step berhasil dihapus' }
  ]},
  { code: 'TC-SIMANTIK-013', title: 'Generate Automation Script', module: 'Automation', priority: 'HIGH', steps: [
    { step: 1, target: 'http://localhost:3000/projects', desc: 'Pilih test case' },
    { step: 2, target: 'text=Automation', desc: 'Tab Automation' },
    { step: 3, target: 'button:has-text("Generate Script")', desc: 'Generate Script' },
    { step: 4, target: 'pre code', desc: 'Script tampil' }
  ]},
  { code: 'TC-SIMANTIK-014', title: 'Menjalankan Automation', module: 'Automation', priority: 'CRITICAL', steps: [
    { step: 1, target: 'http://localhost:3000/projects', desc: 'Pilih test case' },
    { step: 2, target: 'text=Automation', desc: 'Tab Automation' },
    { step: 3, target: 'button:has-text("Run Test")', desc: 'Run Test' },
    { step: 4, target: 'text=Execution started', desc: 'Execution dimulai' }
  ]},
  { code: 'TC-SIMANTIK-015', title: 'Execution Berhasil', module: 'Execution', priority: 'HIGH', steps: [
    { step: 1, target: 'http://localhost:3000/executions', desc: 'Buka executions' },
    { step: 2, target: 'text=EX-', desc: 'Execution list tampil' },
    { step: 3, target: 'text=EX-', desc: 'Klik execution detail' },
    { step: 4, target: 'text=Status', desc: 'Detail tampil' }
  ]},
  { code: 'TC-SIMANTIK-016', title: 'Generate Report PDF', module: 'Reporting', priority: 'MEDIUM', steps: [
    { step: 1, target: 'http://localhost:3000/reports', desc: 'Buka reports' },
    { step: 2, target: 'text=Pass Rate', desc: 'Statistik tampil' },
    { step: 3, target: 'button:has-text("Export PDF")', desc: 'Export PDF' }
  ]},
  { code: 'TC-SIMANTIK-017', title: 'Mengubah Profil', module: 'Profile', priority: 'LOW', steps: [
    { step: 1, target: 'http://localhost:3000/profile', desc: 'Buka profile' },
    { step: 2, target: 'input[name="name"]', input: 'Updated Name', desc: 'Nama diubah' },
    { step: 3, target: 'button:has-text("Update Profile")', desc: 'Profile berhasil diupdate' }
  ]},
  { code: 'TC-SIMANTIK-018', title: 'Logout', module: 'Authentication', priority: 'HIGH', steps: [
    { step: 1, target: 'button[aria-label="User menu"]', desc: 'Klik user menu' },
    { step: 2, target: 'text=Logout', desc: 'Klik Logout' },
    { step: 3, target: 'button:has-text("Yes, logout")', desc: 'Logout berhasil' }
  ]},
];

async function main() {
  console.log('🚀 Updating Test Case codes to TC-SIMANTIK-XXX format...\n');
  
  const project = await getProject();
  const user = await getUser();
  
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const stepCount = tc.steps.length;
    
    console.log(`📝 [${i + 1}/18] ${tc.code}: ${tc.title}`);
    
    const testCase = await prisma.testCase.update({
      where: { code: tc.code.replace('TC-SIMANTIK', 'TC-LOGIN').replace(/-00/, '-') }, // Find old code
      data: {
        code: tc.code,
        title: tc.title,
        description: `Automated test untuk ${tc.title}`,
        module: tc.module,
        priority: tc.priority as TestPriority,
        status: 'READY' as TestCaseStatus,
        type: 'AUTOMATION' as TestCaseType,
        lastExecutionStatus: 'NOT_RUN' as TestCaseLastResult,
        tags: [tc.module.toLowerCase().replace(/\s+/g, '-')],
      },
    });
    
    // Update test steps
    await prisma.testStep.deleteMany({ where: { testCaseId: testCase.id } });
    
    for (const step of tc.steps) {
      await prisma.testStep.create({
        data: {
          testCaseId: testCase.id,
          stepNumber: step.step,
          action: 'Navigate', // Default action, will be mapped
          target: step.target || null,
          locatorStrategy: step.target && !step.target.includes('http') && !step.target.includes('text=') ? 'CSS' : null,
          locatorValue: step.target && !step.target.includes('http') && !step.target.includes('text=') ? step.target : null,
          inputValue: step.input || null,
          expectedResult: step.desc,
          description: step.desc,
        },
      });
    }
  }
  
  console.log('\n✅ All 18 Test Cases updated to TC-SIMANTIK-XXX format!\n');
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Error:', e);
  process.exit(1);
});
