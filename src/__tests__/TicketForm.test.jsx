import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import TicketForm from '../components/TicketForm'

vi.mock('../lib/api', () => ({
  createTicket: vi.fn(async (payload) => ({ id: 1, ...payload, createdAt: new Date().toISOString() })),
}))

describe('TicketForm', () => {
  it('validates required fields and description length', async () => {
    const showToast = vi.fn()
    render(<TicketForm showToast={showToast} onCreated={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/valid email is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/description must be at least 20 characters/i)).toBeInTheDocument()
  })

  it('submits valid form and shows success toast', async () => {
    const showToast = vi.fn()
    render(<TicketForm showToast={showToast} onCreated={() => {}} />)

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Network' } })
    fireEvent.change(screen.getByLabelText(/priority/i), { target: { value: 'High' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'This is a sufficiently detailed description.' } })

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    // success toast called
    await screen.findByText(/Submit/i) // wait for re-render
    expect(showToast).toHaveBeenCalled()
  })
})
