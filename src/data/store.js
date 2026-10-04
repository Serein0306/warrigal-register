// Data access layer for the Warrigal Park FC registration system.
//
// All club records (members, guardians, links, registrations, teams and
// placements) are persisted in the browser using localStorage. The store
// exposes the CRUD operations required by the project scope and enforces the
// invariants that belong to the data layer (e.g. placements require a complete
// registration for the same season).

import config from '../config/config.js'
import { isJunior } from './domain.js'

const EMPTY = {
  members: [],
  guardians: [],
  memberGuardianLinks: [],
  registrations: [],
  teams: [],
  placements: [],
}

function load() {
  try {
    const raw = localStorage.getItem(config.storageKey)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : seed()
  } catch (error) {
    console.error('Failed to load club data from storage:', error)
    return seed()
  }
}

function persist(db) {
  localStorage.setItem(config.storageKey, JSON.stringify(db))
}

function uid(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

function nowIso() {
  return new Date().toISOString()
}

// ---------------------------------------------------------------- seed data

function seed() {
  const db = { ...EMPTY }

  const mia = { id: uid('m'), name: 'Mia Kelleher', dateOfBirth: '2014-09-03', gender: 'F', school: 'Bald Hills State School', phone: '', email: '', address: '', medicalNotes: 'Mild asthma - puffer in her bag', active: true, createdAt: nowIso() }
  const ruby = { id: uid('m'), name: 'Ruby Antonopoulos', dateOfBirth: '2014-02-11', gender: 'F', school: '', phone: '', email: '', address: '', medicalNotes: '', active: true, createdAt: nowIso() }
  const harriet = { id: uid('m'), name: 'Harriet Boon', dateOfBirth: '2014-06-27', gender: 'F', school: '', phone: '', email: '', address: '', medicalNotes: '', active: true, createdAt: nowIso() }
  const ana = { id: uid('m'), name: 'Ana Petrides', dateOfBirth: '2014-10-16', gender: 'F', school: '', phone: '', email: '', address: '', medicalNotes: '', active: true, createdAt: nowIso() }
  const frankie = { id: uid('m'), name: 'Frankie Delahunty', dateOfBirth: '2014-04-02', gender: 'F', school: '', phone: '', email: '', address: '', medicalNotes: '', active: true, createdAt: nowIso() }
  const rory = { id: uid('m'), name: 'Rory Kelleher', dateOfBirth: '2018-06-15', gender: 'M', school: '', phone: '', email: '', address: '', medicalNotes: '', active: true, createdAt: nowIso() }
  const sam = { id: uid('m'), name: 'Sam Whitfield', dateOfBirth: '1988-01-20', gender: 'M', school: '', phone: '0401 234 567', email: 'sam@example.com', address: '', medicalNotes: '', active: true, createdAt: nowIso() }
  db.members = [mia, ruby, harriet, ana, frankie, rory, sam]

  const dani = { id: uid('g'), name: 'Dani Kelleher', relationship: 'Mother', phone: '0417 662 908', email: 'd.kelleher@example.com', address: '22 Marlin Street, Bald Hills 4036', notes: '', createdAt: nowIso() }
  const steve = { id: uid('g'), name: 'Steve Antonopoulos', relationship: 'Father', phone: '0438 771 226', email: 's.antonopoulos@example.com', address: '', notes: '', createdAt: nowIso() }
  const georgina = { id: uid('g'), name: 'Georgina Boon', relationship: 'Mother', phone: '0402 559 118', email: '', address: '', notes: '', createdAt: nowIso() }
  db.guardians = [dani, steve, georgina]

  db.memberGuardianLinks = [
    { id: uid('l'), memberId: mia.id, guardianId: dani.id },
    { id: uid('l'), memberId: rory.id, guardianId: dani.id },
    { id: uid('l'), memberId: ruby.id, guardianId: steve.id },
    { id: uid('l'), memberId: harriet.id, guardianId: georgina.id },
  ]

  db.registrations = [
    { id: uid('r'), memberId: mia.id, season: '2026', ageGroup: 'U13', status: 'complete', createdAt: nowIso() },
    { id: uid('r'), memberId: ruby.id, season: '2026', ageGroup: 'U13', status: 'complete', createdAt: nowIso() },
    { id: uid('r'), memberId: harriet.id, season: '2026', ageGroup: 'U13', status: 'complete', createdAt: nowIso() },
    { id: uid('r'), memberId: ana.id, season: '2026', ageGroup: 'U13', status: 'complete', createdAt: nowIso() },
    { id: uid('r'), memberId: frankie.id, season: '2026', ageGroup: 'U13', status: 'started', createdAt: nowIso() },
    { id: uid('r'), memberId: rory.id, season: '2026', ageGroup: 'U8', status: 'complete', createdAt: nowIso() },
    { id: uid('r'), memberId: sam.id, season: '2026', ageGroup: 'Senior', status: 'complete', createdAt: nowIso() },
  ]

  db.teams = [
    { id: uid('t'), name: 'U13G Navy', season: '2026', ageGroup: 'U13' },
    { id: uid('t'), name: 'U13G Gold', season: '2026', ageGroup: 'U13' },
  ]

  db.placements = [
    { id: uid('p'), teamId: db.teams[0].id, memberId: mia.id, season: '2026' },
    { id: uid('p'), teamId: db.teams[0].id, memberId: ruby.id, season: '2026' },
    { id: uid('p'), teamId: db.teams[0].id, memberId: harriet.id, season: '2026' },
    { id: uid('p'), teamId: db.teams[0].id, memberId: ana.id, season: '2026' },
  ]

  persist(db)
  return db
}

// ------------------------------------------------------------------ members

export function getMembers() {
  return load().members
}

export function findMembers(nameQuery) {
  const q = (nameQuery || '').trim().toLowerCase()
  const members = load().members
  if (!q) return members
  // Return every match, including two people with the same name.
  return members.filter((m) => m.name.toLowerCase().includes(q))
}

export function getMember(id) {
  return load().members.find((m) => m.id === id) || null
}

export function addMember(data) {
  const db = load()
  const member = {
    id: uid('m'),
    name: data.name.trim(),
    dateOfBirth: data.dateOfBirth,
    gender: data.gender || '',
    school: data.school || '',
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    medicalNotes: data.medicalNotes || '',
    active: true,
    createdAt: nowIso(),
  }
  db.members.push(member)
  persist(db)
  return member
}

export function updateMember(id, data) {
  const db = load()
  const member = db.members.find((m) => m.id === id)
  if (!member) return null
  Object.assign(member, {
    name: data.name.trim(),
    dateOfBirth: data.dateOfBirth,
    gender: data.gender || '',
    school: data.school || '',
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    medicalNotes: data.medicalNotes || '',
  })
  persist(db)
  return member
}

export function setMemberActive(id, active) {
  const db = load()
  const member = db.members.find((m) => m.id === id)
  if (!member) return null
  member.active = Boolean(active)
  persist(db)
  return member
}

// ---------------------------------------------------------------- guardians

export function getGuardians() {
  return load().guardians
}

export function getGuardian(id) {
  return load().guardians.find((g) => g.id === id) || null
}

export function addGuardian(data) {
  const db = load()
  const guardian = {
    id: uid('g'),
    name: data.name.trim(),
    relationship: data.relationship || '',
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    notes: data.notes || '',
    createdAt: nowIso(),
  }
  db.guardians.push(guardian)
  persist(db)
  return guardian
}

export function updateGuardian(id, data) {
  const db = load()
  const guardian = db.guardians.find((g) => g.id === id)
  if (!guardian) return null
  Object.assign(guardian, {
    name: data.name.trim(),
    relationship: data.relationship || '',
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    notes: data.notes || '',
  })
  // The guardian is linked by id, so updating their phone number is visible
  // from every junior they are responsible for.
  persist(db)
  return guardian
}

// ------------------------------------------------------- guardian links

export function getGuardianIdsForMember(memberId) {
  return load()
    .memberGuardianLinks.filter((l) => l.memberId === memberId)
    .map((l) => l.guardianId)
}

export function getMemberIdsForGuardian(guardianId) {
  return load()
    .memberGuardianLinks.filter((l) => l.guardianId === guardianId)
    .map((l) => l.memberId)
}

export function linkGuardianToMember(memberId, guardianId) {
  const db = load()
  const exists = db.memberGuardianLinks.some(
    (l) => l.memberId === memberId && l.guardianId === guardianId,
  )
  if (!exists) {
    db.memberGuardianLinks.push({ id: uid('l'), memberId, guardianId })
    persist(db)
  }
}

export function unlinkGuardianFromMember(memberId, guardianId) {
  const db = load()
  db.memberGuardianLinks = db.memberGuardianLinks.filter(
    (l) => !(l.memberId === memberId && l.guardianId === guardianId),
  )
  persist(db)
}

// ----------------------------------------------------------- registrations

export function getRegistrations(filters = {}) {
  const db = load()
  let rows = db.registrations
  if (filters.season) rows = rows.filter((r) => r.season === filters.season)
  if (filters.status) rows = rows.filter((r) => r.status === filters.status)
  if (filters.memberId) rows = rows.filter((r) => r.memberId === filters.memberId)
  return rows
}

export function getRegistration(id) {
  return load().registrations.find((r) => r.id === id) || null
}

export function addRegistration({ memberId, season, ageGroup }) {
  const db = load()
  const member = db.members.find((m) => m.id === memberId)
  if (!member) throw new Error('Member not found')
  const duplicate = db.registrations.some(
    (r) => r.memberId === memberId && r.season === season && r.status !== 'withdrawn',
  )
  if (duplicate) throw new Error('This member already has a registration for that season.')
  const registration = {
    id: uid('r'),
    memberId,
    season,
    ageGroup: ageGroup || '',
    status: 'started',
    createdAt: nowIso(),
  }
  db.registrations.push(registration)
  persist(db)
  return registration
}

/**
 * Move a registration to 'complete'. Refuses junior registrations that have
 * no linked guardian, with the reason returned to the caller.
 */
export function completeRegistration(id) {
  const db = load()
  const registration = db.registrations.find((r) => r.id === id)
  if (!registration) return { ok: false, reason: 'Registration not found.' }
  const member = db.members.find((m) => m.id === registration.memberId)
  const linkedGuardianCount = db.memberGuardianLinks.filter(
    (l) => l.memberId === registration.memberId,
  ).length
  if (isJunior(member) && linkedGuardianCount === 0) {
    return {
      ok: false,
      reason:
        'This member is under 18 and must have at least one linked guardian before the registration can be completed.',
    }
  }
  registration.status = 'complete'
  persist(db)
  return { ok: true }
}

export function withdrawRegistration(id) {
  const db = load()
  const registration = db.registrations.find((r) => r.id === id)
  if (!registration) return null
  registration.status = 'withdrawn'
  // Remove any team placements for this registration's season.
  db.placements = db.placements.filter(
    (p) => !(p.memberId === registration.memberId && p.season === registration.season),
  )
  persist(db)
  return registration
}

// ---------------------------------------------------------------- teams

export function getTeams(filters = {}) {
  const db = load()
  let rows = db.teams
  if (filters.season) rows = rows.filter((t) => t.season === filters.season)
  if (filters.ageGroup) rows = rows.filter((t) => t.ageGroup === filters.ageGroup)
  return rows
}

export function getTeam(id) {
  return load().teams.find((t) => t.id === id) || null
}

export function addTeam({ name, season, ageGroup }) {
  const db = load()
  const team = { id: uid('t'), name: name.trim(), season, ageGroup: ageGroup || '' }
  db.teams.push(team)
  persist(db)
  return team
}

export function updateTeam(id, { name, ageGroup }) {
  const db = load()
  const team = db.teams.find((t) => t.id === id)
  if (!team) return null
  team.name = name.trim()
  team.ageGroup = ageGroup || ''
  persist(db)
  return team
}

// Removing a team does not delete the players who were in it.
export function removeTeam(id) {
  const db = load()
  db.teams = db.teams.filter((t) => t.id !== id)
  db.placements = db.placements.filter((p) => p.teamId !== id)
  persist(db)
}

// --------------------------------------------------------------- placements

export function getPlacements(teamId) {
  return load().placements.filter((p) => p.teamId === teamId)
}

/**
 * Place a registered player into a team. A player who is not registered for
 * the season cannot be placed.
 */
export function addPlayerToTeam(teamId, memberId) {
  const db = load()
  const team = db.teams.find((t) => t.id === teamId)
  if (!team) return { ok: false, reason: 'Team not found.' }
  const registered = db.registrations.some(
    (r) =>
      r.memberId === memberId &&
      r.season === team.season &&
      r.status === 'complete',
  )
  if (!registered) {
    return {
      ok: false,
      reason: 'This player does not have a complete registration for the season, so they cannot be placed in a team.',
    }
  }
  const alreadyPlaced = db.placements.some(
    (p) => p.teamId === teamId && p.memberId === memberId,
  )
  if (alreadyPlaced) return { ok: false, reason: 'This player is already on the team.' }
  db.placements.push({ id: uid('p'), teamId, memberId, season: team.season })
  persist(db)
  return { ok: true }
}

// Moving a player to another team within the same season.
export function movePlayerToTeam(memberId, fromTeamId, toTeamId) {
  const db = load()
  const toTeam = db.teams.find((t) => t.id === toTeamId)
  const placement = db.placements.find(
    (p) => p.teamId === fromTeamId && p.memberId === memberId,
  )
  if (!placement) return { ok: false, reason: 'Placement not found.' }
  if (!toTeam) return { ok: false, reason: 'Target team not found.' }
  if (toTeam.season !== placement.season) {
    return { ok: false, reason: 'Cannot move a player to a team in a different season.' }
  }
  const duplicate = db.placements.some(
    (p) => p.teamId === toTeamId && p.memberId === memberId,
  )
  if (duplicate) return { ok: false, reason: 'This player is already on the target team.' }
  placement.teamId = toTeamId
  persist(db)
  return { ok: true }
}

// Removing a player from a team does not remove their registration.
export function removePlayerFromTeam(teamId, memberId) {
  const db = load()
  db.placements = db.placements.filter(
    (p) => !(p.teamId === teamId && p.memberId === memberId),
  )
  persist(db)
}

// ------------------------------------------------------------------ lookups

export function memberName(id) {
  const member = getMember(id)
  return member ? member.name : '(unknown)'
}

export function guardianName(id) {
  const guardian = getGuardian(id)
  return guardian ? guardian.name : '(unknown)'
}

/**
 * Roster view: for each player in the team, the contact used to reach them.
 * Juniors are contacted through their first linked guardian; seniors use
 * their own contact details.
 */
export function getRoster(teamId) {
  const db = load()
  const team = db.teams.find((t) => t.id === teamId)
  if (!team) return { team: null, rows: [] }
  const rows = db.placements
    .filter((p) => p.teamId === teamId)
    .map((p) => {
      const member = db.members.find((m) => m.id === p.memberId)
      if (!member) return null
      let contact = { name: member.name, phone: member.phone }
      if (isJunior(member)) {
        const firstLink = db.memberGuardianLinks.find((l) => l.memberId === member.id)
        if (firstLink) {
          const guardian = db.guardians.find((g) => g.id === firstLink.guardianId)
          if (guardian) contact = { name: guardian.name, phone: guardian.phone }
        }
      }
      return { member, contact }
    })
    .filter(Boolean)
  return { team, rows }
}

/**
 * Registration history for a member, newest first.
 */
export function getMemberRegistrationHistory(memberId) {
  return getRegistrations({ memberId }).sort((a, b) => b.season.localeCompare(a.season))
}
