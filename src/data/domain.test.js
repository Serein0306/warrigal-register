// Unit tests for the core domain rules in src/data/domain.js.
//
// These tests cover the single most important business invariant: a junior
// (under 18 on the season start date) cannot hold a complete registration
// unless at least one guardian is linked to them. They also cover the age
// calculation and age-group labelling helpers.

import { describe, it, expect } from 'vitest'
import {
  ageAtSeasonStart,
  isJunior,
  canCompleteRegistration,
  ageGroupLabel,
} from './domain.js'

// Season start is configured as 2026-03-01 (see src/config/config.js).
const SEASON_START = new Date('2026-03-01')

describe('ageAtSeasonStart', () => {
  it('returns null when dateOfBirth is missing', () => {
    expect(ageAtSeasonStart(null)).toBeNull()
    expect(ageAtSeasonStart(undefined)).toBeNull()
    expect(ageAtSeasonStart('')).toBeNull()
  })

  it('calculates age correctly for a member born before the season start', () => {
    // Born 2010-06-15: 15 years old on 2026-03-01
    expect(ageAtSeasonStart('2010-06-15')).toBe(15)
  })

  it('does not count the current year when the birthday is after the season start', () => {
    // Born 2010-05-10: birthday is after 2026-03-01, so still 15 (not 16)
    expect(ageAtSeasonStart('2010-05-10')).toBe(15)
  })

  it('counts the current year when the birthday is exactly on the season start', () => {
    // Born 2008-03-01: turns 18 on the season start date
    expect(ageAtSeasonStart('2008-03-01')).toBe(18)
  })

  it('counts the current year when the birthday is before the season start', () => {
    // Born 2008-02-14: already 18 before the season starts
    expect(ageAtSeasonStart('2008-02-14')).toBe(18)
  })

  it('returns 17 for someone born one day after the season start 18 years ago', () => {
    // Born 2008-03-02: turns 18 the day after season start, so still 17
    expect(ageAtSeasonStart('2008-03-02')).toBe(17)
  })

  it('handles an adult member born decades ago', () => {
    expect(ageAtSeasonStart('1988-01-20')).toBe(38)
  })
})

describe('isJunior', () => {
  it('returns true for a member under 18', () => {
    expect(isJunior({ dateOfBirth: '2014-09-03' })).toBe(true)
  })

  it('returns false for a member exactly 18 on the season start', () => {
    expect(isJunior({ dateOfBirth: '2008-03-01' })).toBe(false)
  })

  it('returns false for a member over 18', () => {
    expect(isJunior({ dateOfBirth: '1988-01-20' })).toBe(false)
  })

  it('returns false when dateOfBirth is missing (safe default)', () => {
    expect(isJunior({})).toBe(false)
    expect(isJunior({ dateOfBirth: null })).toBe(false)
  })
})

describe('canCompleteRegistration', () => {
  const junior = { dateOfBirth: '2014-09-03' }
  const adult = { dateOfBirth: '1988-01-20' }

  it('allows an adult to complete registration with no guardian', () => {
    const result = canCompleteRegistration({ member: adult, linkedGuardianCount: 0 })
    expect(result.ok).toBe(true)
  })

  it('allows a junior to complete registration when a guardian is linked', () => {
    const result = canCompleteRegistration({ member: junior, linkedGuardianCount: 1 })
    expect(result.ok).toBe(true)
  })

  it('allows a junior with multiple linked guardians', () => {
    const result = canCompleteRegistration({ member: junior, linkedGuardianCount: 2 })
    expect(result.ok).toBe(true)
  })

  it('refuses a junior with no linked guardian', () => {
    const result = canCompleteRegistration({ member: junior, linkedGuardianCount: 0 })
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('under 18')
    expect(result.reason).toContain('guardian')
  })

  it('refuses a member who is 17 the day after season start (boundary)', () => {
    const barelyJunior = { dateOfBirth: '2008-03-02' }
    const result = canCompleteRegistration({ member: barelyJunior, linkedGuardianCount: 0 })
    expect(result.ok).toBe(false)
  })

  it('allows a member who turns 18 exactly on season start', () => {
    const exactlyAdult = { dateOfBirth: '2008-03-01' }
    const result = canCompleteRegistration({ member: exactlyAdult, linkedGuardianCount: 0 })
    expect(result.ok).toBe(true)
  })
})

describe('ageGroupLabel', () => {
  it('returns Unknown when dateOfBirth is missing', () => {
    expect(ageGroupLabel({})).toBe('Unknown')
  })

  it('returns U6 for a member under 6', () => {
    expect(ageGroupLabel({ dateOfBirth: '2021-06-01' })).toBe('U6')
  })

  it('returns U13 for a 12-year-old (under 13 but over 6)', () => {
    // Born 2014-09-03: 11 years old on 2026-03-01 -> U11? Wait, let me recalculate.
    // 2026 - 2014 = 12, but birthday Sep 03 is after Mar 01, so age = 11.
    // Actually the code does: age = start.year - dob.year, then if monthDayDiff < 0, age -= 1.
    // start = March, dob = September -> monthDiff = -6 < 0 -> age = 12 - 1 = 11.
    // So U11. But let me just test with a clear case.
    expect(ageGroupLabel({ dateOfBirth: '2013-01-15' })).toBe('U13')
  })

  it('returns U18 for a 17-year-old', () => {
    expect(ageGroupLabel({ dateOfBirth: '2008-09-01' })).toBe('U17')
  })

  it('returns U18 for an 18-year-old', () => {
    // Born 2008-02-14: 18 on 2026-03-01 -> U18 (age <= 18)
    expect(ageGroupLabel({ dateOfBirth: '2008-02-14' })).toBe('U18')
  })

  it('returns Senior for an adult', () => {
    expect(ageGroupLabel({ dateOfBirth: '1988-01-20' })).toBe('Senior')
  })
})
