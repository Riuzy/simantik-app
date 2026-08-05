import { PrismaClient, TestCaseType, TestPriority, TestCaseStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface StepDef {
  step: number;
  action: string;
  target?: string;
  locatorStrategy?: string;
  locatorValue?: string;
  inputValue?: string;
  expectedResult: string;
  desc: string;
}

const titleUpdates: Record<string, string> = {
  'TC-SIMANTIK-016': 'Melihat laporan project',
  'TC-SIMANTIK-017': 'Melihat detail profil pengguna',
};

const testCases: Array<{ code: string; steps: StepDef[] }> = [
  // ── AUTHENTICATION ─────────────────────────────────────────────────────────
  {
    code: 'TC-SIMANTIK-001',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/login', expectedResult: 'Halaman login berhasil dimuat.', desc: 'Buka halaman login' },
      { step: 2, action: 'TYPE', locatorStrategy: 'LABEL', locatorValue: 'Email', inputValue: 'tester@simantik.local', expectedResult: 'Field email terisi dengan kredensial valid.', desc: 'Isi email' },
      { step: 3, action: 'TYPE', locatorStrategy: 'LABEL', locatorValue: 'Password', inputValue: 'Password123!', expectedResult: 'Field password terisi.', desc: 'Isi password' },
      { step: 4, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Sign in', expectedResult: 'Tombol Sign in berhasil diklik.', desc: 'Klik tombol Sign in' },
      { step: 5, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Dashboard', inputValue: 'Dashboard', expectedResult: 'Dashboard muncul setelah login berhasil.', desc: 'Verifikasi dashboard tampil' },
    ],
  },
  {
    code: 'TC-SIMANTIK-002',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/login', expectedResult: 'Halaman login berhasil dimuat.', desc: 'Buka halaman login' },
      { step: 2, action: 'TYPE', locatorStrategy: 'LABEL', locatorValue: 'Email', inputValue: 'tester@simantik.local', expectedResult: 'Field email terisi.', desc: 'Isi email' },
      { step: 3, action: 'TYPE', locatorStrategy: 'LABEL', locatorValue: 'Password', inputValue: 'WrongPassword123', expectedResult: 'Field password terisi dengan password yang salah.', desc: 'Isi password salah' },
      { step: 4, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Sign in', expectedResult: 'Tombol Sign in berhasil diklik.', desc: 'Klik tombol Sign in' },
      { step: 5, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Invalid email or password', inputValue: 'Invalid email or password', expectedResult: 'Pesan error kredensial tidak valid ditampilkan.', desc: 'Verifikasi pesan error login' },
    ],
  },

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  {
    code: 'TC-SIMANTIK-003',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/dashboard', expectedResult: 'Halaman dashboard dimuat setelah autentikasi.', desc: 'Buka halaman dashboard' },
      { step: 2, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Pass Rate', inputValue: 'Pass Rate', expectedResult: 'Statistik Pass Rate tampil.', desc: 'Verifikasi statistik Pass Rate' },
      { step: 3, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Automation Coverage', inputValue: 'Automation Coverage', expectedResult: 'Statistik Automation Coverage tampil.', desc: 'Verifikasi statistik Automation Coverage' },
      { step: 4, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Recent Activity', inputValue: 'Recent Activity', expectedResult: 'Bagian Recent Activity tampil.', desc: 'Verifikasi Recent Activity' },
    ],
  },

  // ── PROJECT MANAGEMENT ─────────────────────────────────────────────────────
  {
    code: 'TC-SIMANTIK-004',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects', expectedResult: 'Halaman daftar project dimuat.', desc: 'Buka halaman daftar project' },
      { step: 2, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'link:New Project', expectedResult: 'Navigasi ke halaman create project.', desc: 'Klik tombol New Project' },
      { step: 3, action: 'TYPE', locatorStrategy: 'LABEL', locatorValue: 'Project Name', inputValue: 'QA Temp Project', expectedResult: 'Nama project terisi.', desc: 'Isi nama project' },
      { step: 4, action: 'TYPE', locatorStrategy: 'LABEL', locatorValue: 'Slug', inputValue: 'qa-temp', expectedResult: 'Slug project terisi.', desc: 'Isi slug project' },
      { step: 5, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Create Project', expectedResult: 'Form pembuatan project dikirim.', desc: 'Klik tombol Create Project' },
      { step: 6, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'QA Temp Project', inputValue: 'QA Temp Project', expectedResult: 'Project baru muncul pada daftar project.', desc: 'Verifikasi project baru muncul' },
    ],
  },
  {
    code: 'TC-SIMANTIK-005',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects/qa-temp/edit', expectedResult: 'Halaman edit project dimuat.', desc: 'Buka halaman edit project' },
      { step: 2, action: 'TYPE', locatorStrategy: 'LABEL', locatorValue: 'Environment', inputValue: 'Staging', expectedResult: 'Field environment diubah menjadi Staging.', desc: 'Ubah environment project' },
      { step: 3, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Save Changes', expectedResult: 'Perubahan project berhasil disimpan.', desc: 'Simpan perubahan project' },
      { step: 4, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Staging', inputValue: 'Staging', expectedResult: 'Environment Staging tampil pada kartu project.', desc: 'Verifikasi environment baru' },
    ],
  },
  {
    code: 'TC-SIMANTIK-006',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects', expectedResult: 'Halaman daftar project dimuat.', desc: 'Buka halaman daftar project' },
      { step: 2, action: 'CLICK', locatorStrategy: 'ARIA_LABEL', locatorValue: 'Project menu for QA Temp Project', expectedResult: 'Menu konteks project QA Temp terbuka.', desc: 'Buka menu project QA Temp' },
      { step: 3, action: 'CLICK', locatorStrategy: 'TEXT', locatorValue: 'Delete Project', expectedResult: 'Dialog konfirmasi hapus project terbuka.', desc: 'Pilih menu Delete Project' },
      { step: 4, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Delete', expectedResult: 'Project QA Temp berhasil dihapus.', desc: 'Konfirmasi penghapusan project' },
      { step: 5, action: 'VERIFY_HIDDEN', locatorStrategy: 'TEXT', locatorValue: 'QA Temp Project', inputValue: 'QA Temp Project', expectedResult: 'Project QA Temp tidak lagi tampil pada daftar.', desc: 'Verifikasi project terhapus' },
    ],
  },

  // ── TEST CASE MANAGEMENT ───────────────────────────────────────────────────
  {
    code: 'TC-SIMANTIK-007',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects/simantik/test-cases', expectedResult: 'Halaman daftar test case dimuat.', desc: 'Buka daftar test case' },
      { step: 2, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:New Test Case', expectedResult: 'Modal pembuatan test case terbuka.', desc: 'Klik tombol New Test Case' },
      { step: 3, action: 'TYPE', locatorStrategy: 'LABEL', locatorValue: 'Code', inputValue: 'TC-NEW-001', expectedResult: 'Kode test case terisi.', desc: 'Isi kode test case' },
      { step: 4, action: 'TYPE', locatorStrategy: 'LABEL', locatorValue: 'Title', inputValue: 'New Test Case', expectedResult: 'Judul test case terisi.', desc: 'Isi judul test case' },
      { step: 5, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Create', expectedResult: 'Form pembuatan test case dikirim.', desc: 'Klik tombol Create' },
      { step: 6, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'TC-NEW-001', inputValue: 'TC-NEW-001', expectedResult: 'Halaman detail test case baru ditampilkan.', desc: 'Verifikasi test case baru dibuat' },
    ],
  },
  {
    code: 'TC-SIMANTIK-008',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects/simantik/test-cases', expectedResult: 'Halaman daftar test case dimuat.', desc: 'Buka daftar test case' },
      { step: 2, action: 'CLICK', locatorStrategy: 'ARIA_LABEL', locatorValue: 'Actions for TC-NEW-001', expectedResult: 'Menu baris TC-NEW-001 terbuka.', desc: 'Buka menu baris TC-NEW-001' },
      { step: 3, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'menuitem:Edit', expectedResult: 'Modal edit test case terbuka.', desc: 'Pilih menu Edit' },
      { step: 4, action: 'TYPE', locatorStrategy: 'LABEL', locatorValue: 'Title', inputValue: 'New Test Case Updated', expectedResult: 'Judul test case diubah.', desc: 'Ubah judul test case' },
      { step: 5, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Save', expectedResult: 'Perubahan test case berhasil disimpan.', desc: 'Simpan perubahan test case' },
      { step: 6, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'New Test Case Updated', inputValue: 'New Test Case Updated', expectedResult: 'Judul baru tampil pada daftar test case.', desc: 'Verifikasi judul baru' },
    ],
  },
  {
    code: 'TC-SIMANTIK-009',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects/simantik/test-cases', expectedResult: 'Halaman daftar test case dimuat.', desc: 'Buka daftar test case' },
      { step: 2, action: 'CLICK', locatorStrategy: 'ARIA_LABEL', locatorValue: 'Actions for TC-NEW-001', expectedResult: 'Menu baris TC-NEW-001 terbuka.', desc: 'Buka menu baris TC-NEW-001' },
      { step: 3, action: 'CLICK', locatorStrategy: 'TEXT', locatorValue: 'Delete', expectedResult: 'Dialog konfirmasi hapus test case terbuka.', desc: 'Pilih menu Delete' },
      { step: 4, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Delete', expectedResult: 'Test case berhasil dihapus.', desc: 'Konfirmasi penghapusan test case' },
      { step: 5, action: 'VERIFY_HIDDEN', locatorStrategy: 'TEXT', locatorValue: 'TC-NEW-001', inputValue: 'TC-NEW-001', expectedResult: 'Test case tidak lagi tampil pada daftar.', desc: 'Verifikasi test case terhapus' },
    ],
  },

  // ── TEST STEP MANAGEMENT ───────────────────────────────────────────────────
  {
    code: 'TC-SIMANTIK-010',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects/simantik/test-cases/TC-STEPS-001', expectedResult: 'Halaman detail test case sandbox dimuat.', desc: 'Buka detail test case sandbox' },
      { step: 2, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'tab:Test Steps', expectedResult: 'Tab Test Steps aktif.', desc: 'Buka tab Test Steps' },
      { step: 3, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Add Step', expectedResult: 'Modal penambahan step terbuka.', desc: 'Klik tombol Add Step' },
      { step: 4, action: 'CLICK', locatorStrategy: 'LABEL', locatorValue: 'Action', expectedResult: 'Dropdown Action terbuka.', desc: 'Buka dropdown Action' },
      { step: 5, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'option:Click', expectedResult: 'Action Click terpilih.', desc: 'Pilih action Click' },
      { step: 6, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Add locator', expectedResult: 'Baris locator baru ditambahkan.', desc: 'Tambahkan baris locator' },
      { step: 7, action: 'TYPE', locatorStrategy: 'ARIA_LABEL', locatorValue: 'Locator value for row 1', inputValue: 'button#save', expectedResult: 'Nilai locator step terisi.', desc: 'Isi nilai locator' },
      { step: 8, action: 'TYPE', locatorStrategy: 'LABEL', locatorValue: 'Expected Result', inputValue: 'Tombol save tersedia dan dapat diklik', expectedResult: 'Expected result step terisi.', desc: 'Isi expected result' },
      { step: 9, action: 'CLICK', locatorStrategy: 'CSS', locatorValue: 'button[type="submit"]', expectedResult: 'Step baru berhasil disimpan.', desc: 'Simpan step baru' },
      { step: 10, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Steps (2)', inputValue: 'Steps (2)', expectedResult: 'Jumlah step pada tab menjadi 2.', desc: 'Verifikasi jumlah step' },
    ],
  },
  {
    code: 'TC-SIMANTIK-011',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects/simantik/test-cases/TC-STEPS-001', expectedResult: 'Halaman detail test case sandbox dimuat.', desc: 'Buka detail test case sandbox' },
      { step: 2, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'tab:Test Steps', expectedResult: 'Tab Test Steps aktif.', desc: 'Buka tab Test Steps' },
      { step: 3, action: 'CLICK', locatorStrategy: 'ARIA_LABEL', locatorValue: 'Edit step 1', expectedResult: 'Modal edit step 1 terbuka.', desc: 'Edit step 1' },
      { step: 4, action: 'TYPE', locatorStrategy: 'ARIA_LABEL', locatorValue: 'Locator value for row 1', inputValue: 'button#primary', expectedResult: 'Nilai locator step 1 diubah.', desc: 'Ubah nilai locator' },
      { step: 5, action: 'CLICK', locatorStrategy: 'CSS', locatorValue: 'button[type="submit"]', expectedResult: 'Perubahan step berhasil disimpan.', desc: 'Simpan perubahan step' },
      { step: 6, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'button#primary', inputValue: 'button#primary', expectedResult: 'Nilai locator baru tampil pada step 1.', desc: 'Verifikasi locator baru' },
    ],
  },
  {
    code: 'TC-SIMANTIK-012',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects/simantik/test-cases/TC-STEPS-001', expectedResult: 'Halaman detail test case sandbox dimuat.', desc: 'Buka detail test case sandbox' },
      { step: 2, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'tab:Test Steps', expectedResult: 'Tab Test Steps aktif.', desc: 'Buka tab Test Steps' },
      { step: 3, action: 'CLICK', locatorStrategy: 'ARIA_LABEL', locatorValue: 'Delete step 2', expectedResult: 'Dialog konfirmasi hapus step 2 terbuka.', desc: 'Hapus step 2' },
      { step: 4, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Delete', expectedResult: 'Step 2 berhasil dihapus.', desc: 'Konfirmasi penghapusan step' },
      { step: 5, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Steps (1)', inputValue: 'Steps (1)', expectedResult: 'Jumlah step kembali menjadi 1.', desc: 'Verifikasi jumlah step' },
      { step: 6, action: 'VERIFY_HIDDEN', locatorStrategy: 'TEXT', locatorValue: 'button#save', inputValue: 'button#save', expectedResult: 'Step dengan locator button#save tidak tampil.', desc: 'Verifikasi step terhapus' },
    ],
  },

  // ── AUTOMATION ─────────────────────────────────────────────────────────────
  {
    code: 'TC-SIMANTIK-013',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects/simantik/test-cases/TC-SIMANTIK-001', expectedResult: 'Halaman detail test case dimuat.', desc: 'Buka detail test case' },
      { step: 2, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'tab:Automation', expectedResult: 'Tab Automation aktif.', desc: 'Buka tab Automation' },
      { step: 3, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Generate Script', expectedResult: 'Modal generate script terbuka.', desc: 'Klik Generate Script' },
      { step: 4, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Generate', expectedResult: 'Script Playwright berhasil di-generate.', desc: 'Klik Generate' },
      { step: 5, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Generated Script', inputValue: 'Generated Script', expectedResult: 'Script hasil generate tampil pada panel.', desc: 'Verifikasi script tampil' },
    ],
  },
  {
    code: 'TC-SIMANTIK-014',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects/simantik/test-cases/TC-SIMANTIK-001', expectedResult: 'Halaman detail test case dimuat.', desc: 'Buka detail test case' },
      { step: 2, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'tab:Automation', expectedResult: 'Tab Automation aktif.', desc: 'Buka tab Automation' },
      { step: 3, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'button:Run Test', expectedResult: 'Eksekusi automation dimulai.', desc: 'Klik Run Test' },
      { step: 4, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Execution Details', inputValue: 'Execution Details', expectedResult: 'Halaman detail execution terbuka.', desc: 'Verifikasi halaman execution' },
    ],
  },

  // ── EXECUTION ──────────────────────────────────────────────────────────────
  {
    code: 'TC-SIMANTIK-015',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects/simantik/executions', expectedResult: 'Halaman daftar execution dimuat.', desc: 'Buka halaman execution' },
      { step: 2, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'EX-', inputValue: 'EX-', expectedResult: 'Daftar execution menampilkan nomor eksekusi.', desc: 'Verifikasi daftar execution' },
      { step: 3, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Status', inputValue: 'Status', expectedResult: 'Kolom Status pada tabel execution tampil.', desc: 'Verifikasi kolom Status' },
    ],
  },

  // ── REPORTING ──────────────────────────────────────────────────────────────
  {
    code: 'TC-SIMANTIK-016',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/projects/simantik/reports', expectedResult: 'Halaman laporan project dimuat.', desc: 'Buka halaman laporan' },
      { step: 2, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Pass Rate', inputValue: 'Pass Rate', expectedResult: 'Statistik Pass Rate pada laporan tampil.', desc: 'Verifikasi Pass Rate' },
      { step: 3, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Quality Snapshot', inputValue: 'Quality Snapshot', expectedResult: 'Bagian Quality Snapshot tampil.', desc: 'Verifikasi Quality Snapshot' },
    ],
  },

  // ── PROFILE ────────────────────────────────────────────────────────────────
  {
    code: 'TC-SIMANTIK-017',
    steps: [
      { step: 1, action: 'NAVIGATE', target: '/profile', expectedResult: 'Halaman profil dimuat.', desc: 'Buka halaman profil' },
      { step: 2, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Profile', inputValue: 'Profile', expectedResult: 'Judul halaman profil tampil.', desc: 'Verifikasi judul halaman' },
      { step: 3, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Tester', inputValue: 'Tester', expectedResult: 'Nama pengguna tampil pada profil.', desc: 'Verifikasi nama pengguna' },
      { step: 4, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Change Password', inputValue: 'Change Password', expectedResult: 'Form Change Password tampil.', desc: 'Verifikasi form Change Password' },
    ],
  },

  // ── LOGOUT ─────────────────────────────────────────────────────────────────
  {
    code: 'TC-SIMANTIK-018',
    steps: [
      { step: 1, action: 'CLICK', locatorStrategy: 'ARIA_LABEL', locatorValue: 'User menu', expectedResult: 'Menu pengguna terbuka.', desc: 'Buka menu pengguna' },
      { step: 2, action: 'CLICK', locatorStrategy: 'ROLE', locatorValue: 'menuitem:Logout', expectedResult: 'Sesi pengguna berakhir.', desc: 'Klik tombol Logout' },
      { step: 3, action: 'VERIFY_TEXT', locatorStrategy: 'TEXT', locatorValue: 'Sign in', inputValue: 'Sign in', expectedResult: 'Redirect ke halaman login dan tombol Sign in tampil.', desc: 'Verifikasi kembali ke halaman login' },
    ],
  },
];

const sandboxSteps: StepDef[] = [
  { step: 1, action: 'CLICK', locatorStrategy: 'LABEL', locatorValue: 'button', expectedResult: 'Tombol dapat diklik.', desc: 'Klik tombol sandbox' },
];

async function replaceSteps(testCaseId: string, steps: StepDef[]) {
  await prisma.testStep.deleteMany({ where: { testCaseId } });
  await prisma.testStep.createMany({
    data: steps.map((s) => ({
      testCaseId,
      stepNumber: s.step,
      action: s.action,
      target: s.target ?? null,
      locatorStrategy: s.locatorStrategy ?? null,
      locatorValue: s.locatorValue ?? null,
      inputValue: s.inputValue ?? null,
      expectedResult: s.expectedResult,
      description: s.desc,
    })),
  });
}

async function getProject() {
  const project = await prisma.project.findFirst({
    where: { deletedAt: null, slug: 'simantik' },
  });
  if (!project) throw new Error('Project "simantik" not found. Create the project first.');
  return project;
}

async function main() {
  // Clean junk / leftovers so the suite is re-runnable from a clean state.
  await prisma.testCase.deleteMany({ where: { code: { in: ['TC-NEW-001', 'TC-NEW-002'] } } });
  await prisma.project.deleteMany({ where: { slug: { in: ['qa-temp', 'qa-temp-2'] } } });
  await prisma.project.deleteMany({ where: { code: 'PROJ-0NaN' } });

  const project = await getProject();

  let count = 0;
  for (const tc of testCases) {
    const found = await prisma.testCase.findUnique({ where: { code: tc.code } });
    if (!found) {
      console.log(`SKIP ${tc.code}: not found`);
      continue;
    }
    if (titleUpdates[tc.code]) {
      await prisma.testCase.update({ where: { code: tc.code }, data: { title: titleUpdates[tc.code] } });
    }
    await replaceSteps(found.id, tc.steps);
    console.log(`✔ ${tc.code}: ${tc.steps.length} steps`);
    count++;
  }

  // Sandbox test case used by TC-010/011/012. Not part of the automation suite.
  const createdBy = await prisma.user.findFirst({ where: { deletedAt: null, isActive: true } });
  if (!createdBy) throw new Error('No active user found.');
  const sandbox = await prisma.testCase.upsert({
    where: { code: 'TC-STEPS-001' },
    create: {
      code: 'TC-STEPS-001',
      title: 'Sandbox Test Steps',
      description: 'Test case sandbox khusus untuk uji kelola test step (bukan bagian dari suite otomasi).',
      module: 'Test Step Management',
      priority: 'MEDIUM' as TestPriority,
      status: 'READY' as TestCaseStatus,
      type: 'MANUAL' as TestCaseType,
      lastExecutionStatus: 'NOT_RUN',
      projectId: project.id,
      createdById: createdBy.id,
    },
    update: { type: 'MANUAL' as TestCaseType, module: 'Test Step Management' },
  });
  await replaceSteps(sandbox.id, sandboxSteps);
  console.log(`✔ TC-STEPS-001 (sandbox): ${sandboxSteps.length} step`);

  console.log(`\n✅ Updated ${count} automation test cases.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
