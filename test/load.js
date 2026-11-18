/* Shared by the tests: loads the data files and core.js the way the page does (plain
   scripts, shared globals), and a tiny pass/fail reporter. No dependencies. */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SCRIPTS = ['i18n.js', 'recipes.js', 'plan.js', 'household.js', 'shopping.js', 'core.js'];
const GLOBALS = ['I18N', 'I18N_WORDS', 'UNITS', 'SLOTS', 'RECIPES', 'ROTATION_START', 'DAY_KCAL', 'COOK_DOUBLE', 'TOPUPS', 'PREP_DAYS', 'BATCHES', 'BATCH_OF',
  'PEOPLE', 'AISLE_ORDER', 'STORES', 'PRODUCTS', 'PANTRY', 'BUY', 'MESA'];

function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }

function load() {
  const src = SCRIPTS.map(f => read('assets/' + f)).join('\n');
  return new Function(src + '\nreturn {' + GLOBALS.join(',') + '};')();
}

function reporter() {
  const fails = [];
  return {
    check(name, cond, detail) {
      if (!cond) fails.push(name);
      console.log((cond ? 'PASS ' : 'FAIL ') + name + (!cond && detail ? ' — ' + detail : ''));
    },
    done() {
      console.log('\n' + (fails.length ? fails.length + ' FAILED: ' + fails.join(', ') : 'ALL PASS'));
      process.exit(fails.length ? 1 : 0);
    }
  };
}

module.exports = { root, read, load, reporter, SCRIPTS, GLOBALS };
