import { describe, expect, it } from 'vitest'
import { adminAuthHeaders, readAdminLoginFields } from './adminSession'

describe('adminSession', () => {
  it('trims the username and keeps password spaces', () => {
    const form = document.createElement('form')
    const username = document.createElement('input')
    username.name = 'username'
    username.value = ' admin '
    const password = document.createElement('input')
    password.name = 'password'
    password.value = ' secret '
    form.append(username, password)

    expect(readAdminLoginFields(form)).toEqual({
      username: 'admin',
      password: ' secret ',
    })
  })

  it('adds the bearer and csrf headers', () => {
    expect(adminAuthHeaders('csrf', 'tok', { 'Content-Type': 'application/json' })).toEqual({
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': 'csrf',
      Authorization: 'Bearer tok',
    })
    expect(adminAuthHeaders(null, null)).toEqual({})
  })
})
