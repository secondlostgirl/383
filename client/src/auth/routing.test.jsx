import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { mockApi, renderApp, signedInAs, USERS } from '../test/renderApp.jsx'

describe('M1 role-based routing', () => {
  it.each(['/', '/parent', '/specialist', '/child'])('sends a signed-out visitor from %s to login', async (path) => {
    mockApi({})
    renderApp(path)

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it.each([
    ['parent', '/', 'Parent dashboard'],
    ['specialist', '/', 'Specialist dashboard'],
    ['child', '/', 'My page'],
  ])('restores a %s session from the stored token', async (role, path, heading) => {
    signedInAs(role)
    renderApp(path)

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
    expect(screen.getByText(`${USERS[role].name} · ${role[0].toUpperCase()}${role.slice(1)}`)).toBeInTheDocument()
  })

  it.each([
    ['child', '/parent', 'My page'],
    ['child', '/specialist', 'My page'],
    ['specialist', '/parent', 'Specialist dashboard'],
    ['parent', '/child', 'Parent dashboard'],
  ])('redirects a %s who opens %s to their own home', async (role, path, heading) => {
    signedInAs(role)
    renderApp(path)

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
  })

  it('sends a signed-in user away from the login page', async () => {
    signedInAs('parent')
    renderApp('/login')

    expect(await screen.findByRole('heading', { name: 'Parent dashboard' })).toBeInTheDocument()
  })

  it('logs out: clears the token and shows the login page', async () => {
    signedInAs('parent')
    const user = userEvent.setup()
    renderApp('/parent')

    await user.click(await screen.findByRole('button', { name: 'Log out' }))

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('drops an expired token (401 from /auth/me) and shows the login page', async () => {
    localStorage.setItem('token', 'expired-token')
    mockApi({ 'GET /api/auth/me': () => [401, { error: 'Invalid or expired token' }] })
    renderApp('/parent')

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('returns to the requested page after signing in', async () => {
    mockApi({
      'POST /api/auth/login': () => [200, { token: 'jwt', user: USERS.parent }],
    })
    const user = userEvent.setup()
    renderApp('/parent')

    await user.type(await screen.findByLabelText('Email'), USERS.parent.email)
    await user.type(screen.getByLabelText('Password'), 'Demo1234!')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'Parent dashboard' })).toBeInTheDocument()
  })
})
