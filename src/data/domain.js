// Domain rules for the Warrigal Park FC registration system.
//
// The single genuine piece of domain logic in the project: a member who is
// under 18 on the season start date is a junior, and a junior cannot hold a
// complete registration unless at least one guardian record is linked to them.
// An attempt to complete a junior registration without a guardian must be
// refused with a reason, never accepted and fixed later.

import config from '../config/config.js'

/**
 * Age of a member in whole years on the configured season start date.
 * @param {string} dateOfBirth ISO date (YYYY-MM-DD)
 * @returns {number}
 */
export function ageAtSeasonStart(dateOfBirth) {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  const start = new Date(config.seasonStart)
  let age = start.getFullYear() - dob.getFullYear()
  const monthDayDiff =
    start.getMonth() - dob.getMonth() || start.getDate() - dob.getDate()
  if (monthDayDiff < 0) age -= 1
  return age
}

/**
 * Whether the member is a junior (under 18) for the current season.
 */
export function isJunior(member) {
  const age = ageAtSeasonStart(member.dateOfBirth)
  return age === null ? false : age < config.juniorAge
}

/**
 * Attempt to complete a registration.
 * @returns {{ok: true} | {ok: false, reason: string}}
 */
export function canCompleteRegistration({ member, linkedGuardianCount }) {
  if (isJunior(member) && linkedGuardianCount === 0) {
    return {
      ok: false,
      reason:
        'This member is under 18 and must have at least one linked guardian before the registration can be completed.',
    }
  }
  return { ok: true }
}

/**
 * Human-readable age group for display purposes (e.g. "U13", "Senior").
 */
export function ageGroupLabel(member) {
  const age = ageAtSeasonStart(member.dateOfBirth)
  if (age === null) return 'Unknown'
  if (age < 6) return 'U6'
  if (age <= 18) return `U${age}`
  return 'Senior'
}
