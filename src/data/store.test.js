// Integration tests for the data access layer in src/data/store.js.
//
// These tests exercise the store against a real (jsdom) localStorage so that
// the persistence round-trip is verified. Each test starts from the seed
// dataset because the store seeds automatically when localStorage is empty.
//
// The most important tests verify the invariants enforced by the data layer:
//   1. A junior registration cannot be completed without a linked guardian.
//   2. A player cannot be placed in a team without a complete registration.
//   3. Withdrawing a registration removes that player from all teams.

import { describe, it, expect } from 'vitest'
import {
  getMembers,
  findMembers,
  getMember,
  addMember,
  updateMember,
  setMemberActive,
  getGuardians,
  addGuardian,
  getGuardianIdsForMember,
  getMemberIdsForGuardian,
  linkGuardianToMember,
  unlinkGuardianFromMember,
  getRegistrations,
  addRegistration,
  completeRegistration,
  withdrawRegistration,
  getTeams,
  addTeam,
  addPlayerToTeam,
  movePlayerToTeam,
  removePlayerFromTeam,
  getRoster,
  getMemberRegistrationHistory,
} from './store.js'

// Helper: find a seed member by name.
function memberNamed(name) {
  return getMembers().find((m) => m.name === name)
}

describe('members', () => {
  it('returns the seven seed members', () => {
    expect(getMembers()).toHaveLength(7)
  })

  it('finds members by name (case-insensitive, partial match)', () => {
    expect(findMembers('kelleher')).toHaveLength(2) // Mia and Rory
    expect(findMembers('MIA')).toHaveLength(1)
    expect(findMembers('nonexistent')).toHaveLength(0)
  })

  it('returns all members when query is empty', () => {
    expect(findMembers('')).toHaveLength(7)
    expect(findMembers('   ')).toHaveLength(7)
  })

  it('retrieves a single member by id', () => {
    const mia = memberNamed('Mia Kelleher')
    expect(getMember(mia.id).name).toBe('Mia Kelleher')
  })

  it('returns null for a non-existent member id', () => {
    expect(getMember('does-not-exist')).toBeNull()
  })

  it('adds a new member and persists it', () => {
    const before = getMembers().length
    const member = addMember({
      name: '  Test Player  ',
      dateOfBirth: '2015-04-10',
      gender: 'M',
    })
    expect(member.name).toBe('Test Player') // trimmed
    expect(member.active).toBe(true)
    expect(getMembers()).toHaveLength(before + 1)
    expect(getMember(member.id)).not.toBeNull()
  })

  it('updates an existing member', () => {
    const sam = memberNamed('Sam Whitfield')
    const updated = updateMember(sam.id, { name: 'Sam Whitfield Jr', phone: '0499 000 000' })
    expect(updated.name).toBe('Sam Whitfield Jr')
    expect(updated.phone).toBe('0499 000 000')
    expect(getMember(sam.id).phone).toBe('0499 000 000')
  })

  it('deactivates and reactivates a member', () => {
    const sam = memberNamed('Sam Whitfield')
    setMemberActive(sam.id, false)
    expect(getMember(sam.id).active).toBe(false)
    setMemberActive(sam.id, true)
    expect(getMember(sam.id).active).toBe(true)
  })
})

