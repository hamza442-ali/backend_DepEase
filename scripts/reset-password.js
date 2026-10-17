require('dotenv').config();
const fs = require('node:fs');
const mongoose = require('mongoose');
const Student = require('../src/models/student.model');
const Teacher = require('../src/models/teacher.model');
const { loadConfig } = require('../src/config/environment');

async function main() {
  const type = process.argv[2];
  if (!['student', 'teacher'].includes(type)) throw new Error('Specify student or teacher');
  const config = loadConfig();
  const { email, password } = JSON.parse(fs.readFileSync(0, 'utf8'));
  if (typeof email !== 'string' || typeof password !== 'string') throw new Error('Invalid input');
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  try {
    const Model = type === 'teacher' ? Teacher : Student;
    const account = await Model.findOne({
      [type === 'teacher' ? 'email' : 'email_address']: email,
    });
    if (!account) throw new Error('Account not found');
    account[type === 'teacher' ? 'passoword' : 'password'] = password;
    await account.save();
    console.log('Password reset');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(() => {
  console.error('Password reset failed. Check input, account email, and configuration.');
  process.exitCode = 1;
});
