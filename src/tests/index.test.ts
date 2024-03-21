import { describe, expect, test } from '@jest/globals'

test('adds 1 + 2 to equal 3', () => {
  expect(
    (() => {
      return 1 + 2
    })()
  ).toBe(3)
})
