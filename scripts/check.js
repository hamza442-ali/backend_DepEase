const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const directories = [
  'src',
  'controller',
  'controllers',
  'model',
  'models',
  'routes',
  'scripts',
  'tests',
];
const files = ['index.js'];
function collect(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(target);
    else if (entry.name.endsWith('.js')) files.push(target);
  }
}
directories.forEach(collect);
let errors = 0;
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  try {
    new vm.Script(source, { filename: file });
    for (const match of source.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)) {
      const target = path.resolve(path.dirname(file), match[1]);
      const candidates = [target, target + '.js', path.join(target, 'index.js')];
      const existing = candidates.find(
        (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
      );
      if (!existing) throw new Error(`Missing local module ${match[1]}`);
      const actualName = fs
        .readdirSync(path.dirname(existing))
        .find((name) => name.toLowerCase() === path.basename(existing).toLowerCase());
      if (actualName !== path.basename(existing))
        throw new Error(`Module filename has incorrect casing: ${match[1]}`);
    }
  } catch (error) {
    console.error(`${file}: ${error.message}`);
    errors++;
  }
}
if (errors) process.exitCode = 1;
else console.log(`Checked syntax and local imports in ${files.length} JavaScript files`);
