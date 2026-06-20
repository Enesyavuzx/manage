'use client'
import { LayoutDashboard, ArrowLeftRight, BarChart3, Wallet, FileBarChart } from 'lucide-react'
import { BudgetOverview } from '@/components/budget/budget-overview'
import { AccountManager } from '@/components/budget/account-manager'
import { TransactionForm } from '@/components/budget/transaction-form'
import { TransactionList } from '@/components/budget/transaction-list'
import { BudgetCharts } from '@/components/budget/budget-charts'
import { BudgetGoals } from '@/components/budget/budget-goals'
import { BudgetReport } from '@/components/budget/budget-report'
import { Tabs } from '@/components/ui/tabs'

export default function BudgetPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Bütçe</h1>
        <p className="mt-0.5 text-sm text-muted">Paranı sade tut, akışı gör</p>
      </div>

      <Tabs
        tabs={[
          {
            id: 'genel', label: 'Genel', icon: LayoutDashboard,
            content: <div className="space-y-6"><BudgetOverview /><BudgetGoals /></div>,
          },
          {
            id: 'hareket', label: 'Hareketler', icon: ArrowLeftRight,
            content: (
              <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
                <div className="order-1"><TransactionForm /></div>
                <div className="order-2"><TransactionList /></div>
              </div>
            ),
          },
          { id: 'grafik', label: 'Grafikler', icon: BarChart3, content: <BudgetCharts /> },
          { id: 'rapor', label: 'Raporlar', icon: FileBarChart, content: <BudgetReport /> },
          { id: 'hesap', label: 'Hesaplar', icon: Wallet, content: <AccountManager /> },
        ]}
      />
    </div>
  )
}
