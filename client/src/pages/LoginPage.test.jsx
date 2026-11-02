import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { mockApi, renderApp, USERS } from '../test/renderApp.jsx'

async function fillAndSubmit(user, email, password) {
  if (email) await user.type(screen.getByLabelText('Email'), email)
  if (password) await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('M1 LoginPage', () => {
  it('shows email and password fields and no role picker', () => {
    mockApi({})
    renderApp('/login')

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('validates empty fields without calling the API', async () => {
    const fetchMock = mockApi({})
    const user = userEvent.setup()
    renderApp('/login')

    await fillAndSubmit(user)

    expect(screen.getByText('Enter your email.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a malformed email address', async () => {
    const fetchMock = mockApi({})
    const user = userEvent.setup()
    renderApp('/login')

    await fillAndSubmit(user, 'not-an-email', 'secret')

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows an error for wrong credentials and stays on the login page', async () => {
    mockApi({ 'POST /api/auth/login': () => [401, { error: 'Invalid email or password' }] })
    const user = userEvent.setup()
    renderApp('/login')

    await fillAndSubmit(user, 'elif.parent@demo.test', 'wrong')

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.')
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('shows a generic error when the server cannot be reached', async () => {
    mockApi({ 'POST /api/auth/login': () => [500, { error: 'Internal server error' }] })
    const user = userEvent.setup()
    renderApp('/login')

    await fillAndSubmit(user, 'elif.parent@demo.test', 'Demo1234!')

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not sign in. Please try again.')
  })

  it.each([
    ['parent', 'Parent dashboard'],
    ['specialist', 'Specialist dashboard'],
    ['child', 'My page'],
  ])('sends a %s to their own home screen and stores the token', async (role, heading) => {
    const fetchMock = mockApi({
      'POST /api/auth/login': () => [200, { token: `jwt-${role}`, user: USERS[role] }],
    })
    const user = userEvent.setup()
    renderApp('/login')

    await fillAndSubmit(user, `  ${USERS[role].email} `, 'Demo1234!')

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBe(`jwt-${role}`)
    // Email is trimmed before it is sent
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      email: USERS[role].email,
      password: 'Demo1234!',
    })
  })
})
