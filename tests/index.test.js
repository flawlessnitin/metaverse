function sum(a, b) {
  return a + b;
}

test('adds 1 + 2 to equal 3', () => {
  let answer = sum(1, 2);
  expect(answer).toBe(3);
});

test('adds 2 + 2 to equal 4', () => {
  let answer = sum(2, 2);
  expect(answer).not.toBe(2);
});
