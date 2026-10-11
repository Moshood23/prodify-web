import type { ReturnReason, ReturnStatus } from '../../types/returns'

export const reasonLabels: Record<ReturnReason, string> = {
  Damaged: 'Damaged or faulty',
  WrongItem: 'Wrong item sent',
  NotAsDescribed: 'Not as described',
  NoLongerNeeded: 'No longer needed',
  Other: 'Something else',
}

export const reasonOptions = (Object.keys(reasonLabels) as ReturnReason[]).map((value) => ({ value, label: reasonLabels[value] }))

export const statusStyles: Record<ReturnStatus, { label: string; className: string }> = {
  Requested: { label: 'Waiting for the seller', className: 'bg-accent-light text-accent-dark' },
  Rejected: { label: 'Not accepted', className: 'bg-red-50 text-danger' },
  Escalated: { label: 'With Prodify', className: 'bg-accent-light text-accent-dark' },
  Refunded: { label: 'Refunded', className: 'bg-primary-light text-primary' },
  Declined: { label: 'Declined', className: 'bg-red-50 text-danger' },
}