describe('guardians and links', () => {
  it('returns the three seed guardians', () => {
    expect(getGuardians()).toHaveLength(3)
  })

  it('adds a guardian', () => {
    const before = getGuardians().length
    const g = addGuardian({ name: 'New Guardian', relationship: 'Aunt', phone: '0400111222' })
    expect(g.name).toBe('New Guardian')
    expect(getGuardians()).toHaveLength(before + 1)
  })

  it('returns guardian ids linked to a junior member', () => {
    const mia = memberNamed('Mia Kelleher')
    const ids = getGuardianIdsForMember(mia.id)
    expect(ids).toHaveLength(1)
    const guardian = getGuardians().find((g) => g.id === ids[0])
    expect(guardian.name).toBe('Dani Kelleher')
  })

  it('returns empty array for a member with no guardian', () => {
    const frankie = memberNamed('Frankie Delahunty')
    expect(getGuardianIdsForMember(frankie.id)).toHaveLength(0)
  })

  it('links and unlinks a guardian to a member', () => {
    const frankie = memberNamed('Frankie Delahunty')
    const dani = getGuardians().find((g) => g.name === 'Dani Kelleher')

    linkGuardianToMember(frankie.id, dani.id)
    expect(getGuardianIdsForMember(frankie.id)).toContain(dani.id)

    // Linking again is idempotent (no duplicate)
    linkGuardianToMember(frankie.id, dani.id)
    expect(getGuardianIdsForMember(frankie.id)).toHaveLength(1)

    unlinkGuardianFromMember(frankie.id, dani.id)
    expect(getGuardianIdsForMember(frankie.id)).toHaveLength(0)
  })

  it('one guardian can be linked to multiple juniors', () => {
    const dani = getGuardians().find((g) => g.name === 'Dani Kelleher')
    const juniors = getMemberIdsForGuardian(dani.id)
    expect(juniors).toHaveLength(2) // Mia and Rory
  })
})

describe('registrations', () => {
  it('returns all seed registrations', () => {
    expect(getRegistrations()).toHaveLength(7)
  })

  it('filters registrations by status', () => {
    expect(getRegistrations({ status: 'complete' })).toHaveLength(6)
    expect(getRegistrations({ status: 'started' })).toHaveLength(1)
  })

  it('filters registrations by member id', () => {
    const mia = memberNamed('Mia Kelleher')
    expect(getRegistrations({ memberId: mia.id })).toHaveLength(1)
  })

  it('adds a registration in started status', () => {
    const sam = memberNamed('Sam Whitfield')
    const reg = addRegistration({ memberId: sam.id, season: '2025', ageGroup: 'Senior' })
    expect(reg.status).toBe('started')
    expect(getRegistrations()).toHaveLength(8)
  })

  it('throws when adding a duplicate active registration for the same season', () => {
    const mia = memberNamed('Mia Kelleher')
    expect(() => addRegistration({ memberId: mia.id, season: '2026' })).toThrow(
      'already has a registration',
    )
  })

  it('throws when adding a registration for a non-existent member', () => {
    expect(() => addRegistration({ memberId: 'nope', season: '2026' })).toThrow(
      'Member not found',
    )
  })

  it('completes an adult registration without a guardian', () => {
    const sam = memberNamed('Sam Whitfield')
    const reg = getRegistrations({ memberId: sam.id })[0]
    const result = completeRegistration(reg.id)
    expect(result.ok).toBe(true)
  })

  it('refuses to complete a junior registration with no guardian', () => {
    // Frankie Delahunty is a junior with no linked guardian in the seed data.
    const frankie = memberNamed('Frankie Delahunty')
    const reg = getRegistrations({ memberId: frankie.id })[0]
    expect(reg.status).toBe('started')

    const result = completeRegistration(reg.id)
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('under 18')
    // Registration remains started
    expect(getRegistrations({ memberId: frankie.id })[0].status).toBe('started')
  })

  it('completes a junior registration after a guardian is linked', () => {
    const frankie = memberNamed('Frankie Delahunty')
    const dani = getGuardians().find((g) => g.name === 'Dani Kelleher')
    linkGuardianToMember(frankie.id, dani.id)

    const reg = getRegistrations({ memberId: frankie.id })[0]
    const result = completeRegistration(reg.id)
    expect(result.ok).toBe(true)
    expect(getRegistrations({ memberId: frankie.id })[0].status).toBe('complete')
  })

  it('withdrawing a registration removes team placements for that season', () => {
    const mia = memberNamed('Mia Kelleher')
    const team = getTeams()[0] // U13G Navy
    // Mia is in the seed placements for U13G Navy
    const roster = getRoster(team.id)
    expect(roster.rows.some((r) => r.member.id === mia.id)).toBe(true)

    const reg = getRegistrations({ memberId: mia.id, season: '2026' })[0]
    withdrawRegistration(reg.id)

    const after = getRoster(team.id)
    expect(after.rows.some((r) => r.member.id === mia.id)).toBe(false)
  })

  it('returns registration history newest first', () => {
    const mia = memberNamed('Mia Kelleher')
    addRegistration({ memberId: mia.id, season: '2025', ageGroup: 'U11' })
    const history = getMemberRegistrationHistory(mia.id)
    expect(history[0].season).toBe('2026')
    expect(history[1].season).toBe('2025')
  })
})

