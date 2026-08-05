import { PrismaClient, TestCaseType, TestPriority, TestCaseStatus, Framework, Browser, LoginMethod, SessionStrategy, TestCaseLastResult } from '@prisma/client';

const prisma = new PrismaClient();

async function getExistingProjects() {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    take: 3,
  });
  if (projects.length === 0) {
    throw new Error('No projects found. Create projects first.');
  }
  return projects;
}

async function getUsers() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    take: 3,
  });
  if (users.length === 0) {
    throw new Error('No users found.');
  }
  return users;
}

// Data test case profesional dengan test steps lengkap
const professionalTestCases = [
  // ==================== MODUL AUTENTIKASI ====================
  {
    code: 'TC-LOGIN-001',
    title: 'Login berhasil dengan kredensial valid',
    description: 'Menguji proses login berhasil dengan email dan password yang benar',
    module: 'Autentikasi',
    priority: 'HIGH' as TestPriority,
    type: 'AUTOMATION' as TestCaseType,
    status: 'READY' as TestCaseStatus,
    steps: [
      {
        stepNumber: 1,
        action: 'Buka halaman login',
        target: 'window.location',
        locatorValue: 'http://localhost:3000/login',
        expectedResult: 'Halaman login berhasil dimuat',
        description: 'URL sesuai dengan endpoint login, Form login tampil dengan dua field, Tombol login aktif',
      },
      {
        stepNumber: 2,
        action: 'Masukkan email valid',
        target: 'input[name="email"]',
        locatorValue: 'admin@simantik.id',
        expectedResult: 'Email berhasil dimasukkan ke field',
        description: 'Value pada field sesuai dengan input, Tidak ada error validation, Kursor berpindah ke field password',
      },
      {
        stepNumber: 3,
        action: 'Masukkan password valid',
        target: 'input[name="password"]',
        locatorValue: 'Admin123!',
        expectedResult: 'Password berhasil dimasukkan',
        description: 'Input bertipe password (masked), Tidak ada error validation, Tombol login tetap aktif',
      },
      {
        stepNumber: 4,
        action: 'Klik tombol login',
        target: 'button[type="submit"]',
        locatorValue: '',
        expectedResult: 'Dashboard aplikasi tampil',
        description: 'URL berubah menjadi dashboard, Sidebar navigasi tampil, Avatar pengguna tampil, Tidak ada pesan error',
      }
    ]
  },
  {
    code: 'TC-LOGIN-002',
    title: 'Login gagal dengan password salah',
    description: 'Menguji sistem menampilkan error saat password salah',
    module: 'Autentikasi',
    priority: 'HIGH',
    type: 'AUTOMATION',
    status: 'READY',
    steps: [
      {
        stepNumber: 1,
        action: 'Buka halaman login',
        target: 'window.location',
        locatorValue: 'http://localhost:3000/login',
        expectedResult: 'Halaman login berhasil dimuat',
        description: 'Form login tampil, Field email dan password kosong',
      },
      {
        stepNumber: 2,
        action: 'Masukkan email valid',
        target: 'input[name="email"]',
        locatorValue: 'admin@simantik.id',
        expectedResult: 'Email berhasil dimasukkan',
        description: 'Value field sesuai input, Tidak ada error',
      },
      {
        stepNumber: 3,
        action: 'Masukkan password salah',
        target: 'input[name="password"]',
        locatorValue: 'PasswordSalah123',
        expectedResult: 'Password berhasil dimasukkan',
        description: 'Field password terisi, Tidak ada indikasi error sebelum submit',
      },
      {
        stepNumber: 4,
        action: 'Klik tombol login',
        target: 'button[type="submit"]',
        locatorValue: '',
        expectedResult: 'Error message tampil',
        description: 'Pesan error "Invalid credentials" tampil, Tombol login non-aktif, URL tetap di halaman login',
      }
    ]
  },
  {
    code: 'TC-AUTH-001',
    title: 'Logout dari sistem',
    description: 'Menguji proses logout mengembalikan pengguna ke halaman login',
    module: 'Autentikasi',
    priority: 'MEDIUM',
    type: 'AUTOMATION',
    status: 'READY',
    steps: [
      {
        stepNumber: 1,
        action: 'Login dengan kredensial valid',
        target: '',
        locatorValue: '',
        expectedResult: 'Login berhasil, dashboard tampil',
        description: 'Dashboard berhasil dimuat, User session aktif',
      },
      {
        stepNumber: 2,
        action: 'Klik menu dropdown profil',
        target: 'button[aria-label="User menu"]',
        locatorValue: '',
        expectedResult: 'Menu dropdown tampil',
        description: 'Menu dropdown muncul, Berisi opsi "Logout"',
      },
      {
        stepNumber: 3,
        action: 'Klik opsi "Logout"',
        target: 'text="Logout"',
        locatorValue: '',
        expectedResult: 'Konfirmasi logout tampil',
        description: 'Modal konfirmasi muncul, Tombol "Yes, logout" dan "Cancel" tampil',
      },
      {
        stepNumber: 4,
        action: 'Konfirmasi logout',
        target: 'button:has-text("Yes, logout")',
        locatorValue: '',
        expectedResult: 'Redirect ke halaman login',
        description: 'URL berubah ke /login, Session token dihapus, Tidak ada akses ke dashboard',
      }
    ]
  },
  
  // ==================== MODUL PROJECT MANAGEMENT ====================
  {
    code: 'TC-PROJECT-001',
    title: 'Membuat project baru',
    description: 'Menguji fungsi pembuatan project dengan data lengkap',
    module: 'Manajemen Project',
    priority: 'HIGH',
    type: 'MANUAL',
    status: 'READY',
    steps: [
      {
        stepNumber: 1,
        action: 'Buka halaman projects',
        target: 'a[href="/projects"]',
        locatorValue: '',
        expectedResult: 'Halaman project list tampil',
        description: 'Tabel project kosong/tampil, Tombol "Create Project" aktif',
      },
      {
        stepNumber: 2,
        action: 'Klik tombol "Create Project"',
        target: 'button:has-text("Create Project")',
        locatorValue: '',
        expectedResult: 'Modal create project tampil',
        description: 'Modal form tampil, Field required ada validation',
      },
      {
        stepNumber: 3,
        action: 'Isi nama project',
        target: 'input[name="name"]',
        locatorValue: 'KP Management',
        expectedResult: 'Nama project berhasil diisi',
        description: 'Value sesuai input, Error validation hilang',
      },
      {
        stepNumber: 4,
        action: 'Isi kode project',
        target: 'input[name="code"]',
        locatorValue: 'KP-MGT',
        expectedResult: 'Kode project berhasil diisi',
        description: 'Value sesuai input, Format valid, Tombol submit aktif',
      },
      {
        stepNumber: 5,
        action: 'Klik tombol "Create"',
        target: 'button[type="submit"]',
        locatorValue: '',
        expectedResult: 'Project berhasil dibuat',
        description: 'Modal tertutup, Toast success tampil, Project muncul di tabel',
      }
    ]
  },
  {
    code: 'TC-PROJECT-002',
    title: 'Edit project existing',
    description: 'Menguji update data project',
    module: 'Manajemen Project',
    priority: 'MEDIUM',
    type: 'MANUAL',
    status: 'READY',
    steps: [
      {
        stepNumber: 1,
        action: 'Klik menu tiga titik di baris project',
        target: 'button[aria-label="More options"]',
        locatorValue: '',
        expectedResult: 'Dropdown menu tampil',
        description: 'Menu tampil, Berisi opsi "Edit" dan "Delete"',
      },
      {
        stepNumber: 2,
        action: 'Klik opsi "Edit"',
        target: 'text="Edit"',
        locatorValue: '',
        expectedResult: 'Modal edit project tampil',
        description: 'Modal tampil dengan data existing, Field terisi dengan data lama',
      },
      {
        stepNumber: 3,
        action: 'Ubah nama project',
        target: 'input[name="name"]',
        locatorValue: 'KP Management Updated',
        expectedResult: 'Nama berhasil diubah',
        description: 'Value sesuai input baru, No validation error',
      },
      {
        stepNumber: 4,
        action: 'Klik tombol "Update"',
        target: 'button:has-text("Update")',
        locatorValue: '',
        expectedResult: 'Project berhasil diupdate',
        description: 'Modal tertutup, Toast success tampil, Data di tabel list terupdate',
      }
    ]
  },
  
  // ==================== MODUL TEST CASE MANAGEMENT ====================
  {
    code: 'TC-TC-001',
    title: 'Membuat test case baru',
    description: 'Menguji pembuatan test case dengan steps lengkap',
    module: 'Manajemen Test Case',
    priority: 'HIGH',
    type: 'MANUAL',
    status: 'READY',
    steps: [
      {
        stepNumber: 1,
        action: 'Buka halaman project detail',
        target: 'a[href^="/projects/"]',
        locatorValue: '',
        expectedResult: 'Halaman project detail tampil',
        description: 'Tab "Test Cases" aktif, Tombol "Create Test Case" ada',
      },
      {
        stepNumber: 2,
        action: 'Klik tombol "Create Test Case"',
        target: 'button:has-text("Create Test Case")',
        locatorValue: '',
        expectedResult: 'Modal create test case tampil',
        description: 'Form tampil dengan field wajib, Tab "Test Steps" tersedia',
      },
      {
        stepNumber: 3,
        action: 'Isi judul test case',
        target: 'input[name="title"]',
        locatorValue: 'Validasi form login',
        expectedResult: 'Judul berhasil diisi',
        description: 'Value sesuai input, Error validation hilang',
      },
      {
        stepNumber: 4,
        action: 'Pilih module',
        target: 'select[name="module"]',
        locatorValue: 'Autentikasi',
        expectedResult: 'Module terpilih',
        description: 'Value dropdown sesuai pilihan',
      },
      {
        stepNumber: 5,
        action: 'Klik tombol "Create"',
        target: 'button[type="submit"]',
        locatorValue: '',
        expectedResult: 'Test case berhasil dibuat',
        description: 'Modal tertutup, Toast success tampil, Test case muncul di tabel',
      }
    ]
  },
  {
    code: 'TC-TC-002',
    title: 'Menambahkan test step',
    description: 'Menguji penambahan step ke test case',
    module: 'Manajemen Test Case',
    priority: 'HIGH',
    type: 'MANUAL',
    status: 'READY',
    steps: [
      {
        stepNumber: 1,
        action: 'Buka detail test case',
        target: 'a[href^="/projects/"]',
        locatorValue: '',
        expectedResult: 'Detail test case tampil',
        description: 'Tab "Test Steps" tersedia, Tombol "Add Step" aktif',
      },
      {
        stepNumber: 2,
        action: 'Klik tombol "Add Step"',
        target: 'button:has-text("Add Step")',
        locatorValue: '',
        expectedResult: 'Modal add step tampil',
        description: 'Form step tampil, Field step number auto-increment',
      },
      {
        stepNumber: 3,
        action: 'Pilih action "Click"',
        target: 'select[name="action"]',
        locatorValue: 'Click',
        expectedResult: 'Action terpilih',
        description: 'Value sesuai, Field locator wajib tampil',
      },
      {
        stepNumber: 4,
        action: 'Isi locator',
        target: 'input[name="locatorValue"]',
        locatorValue: 'button[type="submit"]',
        expectedResult: 'Locator berhasil diisi',
        description: 'Value sesuai input, No validation error',
      },
      {
        stepNumber: 5,
        action: 'Isi expected result',
        target: 'textarea[name="expectedResult"]',
        locatorValue: 'Tombol submit berhasil diklik',
        expectedResult: 'Expected result berhasil diisi',
        description: 'Value sesuai input, Tombol "Save" aktif',
      },
      {
        stepNumber: 6,
        action: 'Klik tombol "Save"',
        target: 'button[type="submit"]',
        locatorValue: '',
        expectedResult: 'Step berhasil ditambahkan',
        description: 'Modal tertutup, Step muncul di list steps',
      }
    ]
  },
  
  // ==================== MODUL AUTOMATION ====================
  {
    code: 'TC-AUTO-001',
    title: 'Generate script dari test case',
    description: 'Menguji generate script Playwright dari test steps',
    module: 'Automation',
    priority: 'HIGH',
    type: 'AUTOMATION',
    status: 'READY',
    steps: [
      {
        stepNumber: 1,
        action: 'Buka detail test case automation',
        target: '',
        locatorValue: '',
        expectedResult: 'Tab "Automation" tampil',
        description: 'Tab aktif, Tombol "Generate Script" ada',
      },
      {
        stepNumber: 2,
        action: 'Klik tombol "Generate Script"',
        target: 'button:has-text("Generate Script")',
        locatorValue: '',
        expectedResult: 'Script berhasil digenerate',
        description: 'Loading spinner tampil, Script code tampil di panel',
      },
      {
        stepNumber: 3,
        action: 'Verifikasi syntax script',
        target: 'pre code',
        locatorValue: '',
        expectedResult: 'Script valid',
        description: 'Mengandung import Playwright, Ada step-step sesuai test case',
      }
    ]
  },
  {
    code: 'TC-AUTO-002',
    title: 'Jalankan automation test',
    description: 'Menguji eksekusi automation dengan Playwright',
    module: 'Automation',
    priority: 'HIGH',
    type: 'AUTOMATION',
    status: 'READY',
    steps: [
      {
        stepNumber: 1,
        action: 'Klik tombol "Run Test"',
        target: 'button:has-text("Run Test")',
        locatorValue: '',
        expectedResult: 'Execution dimulai',
        description: 'Toast success "Execution started", Status test case "RUNNING"',
      },
      {
        stepNumber: 2,
        action: 'Monitor execution status',
        target: '',
        locatorValue: '',
        expectedResult: 'Execution berjalan',
        description: 'Status berubah dari RUNNING ke PASSED/FAILED',
      },
      {
        stepNumber: 3,
        action: 'Verifikasi hasil',
        target: '',
        locatorValue: '',
        expectedResult: 'Execution selesai',
        description: 'Status final (PASSED/FAILED), Screenshot tersimpan',
      }
    ]
  },
  
  // ==================== MODUL REPORTING ====================
  {
    code: 'TC-REPORT-001',
    title: 'Generate report project',
    description: 'Menguji generate report statistik project',
    module: 'Reporting',
    priority: 'MEDIUM',
    type: 'MANUAL',
    status: 'READY',
    steps: [
      {
        stepNumber: 1,
        action: 'Buka halaman reports',
        target: 'a[href^="/projects/"]',
        locatorValue: '',
        expectedResult: 'Halaman report tampil',
        description: 'Statistik project ada, Chart execution trend tampil',
      },
      {
        stepNumber: 2,
        action: 'Verifikasi statistik',
        target: '',
        locatorValue: '',
        expectedResult: 'Data statistik valid',
        description: 'Total test cases sesuai, Total executions sesuai',
      },
      {
        stepNumber: 3,
        action: 'Klik tombol export',
        target: 'button:has-text("Export PDF")',
        locatorValue: '',
        expectedResult: 'PDF download dimulai',
        description: 'File PDF terdownload, Format PDF valid',
      }
    ]
  },
  
  // ==================== MODUL DASHBOARD ====================
  {
    code: 'TC-DASH-001',
    title: 'Dashboard menampilkan data terbaru',
    description: 'Menguji dashboard menampilkan data real-time',
    module: 'Dashboard',
    priority: 'HIGH',
    type: 'MANUAL',
    status: 'READY',
    steps: [
      {
        stepNumber: 1,
        action: 'Buka halaman dashboard',
        target: 'a[href="/dashboard"]',
        locatorValue: '',
        expectedResult: 'Dashboard berhasil dimuat',
        description: 'Widget statistik tampil, Chart trend tampil',
      },
      {
        stepNumber: 2,
        action: 'Verifikasi pass rate',
        target: '',
        locatorValue: '',
        expectedResult: 'Pass rate sesuai dengan data',
        description: 'Nilai pass rate antara 0-100, Perhitungan benar',
      },
      {
        stepNumber: 3,
        action: 'Verifikasi recent activity',
        target: '',
        locatorValue: '',
        expectedResult: 'Recent activity menampilkan execution terbaru',
        description: 'List berisi 5-10 executions terbaru, Status badge sesuai',
      }
    ]
  },
  
  // ==================== MODUL PROFILE ====================
  {
    code: 'TC-PROFILE-001',
    title: 'Edit profil pengguna',
    description: 'Menguji update data profil',
    module: 'Profile',
    priority: 'MEDIUM',
    type: 'MANUAL',
    status: 'READY',
    steps: [
      {
        stepNumber: 1,
        action: 'Buka halaman profil',
        target: 'a[href="/profile"]',
        locatorValue: '',
        expectedResult: 'Halaman profil tampil',
        description: 'Form edit profil tampil, Data existing terisi',
      },
      {
        stepNumber: 2,
        action: 'Ubah nama',
        target: 'input[name="name"]',
        locatorValue: 'Administrator SIMANTIK',
        expectedResult: 'Nama berhasil diubah',
        description: 'Value sesuai input baru, Validation error tidak ada',
      },
      {
        stepNumber: 3,
        action: 'Klik tombol update',
        target: 'button[type="submit"]',
        locatorValue: '',
        expectedResult: 'Profil berhasil diupdate',
        description: 'Toast success tampil, Data di header/navbar terupdate',
      }
    ]
  }
];

