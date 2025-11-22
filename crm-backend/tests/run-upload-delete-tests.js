const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE = process.env.API_BASE || 'http://localhost:4000';
const testsDir = path.join(__dirname, 'test-files');
if (!fs.existsSync(testsDir)) fs.mkdirSync(testsDir, { recursive: true });

// 1x1 PNG transparent
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
const pngPath = path.join(testsDir, 'sample.png');
fs.writeFileSync(pngPath, Buffer.from(pngBase64, 'base64'));

const txtPath = path.join(testsDir, 'sample.txt');
fs.writeFileSync(txtPath, 'This is a test file (invalid type)');

function run(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({ error, stdout: String(stdout || ''), stderr: String(stderr || '') });
    });
  });
}

(async () => {
  console.log(`Starting tests against ${BASE}`);

  // Upload valid PNG
  console.log('\n1) Uploading valid PNG...');
  const uploadCmd = `curl -s -w "\\n%{http_code}" -X POST "${BASE}/api/expenses/upload" -F "comprobante=@${pngPath}" -H "Accept: application/json"`;
  let r = await run(uploadCmd);
  if (r.error) {
    console.error('Error executing curl:', r.error);
    process.exit(1);
  }
  const parts = r.stdout.trim().split('\n');
  const status = parts.pop();
  const body = parts.join('\n');
  console.log('Status:', status);
  console.log('Response body:', body);
  if (!/^2/.test(status)) {
    console.error('Upload failed (expected 2xx). Aborting tests.');
    process.exit(1);
  }
  let payload;
  try { payload = JSON.parse(body); } catch (e) { console.error('Invalid JSON response'); process.exit(1); }
  const fileUrl = payload.url;
  console.log('Uploaded URL:', fileUrl);

  // Check file is accessible
  console.log('\n2) Checking uploaded file is accessible (expect 200)...');
  r = await run(`curl -I -s -o /dev/null -w "%{http_code}" "${BASE}${fileUrl}"`);
  console.log('HEAD status:', r.stdout.trim());

  // Create an expense referencing the uploaded file
  console.log('\n3) Creating Egreso referencing uploaded URL...');
  const egreso = {
    proveedor: 'Test Provider',
    categoria: 'TestCategory',
    descripcion: 'Upload test',
    tipoComprobante: 'SinComprobante',
    montoTotal: 1.0,
    tipoMoneda: 'Soles',
    fotoUrl: fileUrl
  };
  r = await run(`curl -s -w "\\n%{http_code}" -X POST "${BASE}/api/expenses" -H "Content-Type: application/json" -d '${JSON.stringify(egreso)}'`);
  const parts2 = r.stdout.trim().split('\n');
  const status2 = parts2.pop();
  const body2 = parts2.join('\n');
  console.log('Status:', status2);
  console.log('Body:', body2);
  if (!/^2/.test(status2)) { console.error('Create egreso failed'); process.exit(1); }
  let created;
  try { created = JSON.parse(body2); } catch (e) { console.error('Invalid JSON on create'); process.exit(1); }
  const egresoId = created.id;
  console.log('Created Egreso id:', egresoId);

  // Delete the egreso
  console.log('\n4) Deleting the Egreso and expecting file to be removed');
  r = await run(`curl -s -o /dev/null -w "%{http_code}" -X DELETE "${BASE}/api/expenses/${egresoId}"`);
  console.log('Delete status:', r.stdout.trim());

  // Check file is gone (expect 404)
  console.log('\n5) Checking uploaded file is no longer accessible (expect 404)...');
  r = await run(`curl -I -s -o /dev/null -w "%{http_code}" "${BASE}${fileUrl}"`);
  console.log('HEAD status after delete:', r.stdout.trim());

  // Negative test: upload invalid file (txt)
  console.log('\n6) Uploading invalid file (txt) expecting 400...');
  r = await run(`curl -s -w "\\n%{http_code}" -X POST "${BASE}/api/expenses/upload" -F "comprobante=@${txtPath}" -H "Accept: application/json"`);
  const parts3 = r.stdout.trim().split('\n');
  const status3 = parts3.pop();
  const body3 = parts3.join('\n');
  console.log('Status:', status3);
  console.log('Body:', body3);
  if (/^4/.test(status3)) {
    console.log('Invalid upload correctly rejected.');
  } else {
    console.error('Invalid upload was not rejected as expected.');
    process.exit(1);
  }

  console.log('\nAll tests completed.');
})();
