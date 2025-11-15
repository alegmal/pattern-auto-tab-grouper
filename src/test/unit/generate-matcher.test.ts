import { expect, it } from 'vitest'
import { generateMatcherRegex } from '@/util/matcher-regex'

it('handles no-wildcard domain pattern', () => {
  const regex = generateMatcherRegex('example.com')

  expect(regex.test('http://example.com/')).toBe(true)
  expect(regex.test('https://example.com/')).toBe(true)

  expect(regex.test('ftp://example.com/')).toBe(false)
  expect(regex.test('file:///example.com/')).toBe(false)
  expect(regex.test('https://www.example.com/')).toBe(false)
  expect(regex.test('http://invalid.com/')).toBe(false)
})

it('handles no-wildcard scheme + host', () => {
  const regex = generateMatcherRegex('https://example.com')

  expect(regex.test('https://example.com/')).toBe(true)

  expect(regex.test('http://example.com/')).toBe(false)
  expect(regex.test('ftp://example.com/')).toBe(false)
  expect(regex.test('ws://example.com/')).toBe(false)
  expect(regex.test('https://www.example.com/')).toBe(false)
  expect(regex.test('http://invalid.com/')).toBe(false)
})

it('handles no-wildcard scheme + host + root path', () => {
  const regex = generateMatcherRegex('https://example.com/')

  expect(regex.test('https://example.com/')).toBe(true)

  expect(regex.test('http://example.com/')).toBe(false)
  expect(regex.test('ftp://example.com/')).toBe(false)
  expect(regex.test('ws://example.com/')).toBe(false)
  expect(regex.test('https://www.example.com/')).toBe(false)
  expect(regex.test('http://invalid.com/')).toBe(false)
})

it('handles match-all pattern', () => {
  const regex = generateMatcherRegex('*')

  expect(regex.test('')).toBe(true)
  expect(regex.test('chrome://settings')).toBe(true)
  expect(regex.test('file:///')).toBe(true)
  expect(regex.test('data:text/plain;charset=utf8,')).toBe(true)

  expect(regex.test('http://example.com/')).toBe(true)
  expect(regex.test('https://example.com/')).toBe(true)
  expect(regex.test('https://example.com:8080/')).toBe(true)
  expect(regex.test('https://subdomain.example.com/')).toBe(true)
  expect(regex.test('https://example.com:8080/')).toBe(true)
  expect(regex.test('https://example.com/path')).toBe(true)
  expect(regex.test('ftp://example.com/')).toBe(true)
})

it('handles scheme wildcard', () => {
  const regex = generateMatcherRegex('*://example.com')

  expect(regex.test('http://example.com/')).toBe(true)
  expect(regex.test('https://example.com/')).toBe(true)
  expect(regex.test('https://example.com/with/path/')).toBe(true)

  expect(regex.test('ftp://example.com/')).toBe(false)
  expect(regex.test('http://invalid.com/')).toBe(false)
  expect(regex.test('https://invalid.com/')).toBe(false)
})

it('handles host wildcards', () => {
  it('subdomain wildcard', () => {
    const regex = generateMatcherRegex('*.example.com')

    expect(regex.test('http://example.com/')).toBe(true)
    expect(regex.test('https://example.com/')).toBe(true)
    expect(regex.test('https://example.com/with/path/')).toBe(true)

    expect(regex.test('ftp://example.com/')).toBe(false)
    expect(regex.test('http://invalid.com/')).toBe(false)
    expect(regex.test('https://invalid.com/')).toBe(false)
  })

  it('arbitrary host wildcard', () => {
    const regex = generateMatcherRegex('ex*.com')

    expect(regex.test('http://example.com/')).toBe(true)
    expect(regex.test('https://example.com/')).toBe(true)
    expect(regex.test('https://exodus.com/')).toBe(true)
    expect(regex.test('https://example.com/with/path/')).toBe(true)

    expect(regex.test('ftp://example.com/')).toBe(false)
    expect(regex.test('http://invalid.com/')).toBe(false)
    expect(regex.test('https://invalid.com/')).toBe(false)
  })
})

