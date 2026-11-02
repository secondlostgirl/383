import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp, signedInAs } from '../test/renderApp.jsx'

describe('M2 Specialist home – my children', () => {
  it('lists the children the specialist is linked to', async () => {
    signedInAs('specialist', {
      'GET /api/me/children': () => [200, {
        children: [{ id: 1, name: 'Deniz Demir', birthDate: '2019-04-12', specialistType: 'special_education_teacher' }],
      }],
    })
    renderApp('/specialist')

    const item = await screen.findByRole('listitem')
    expect(item).toHaveTextContent('Deniz Demir · born 2019-04-12 · you are linked as special education teacher')
  })

  it('explains how linking works when there are no children', async () => {
    signedInAs('specialist', { 'GET /api/me/children': () => [200, { children: [] }] })
    renderApp('/specialist')

    expect(await screen.findByText(/You are not linked to any child yet/)).toBeInTheDocument()
  })
})
