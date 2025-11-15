import { expect, it } from 'vitest'

import { matcherPattern } from '@/util/helpers'

it('validates match patterns', () => {
  const regex = new RegExp(matcherPattern)

  expect(regex.test('*')).toBe(true)
  expect(regex.test('*.example.com')).toBe(true)
  expect(regex.test('*.example.com:8080')).toBe(true)
  expect(regex.test('*.example.com:8080/')).toBe(true)
  expect(regex.test('example.com')).toBe(true)
  expect(regex.test('example.com:8080')).toBe(true)
  expect(regex.test('example.com:8080/')).toBe(true)
  expect(regex.test('example.com/path')).toBe(true)
  expect(regex.test('example.com/path/to/file')).toBe(true)
  expect(regex.test('example.com/path/to/file?query=value')).toBe(true)
  expect(regex.test('example.com/*')).toBe(true)
  expect(regex.test('http://example.com')).toBe(true)
  expect(regex.test('https://example.com')).toBe(true)
  expect(regex.test('*://example.com')).toBe(true)
  expect(regex.test('ftp://example.com')).toBe(true)
  expect(regex.test('file://*')).toBe(true)
  expect(regex.test('[::1]')).toBe(true)
  expect(regex.test('chrome-extension://*')).toBe(true)
  expect(regex.test('user:password@host')).toBe(true)

  expect(regex.test('*://')).toBe(false)
  expect(regex.test(':')).toBe(false)
  expect(regex.test('/')).toBe(false)
  expect(regex.test('example.com:*')).toBe(false)
  expect(regex.test('http://example.com:invalid-port')).toBe(false)
  expect(regex.test('example.com:invalid-port')).toBe(false)
})

it('validates mid-pattern wildcard patterns', () => {
  const regex = new RegExp(matcherPattern)

  // Basic mid-pattern wildcards
  expect(regex.test('example.*.com')).toBe(true)
  expect(regex.test('*.example.*.com')).toBe(true)
  expect(regex.test('012345678909-*.us-east-1.console.aws.amazon.com')).toBe(true)
  expect(regex.test('foo.*.bar.*.baz.com')).toBe(true)

  // Multiple consecutive wildcards
  expect(regex.test('example.*.*.domain.com')).toBe(true)
  expect(regex.test('*.*.*.example.com')).toBe(true)

  // With schemes and paths
  expect(regex.test('https://example.*.com/*')).toBe(true)
  expect(regex.test('*://example.*.com/path/*')).toBe(true)

  // With ports
  expect(regex.test('example.*.com:8080')).toBe(true)
  expect(regex.test('example.*.com:8080/path')).toBe(true)
})
