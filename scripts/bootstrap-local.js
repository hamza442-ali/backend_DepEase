const mongoose = require('mongoose');
const Teacher = require('../src/models/teacher.model');
const { loadConfig } = require('../src/config/environment');

async function bootstrap() {
  if (process.env.LOCAL_BOOTSTRAP !== 'true')
    throw new Error('This command is only for the explicitly configured local stack');
  const config = loadConfig();
  const email = process.env.DEPEASE_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.DEPEASE_ADMIN_PASSWORD;
  if (!email || !config.adminEmails.includes(email) || !password || password.length < 16)
    throw new Error('Configure a local administrator email and generated password');
  await mongoose.connect(config.mongoUri);
  await Teacher.init();
  if (!(await Teacher.exists({ email })))
    await Teacher.create({
      name: 'DepEase Administrator',
      employeeId: 'DEPEASE-LOCAL-ADMIN',
      email,
      mobile: 'Not provided',
      Designation: 'Administrator',
      passoword: password,
    });
  console.log('Local administrator is ready. Account details are in the ignored .local directory.');
}
bootstrap()
  .catch(() => {
    console.error(
      'Local administrator setup failed. Check local configuration and database availability.',
    );
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