async function main() {
  console.log('🚀 Seeding professional test cases...\n');
  
  const projects = await getExistingProjects();
  const users = await getUsers();
  
  const createdTestCases = [];
  
  for (const tcData of professionalTestCases) {
    console.log(`📝 Creating ${tcData.code}: ${tcData.title}`);
    
    const project = projects[Math.floor(Math.random() * projects.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    
    // Create test case
    const testCase = await prisma.testCase.create({
      data: {
        code: tcData.code,
        title: tcData.title,
        description: tcData.description,
        module: tcData.module,
        priority: tcData.priority as TestPriority,
        status: tcData.status as TestCaseStatus,
        type: tcData.type as TestCaseType,
        lastExecutionStatus: 'NOT_RUN' as TestCaseLastResult,
        projectId: project.id,
        createdById: user.id,
        tags: [tcData.module.replace(/\s+/g, '-').toLowerCase()],
      },
    });
    
    // Create test steps
    for (const stepData of tcData.steps) {
      await prisma.testStep.create({
        data: {
          testCaseId: testCase.id,
          stepNumber: stepData.stepNumber,
          action: stepData.action,
          target: stepData.target || null,
          locatorStrategy: 'CSS',
          locatorValue: stepData.locatorValue || null,
          inputValue: stepData.locatorValue || null,
          expectedResult: stepData.expectedResult,
          description: stepData.description,
        },
      });
    }
    
    createdTestCases.push({
      code: tcData.code,
      id: testCase.id,
      steps: tcData.steps.length,
    });
  }
  
  console.log('\n✅ Professional test cases seeded successfully!\n');
  console.log(`📊 Summary:`);
  console.log(`• Total test cases: ${createdTestCases.length}`);
  console.log(`• Modules: Autentikasi, Manajemen Project, Manajemen Test Case, Automation, Reporting, Dashboard, Profile`);
  console.log(`• Languages: Semua berbahasa Indonesia`);
  console.log(`• Steps: 3-6 langkah per test case\n`);
  
  console.log('🎯 Sample test cases created:');
  createdTestCases.slice(0, 5).forEach(tc => {
    console.log(`  • ${tc.code} (${tc.steps} steps)`);
  });
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Error seeding:', e);
  process.exit(1);
});