describe('teams and placements', () => {
  it('returns the two seed teams', () => {
    expect(getTeams()).toHaveLength(2)
  })

  it('adds a team', () => {
    const team = addTeam({ name: 'U8G Green', season: '2026', ageGroup: 'U8' })
    expect(team.name).toBe('U8G Green')
    expect(getTeams()).toHaveLength(3)
  })

  it('refuses to place a player without a complete registration', () => {
    // Frankie has a 'started' registration only
    const frankie = memberNamed('Frankie Delahunty')
    const team = getTeams()[0]
    const result = addPlayerToTeam(team.id, frankie.id)
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('complete registration')
  })

  it('places a player with a complete registration', () => {
    // Sam is a senior with a complete registration but not in any team
    const sam = memberNamed('Sam Whitfield')
    const team = addTeam({ name: 'Mens Seniors', season: '2026', ageGroup: 'Senior' })
    const result = addPlayerToTeam(team.id, sam.id)
    expect(result.ok).toBe(true)
    expect(getRoster(team.id).rows).toHaveLength(1)
  })

  it('refuses to place the same player twice on the same team', () => {
    const mia = memberNamed('Mia Kelleher')
    const team = getTeams()[0] // Mia is already in this team via seed
    const result = addPlayerToTeam(team.id, mia.id)
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('already on the team')
  })

  it('moves a player between teams in the same season', () => {
    const mia = memberNamed('Mia Kelleher')
    const navy = getTeams().find((t) => t.name === 'U13G Navy')
    const gold = getTeams().find((t) => t.name === 'U13G Gold')

    const result = movePlayerToTeam(mia.id, navy.id, gold.id)
    expect(result.ok).toBe(true)
    expect(getRoster(navy.id).rows.some((r) => r.member.id === mia.id)).toBe(false)
    expect(getRoster(gold.id).rows.some((r) => r.member.id === mia.id)).toBe(true)
  })

  it('removes a player from a team', () => {
    const mia = memberNamed('Mia Kelleher')
    const team = getTeams()[0]
    removePlayerFromTeam(team.id, mia.id)
    expect(getRoster(team.id).rows.some((r) => r.member.id === mia.id)).toBe(false)
  })
})

describe('roster view', () => {
  it('returns guardian contact for junior players', () => {
    const team = getTeams()[0] // U13G Navy, all juniors
    const roster = getRoster(team.id)
    expect(roster.rows).toHaveLength(4)
    // Mia's contact should be her guardian Dani
    const miaRow = roster.rows.find((r) => r.member.name === 'Mia Kelleher')
    expect(miaRow.contact.name).toBe('Dani Kelleher')
    expect(miaRow.contact.phone).toBe('0417 662 908')
  })

  it('returns the member own contact for senior players', () => {
    const sam = memberNamed('Sam Whitfield')
    const team = addTeam({ name: 'Mens Seniors', season: '2026', ageGroup: 'Senior' })
    addPlayerToTeam(team.id, sam.id)
    const roster = getRoster(team.id)
    expect(roster.rows[0].contact.name).toBe('Sam Whitfield')
    expect(roster.rows[0].contact.phone).toBe('0401 234 567')
  })

  it('returns empty rows for a non-existent team', () => {
    const roster = getRoster('does-not-exist')
    expect(roster.team).toBeNull()
    expect(roster.rows).toEqual([])
  })
})
