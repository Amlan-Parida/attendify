// Math Engine Verification Test
// This script runs some quick checks on the attendance prediction logic.

function computeNeeded(attended, conducted, P) {
  if (P >= 100) return -1;
  if (conducted === 0) return 0;
  const current = (attended / conducted) * 100;
  if (current >= P) return 0;
  const numerator = P * conducted - 100 * attended;
  const denominator = 100 - P;
  return Math.max(0, Math.ceil(numerator / denominator));
}

function computeCanMiss(attended, conducted, P) {
  if (conducted === 0) return 0;
  const current = (attended / conducted) * 100;
  if (current < P) return 0;
  return Math.max(0, Math.floor((100 * attended - P * conducted) / P));
}

console.log('--- Attendify Math Engine Tests ---\n');

const testCases = [
  { a: 0, c: 0, p: 75, expectedNeeded: 0, expectedMiss: 0, desc: 'No data' },
  { a: 5, c: 10, p: 75, expectedNeeded: 10, expectedMiss: 0, desc: '50%, need to reach 75%' },
  { a: 7, c: 10, p: 75, expectedNeeded: 2, expectedMiss: 0, desc: '70%, need to reach 75%' },
  { a: 8, c: 10, p: 75, expectedNeeded: 0, expectedMiss: 0, desc: '80%, safe, can miss 0' },
  { a: 9, c: 10, p: 75, expectedNeeded: 0, expectedMiss: 2, desc: '90%, safe, can miss 2' },
  { a: 10, c: 10, p: 75, expectedNeeded: 0, expectedMiss: 3, desc: '100%, safe, can miss 3' },
  { a: 9, c: 10, p: 100, expectedNeeded: -1, expectedMiss: 0, desc: '90%, impossible to reach 100%' },
];

let allPassed = true;

testCases.forEach((tc, idx) => {
  const needed = computeNeeded(tc.a, tc.c, tc.p);
  const miss = computeCanMiss(tc.a, tc.c, tc.p);

  const passedNeeded = needed === tc.expectedNeeded;
  const passedMiss = miss === tc.expectedMiss;
  const passed = passedNeeded && passedMiss;

  if (!passed) allPassed = false;

  console.log(`Test ${idx + 1}: ${tc.desc}`);
  console.log(`  Inputs: Attended=${tc.a}, Conducted=${tc.c}, Target=${tc.p}%`);
  console.log(`  Expected: Needed=${tc.expectedNeeded}, CanMiss=${tc.expectedMiss}`);
  console.log(`  Actual  : Needed=${needed}, CanMiss=${miss}`);
  console.log(`  Result  : ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
});

if (allPassed) {
  console.log('All math engine tests passed successfully! 🎉');
} else {
  console.log('Some math engine tests failed. 🚨');
  process.exit(1);
}