it('handles path wildcard', () => {
  const regex = generateMatcherRegex('example.com/foo/*')

  expect(regex.test('https://example.com/foo/')).toBe(true)
  expect(regex.test('https://example.com/foo/bar/baz')).toBe(true)

  expect(regex.test('http://example.com/bar/')).toBe(false)
  expect(regex.test('ftp://example.com/bar/')).toBe(false)
  expect(regex.test('http://invalid.com/foo/')).toBe(false)
  expect(regex.test('https://invalid.com/foo/')).toBe(false)
})

it('handles simple scheme', () => {
  const regex = generateMatcherRegex('file:///foo/*')

  expect(regex.test('file:///foo/')).toBe(true)
  expect(regex.test('file:///foo/bar.txt')).toBe(true)

  expect(regex.test('file:///bar/baz')).toBe(false)
  expect(regex.test('https://example.com/foo/')).toBe(false)
  expect(regex.test('https://example.com/foo/bar/baz')).toBe(false)
  expect(regex.test('http://example.com/bar/')).toBe(false)
  expect(regex.test('ftp://example.com/bar/')).toBe(false)
  expect(regex.test('http://invalid.com/foo/')).toBe(false)
  expect(regex.test('https://invalid.com/foo/')).toBe(false)
})

it('handles single mid-pattern wildcard', () => {
  const regex = generateMatcherRegex('example.*.com')

  expect(regex.test('https://example.foo.com/')).toBe(true)
  expect(regex.test('https://example.bar.com/')).toBe(true)
  expect(regex.test('http://example.anything.com/')).toBe(true)

  expect(regex.test('https://example.com/')).toBe(false)
  expect(regex.test('https://example.foo.bar.com/')).toBe(false)
  expect(regex.test('https://wrong.example.com/')).toBe(false)
})

it('handles AWS console pattern', () => {
  const regex = generateMatcherRegex('012345678909-*.us-east-1.console.aws.amazon.com')

  expect(regex.test('https://012345678909-askjfe.us-east-1.console.aws.amazon.com/')).toBe(true)
  expect(regex.test('https://012345678909-feine31s.us-east-1.console.aws.amazon.com/')).toBe(true)

  expect(regex.test('https://012345678909.us-east-1.console.aws.amazon.com/')).toBe(false)
  expect(regex.test('https://wrong-askjfe.us-east-1.console.aws.amazon.com/')).toBe(false)
})

it('handles multiple wildcards with exact level matching', () => {
  const regex = generateMatcherRegex('*.example.*.com')

  expect(regex.test('https://sub.example.foo.com/')).toBe(true)
  expect(regex.test('https://another.example.bar.com/')).toBe(true)

  expect(regex.test('https://example.foo.com/')).toBe(false)
  expect(regex.test('https://sub.example.com/')).toBe(false)
  expect(regex.test('https://sub.example.foo.bar.com/')).toBe(false)
})

it('handles pattern with two consecutive wildcards', () => {
  const regex = generateMatcherRegex('example.*.*.domain.com')

  // Should match exactly 2 levels between example and domain
  expect(regex.test('https://example.foo.bar.domain.com/')).toBe(true)
  expect(regex.test('https://example.lvl1.lvl2.domain.com/')).toBe(true)

  // Should NOT match different number of levels
  expect(regex.test('https://example.domain.com/')).toBe(false)
  expect(regex.test('https://example.foo.domain.com/')).toBe(false)
  expect(regex.test('https://example.a.b.c.domain.com/')).toBe(false)
})

it('maintains backward compatibility with leading wildcard', () => {
  const regex = generateMatcherRegex('*.example.com')

  expect(regex.test('https://example.com/')).toBe(true)
  expect(regex.test('https://www.example.com/')).toBe(true)
  expect(regex.test('https://subdomain.example.com/')).toBe(true)

  expect(regex.test('https://example.org/')).toBe(false)
  expect(regex.test('https://notexample.com/')).toBe(false)
})
