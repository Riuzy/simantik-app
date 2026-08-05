
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api', timeout: 60000 });

async function main() {
  const login = await api.post('/auth/login', { email: 'tester@simantik.local', password: 'Password123!' });
  const token = login.data.data.accessToken;
  api.defaults.headers.Authorization = `Bearer ${token}`;
  console.log('login ok');

  const ai = await api.get('/ai/settings');
  console.log('AI settings:', JSON.stringify(ai.data.data));

  const save = await api.put('/ai/settings', { provider: 'RULE_ENGINE', enabled: false });
  console.log('AI saved:', JSON.stringify(save.data.data));

  const testConn = await api.post('/ai/test-connection', { provider: 'RULE_ENGINE' });
  console.log('Test connection:', JSON.stringify(testConn.data.data));

  const tcs = await api.get('/test-cases', { params: { page: 1, limit: 5 } });
  const list = tcs.data.data;
  console.log('test cases count:', list.length);
  const first = list.find((tc) => tc.type === 'AUTOMATION');
  console.log('first automation tc:', first.code, first.id);

  const gen = await api.post(`/test-cases/${first.id}/generate-script`, { method: 'TEMPLATE' });
  console.log('generate result keys:', Object.keys(gen.data.data).join(','));
  console.log('generatorType:', gen.data.data.generatorType, 'provider:', gen.data.data.provider);
  console.log('script length:', gen.data.data.script.length);

  const script = await api.get(`/test-cases/${first.id}/script`);
  console.log('stored script provider:', script.data.data.provider, 'length:', script.data.data.script.length);

  console.log('ALL CHECKS PASSED');
}

main().catch((e) => {
  console.error('FAILED:', e.response?.data?.message || e.message);
  process.exit(1);
});
