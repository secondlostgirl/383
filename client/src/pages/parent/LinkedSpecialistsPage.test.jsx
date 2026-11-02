import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp, signedInAs } from '../../test/renderApp.jsx'

const DENIZ = { id: 1, name: 'Deniz Demir', birthDate: '2019-04-12' }
const ARDA = { id: 7, name: 'Arda Demir', birthDate: '2021-01-20' }
const ZEYNEP = {
  id: 9, name: 'Zeynep Sahin', email: 'zeynep.specialist@demo.test',
  specialistType: 'psychologist', linkedAt: '2026-11-02 10:00:00',
}

function setup(routes = {}, children = [DENIZ]) {
  const fetchMock = signedInAs('parent', {
    'GET /api/me/children': () => [200, { children }],
    'GET /api/children/1/specialists': () => [200, { specialists: [] }],
    'GET /api/children/7/specialists': () => [200, { specialists: [] }],
    ...routes,
  })
  renderApp('/parent/specialists')
  return { fetchMock, user: userEvent.setup() }
}

async function submitLink(user, email, typeLabel) {
  const form = await screen.findByRole('form', { name: 'Link a specialist' })
  if (email) await user.type(within(form).getByLabelText('Specialist email'), email)
  if (typeLabel) await user.selectOptions(within(form).getByLabelText('Specialist type'), typeLabel)
  await user.click(within(form).getByRole('button', { name: 'Link specialist' }))
}

const postCalls = (fetchMock) => fetchMock.mock.calls.filter(([, o]) => o?.method === 'POST')

describe('M2 Linked specialists page – link form (S2G1-23)', () => {
  it('is reachable from the parent navigation', async () => {
    setup()
    expect(await screen.findByRole('heading', { name: 'Linked specialists', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Linked specialists' })).toHaveAttribute('href', '/parent/specialists')
  })

  it('offers exactly the five specialist types from the assignment', async () => {
    setup()
    const select = await screen.findByLabelText('Specialist type')
    const options = within(select).getAllByRole('option').map((o) => o.textContent)
    expect(options).toEqual([
      'Choose...', 'Teacher', 'Psychologist', 'Doctor', 'Special education teacher', 'Coach',
    ])
  })

  it('validates email and type before calling the API', async () => {
    const { fetchMock, user } = setup()

    await submitLink(user)
    expect(screen.getByText('Enter the specialist\'s email.')).toBeInTheDocument()
    expect(screen.getByText('Choose the specialist type.')).toBeInTheDocument()

    await submitLink(user, 'not-an-email')
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()

    expect(postCalls(fetchMock)).toHaveLength(0)
  })

  it('links a specialist and confirms it', async () => {
    const { fetchMock, user } = setup({
      'POST /api/children/1/specialists': () => [201, { specialist: ZEYNEP }],
    })

    await submitLink(user, ' zeynep.specialist@demo.test ', 'Psychologist')

    expect(await screen.findByRole('status')).toHaveTextContent('Zeynep Sahin is now linked to Deniz Demir.')
    expect(JSON.parse(postCalls(fetchMock)[0][1].body)).toEqual({
      email: 'zeynep.specialist@demo.test',
      specialistType: 'psychologist',
    })
    expect(screen.getByLabelText('Specialist email')).toHaveValue('')
  })

  it('explains an unregistered email', async () => {
    const { user } = setup({
      'POST /api/children/1/specialists': () => [404, { error: 'No registered specialist with this email' }],
    })

    await submitLink(user, 'nobody@demo.test', 'Doctor')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No registered specialist uses this email. Ask them to create an account first.',
    )
  })

  it('explains an already linked specialist', async () => {
    const { user } = setup({
      'POST /api/children/1/specialists': () => [409, { error: 'already linked' }],
    })

    await submitLink(user, 'selin.specialist@demo.test', 'Teacher')

    expect(await screen.findByRole('alert')).toHaveTextContent('This specialist is already linked to Deniz Demir.')
  })

  it('lets a parent with several children choose the child', async () => {
    const { fetchMock, user } = setup({
      'POST /api/children/7/specialists': () => [201, { specialist: ZEYNEP }],
    }, [DENIZ, ARDA])

    await user.selectOptions(await screen.findByLabelText('Child'), 'Arda Demir')
    await submitLink(user, 'zeynep.specialist@demo.test', 'Coach')

    expect(await screen.findByRole('status')).toHaveTextContent('Zeynep Sahin is now linked to Arda Demir.')
    expect(postCalls(fetchMock)[0][0]).toBe('/api/children/7/specialists')
  })

  it('tells a parent without children that there is nothing to link', async () => {
    setup({}, [])
    expect(await screen.findByText('You have no children registered yet.')).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: 'Link a specialist' })).not.toBeInTheDocument()
  })

  it('is not available to a specialist', async () => {
    signedInAs('specialist')
    renderApp('/parent/specialists')
    expect(await screen.findByRole('heading', { name: 'Specialist dashboard' })).toBeInTheDocument()
  })
})
