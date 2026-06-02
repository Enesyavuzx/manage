'use client'
import { BudgetOverview } from '@/components/budget/budget-overview'
import { AccountManager } from '@/components/budget/account-manager'
import { TransactionForm } from '@/components/budget/transaction-form'
import { TransactionList } from '@/components/budget/transaction-list'

export default function BudgetPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Bütçe</h1>
        <p className="mt-0.5 text-sm text-muted">Paranı sade tut, akışı gör</p>
      </div>

      <BudgetOverview />
      <AccountManager />

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="order-1"><TransactionForm /></div>
        <div className="order-2"><TransactionList /></div>
      </div>
    </div>
  )
}
