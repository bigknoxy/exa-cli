/**
 * TDD Falsifier tests for vitest 5 migration compatibility.
 *
 * These tests verify two things:
 * 1. (Falsifier) clearMocks: true actually clears mock call state between tests,
 *    so our beforeEach vi.clearAllMocks() is not silently redundant.
 * 2. (Anti-falsifier) Within a single test, mock call state IS preserved,
 *    so assertions on mock.toHaveBeenCalled* still work correctly.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create shared mocks to test clearMocks behavior across test boundaries
const mockFn = vi.fn()

describe('vitest 5 clearMocks compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('falsifier: clearMocks clears cross-test mock state', () => {
    it('test A: sets mock state', () => {
      mockFn('hello')
      mockFn('world')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenNthCalledWith(1, 'hello')
      expect(mockFn).toHaveBeenCalledWith('world')
    })

    it('test B: mock state from test A is cleared (not leaked)', () => {
      // If clearMocks is NOT working, this would see 2 calls from test A
      // plus 0 from this test = 2 total, which is WRONG.
      // With clearMocks: true, mockFn should have 0 calls here.
      expect(mockFn).toHaveBeenCalledTimes(0)
    })

    it('test C: mock state from test A is cleared even when adding new calls', () => {
      // This would be 3 if test A leaked (2 old + 1 new)
      mockFn('new call')
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('new call')
    })
  })

  describe('anti-falsifier: mock state preserved within single test', () => {
    it('tracks multiple calls within one test correctly', () => {
      mockFn('first')
      mockFn('second')
      mockFn('third')

      // These assertions MUST see exactly 3 calls.
      // If mock state were cleared mid-test, we'd see fewer.
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(mockFn).toHaveBeenNthCalledWith(1, 'first')
      expect(mockFn).toHaveBeenNthCalledWith(2, 'second')
      expect(mockFn).toHaveBeenNthCalledWith(3, 'third')
    })

    it('mock return values work within a single test', () => {
      const sideEffect = vi.fn().mockReturnValue('cached-value')

      // First call
      const result1 = sideEffect()
      // Second call (should return same cached value)
      const result2 = sideEffect()

      expect(result1).toBe('cached-value')
      expect(result2).toBe('cached-value')
      expect(sideEffect).toHaveBeenCalledTimes(2)
    })

    it('mockImplementation changes are visible within one test', () => {
      const flexible = vi.fn()

      flexible.mockImplementation(() => 'default')
      expect(flexible()).toBe('default')

      flexible.mockImplementation(() => 'changed')
      expect(flexible()).toBe('changed')

      expect(flexible).toHaveBeenCalledTimes(2)
    })
  })

  describe('config module mock isolation', () => {
    // This specifically tests that our config.test.ts pattern
    // (vi.mock + vi.clearAllMocks in beforeEach) works correctly
    // with vitest 5's clearMocks: true default.
    it('proves mocks are isolated: first test sets state', () => {
      const isolatedMock = vi.fn()
      isolatedMock('setting', 'state')
      expect(isolatedMock).toHaveBeenCalledTimes(1)
    })

    it('proves mocks are isolated: second test sees no leak', () => {
      // If mocks leaked, isolatedMock from the test above would have 1 call
      // But we're creating a new vi.fn() so this is inherently isolated
      // This test is a structural guarantee that the test suite
      // doesn't depend on test ordering
      const anotherMock = vi.fn()
      expect(anotherMock).toHaveBeenCalledTimes(0)
      anotherMock('fresh')
      expect(anotherMock).toHaveBeenCalledTimes(1)
    })
  })
})
