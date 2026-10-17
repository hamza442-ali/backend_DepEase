require('dotenv').config();
const fs = require('node:fs');
const mongoose = require('mongoose');
const Student = require('../model/studentModel');
const Teacher = require('../model/teacherModel');
const { loadConfig } = require('../src/config');

async function main() {
  const type = process.argv[2];
  if (!['student', 'teacher'].includes(type)) throw new Error('Specify student or teacher');
  const config = loadConfig();
  const body = JSON.parse(fs.readFileSync(0, 'utf8'));
  if (type === 'teacher') {
    body.passoword = body.password;
    delete body.password;
  }
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  try {
    await (type === 'teacher' ? Teacher : Student).create(body);
    console.log('Account created');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(() => {
  console.error('Account creation failed. Check input, configuration, and duplicate email or registration number.');
  process.exitCode = 1;
});
