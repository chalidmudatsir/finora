import { useMemo, useState } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, Bell, CalendarDays, ChartNoAxesCombined,
  ChevronDown, CircleHelp, CreditCard, LayoutDashboard, Moon, Plus,
  Search, Settings, ShieldCheck, Sun, Wallet, WalletCards, X
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

type Transaction = { id: number; title: string; category: string; date: string; amount: number; type: 'income' | 'expense'; icon: string }
const initialTransactions: Transaction[] = [
  { id: 1, title: 'Gaji Bulanan', category: 'Salary', date: 'Hari ini, 09:12', amount: 5886695, type: 'income', icon: '💼' },
  { id: 2, title: 'Belanja kebutuhan', category: 'Groceries', date: 'Hari ini, 08:45', amount: 185000, type: 'expense', icon: '🛒' },
  { id: 3, title: 'Kopi & sarapan', category: 'Food & Drink', date: 'Kemarin, 07:30', amount: 42000, type: 'expense', icon: '☕' },
  { id: 4, title: 'Transportasi', category: 'Transport', date: 'Kemarin, 06:50', amount: 35000, type: 'expense', icon: '🛵' },
]
const chartData = [
  { day: 'Sen', income: 1.2, expense: .45 }, { day: 'Sel', income: 1.5, expense: .7 },
  { day: 'Rab', income: 1.1, expense: .55 }, { day: 'Kam', income: 1.8, expense: .9 },
  { day: 'Jum', income: 1.4, expense: .6 }, { day: 'Sab', income: 2.1, expense: 1.0 },
  { day: 'Min', income: 1.7, expense: .72 },
]
const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function App() {
  const [dark, setDark] = useState(false)
  const [active, setActive] = useState('Overview')
  const [transactions, setTransactions] = useState(initialTransactions)
  const [showAdd, setShowAdd] = useState(false)
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [budget] = useState(50000)
  const spentToday = useMemo(() => transactions.filter(t => t.type === 'expense' && t.date.startsWith('Hari ini')).reduce((s, t) => s + t.amount, 0), [transactions])
  const remaining = Math.max(0, budget - spentToday)
  const addTransaction = () => {
    const value = Number(amount)
    if (!title.trim() || !value || value <= 0) return
    setTransactions([{ id: Date.now(), title, category: type === 'income' ? 'Other income' : 'Other expense', date: 'Hari ini, baru saja', amount: value, type, icon: type === 'income' ? '💰' : '🧾' }, ...transactions])
    setTitle(''); setAmount(''); setShowAdd(false)
  }
  const navItems = [
    { label: 'Overview', icon: LayoutDashboard }, { label: 'Budget', icon: WalletCards },
    { label: 'History', icon: CalendarDays }, { label: 'Reports', icon: ChartNoAxesCombined },
  ]
  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">F</div><div><b>FINORA</b><small>PERSONAL FINANCE</small></div></div>
        <div className="workspace-label">WORKSPACE</div>
        {navItems.map(item => <button key={item.label} className={`side-link ${active === item.label ? 'selected' : ''}`} onClick={() => setActive(item.label)}><item.icon size={19}/><span>{item.label}</span></button>)}
        <div className="sidebar-bottom">
          <div className="upgrade-card"><div className="upgrade-icon"><ShieldCheck size={18}/></div><b>Your money, your rules.</b><p>Build better habits, one day at a time.</p><button onClick={() => setActive('Settings')}>Explore FINORA <span>↗</span></button></div>
          <button className="side-link" onClick={() => setActive('Settings')}><Settings size={19}/><span>Settings</span></button>
          <div className="profile-mini"><div className="avatar">CM</div><div><b>Chalid</b><small>Personal account</small></div><ChevronDown size={16}/></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark">F</div><b>FINORA</b></div>
          <div className="breadcrumb">Workspace <span>/</span> <b>{active}</b></div>
          <div className="top-actions"><button className="icon-btn search-btn"><Search size={18}/></button><button className="icon-btn" aria-label="Notifications"><Bell size={18}/><i/></button><button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><div className="avatar top-avatar">CM</div></div>
        </header>

        <div className="content">
          <section className="welcome-row"><div><div className="eyebrow">SELASA, 25 NOVEMBER 2026</div><h1>Good morning, Chalid <span>✦</span></h1><p>Here’s your financial overview for today.</p></div><button className="date-pill"><CalendarDays size={16}/> This month <ChevronDown size={15}/></button></section>

          <section className="stats-grid">
            <article className="stat-card balance-card"><div className="stat-top"><span>Total balance</span><span className="stat-icon"><Wallet size={18}/></span></div><h2>Rp 12.845.000</h2><div className="stat-foot"><span className="trend positive">↗ 8.2%</span><span>vs. last month</span></div><div className="balance-spark"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></article>
            <article className="stat-card"><div className="stat-top"><span>Total income</span><span className="stat-icon green"><ArrowDownLeft size={18}/></span></div><h2>Rp 8.250.000</h2><div className="stat-foot"><span className="trend positive">↗ 12.5%</span><span>vs. last month</span></div></article>
            <article className="stat-card"><div className="stat-top"><span>Total expenses</span><span className="stat-icon coral"><ArrowUpRight size={18}/></span></div><h2>Rp 3.425.000</h2><div className="stat-foot"><span className="trend negative">↘ 4.3%</span><span>vs. last month</span></div></article>
            <article className="stat-card"><div className="stat-top"><span>Today's spending</span><span className="stat-icon violet"><CreditCard size={18}/></span></div><h2>{rupiah(spentToday)}</h2><div className="stat-foot"><span className="muted">4 transactions</span><span>today</span></div></article>
          </section>

          <section className="middle-grid">
            <article className="panel chart-panel"><div className="panel-heading"><div><h3>Cash flow</h3><p>Track your income and expenses</p></div><button className="select-pill">This week <ChevronDown size={14}/></button></div><div className="chart-legend"><span><i className="legend-income"/> Income</span><span><i className="legend-expense"/> Expenses</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={.2}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={.16}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} tickFormatter={v => `${v}jt`}/><Tooltip formatter={(v) => `${v} juta`} contentStyle={{ borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface)' }}/><Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeFill)"/><Area type="monotone" dataKey="expense" stroke="#f59e0b" strokeWidth={2.5} fill="url(#expenseFill)"/></AreaChart></ResponsiveContainer></div></article>
            <article className="panel budget-panel"><div className="panel-heading"><div><h3>Daily budget</h3><p>Your spending limit today</p></div><button className="more-btn">•••</button></div><div className="budget-amount"><div><small>Remaining today</small><h2>{rupiah(remaining)}</h2></div><span className="budget-badge">On track</span></div><div className="progress-track"><div style={{ width: `${Math.min(100, spentToday / budget * 100)}%` }}/></div><div className="budget-meta"><span>{rupiah(spentToday)} spent</span><b>{Math.round(spentToday / budget * 100)}% of {rupiah(budget)}</b></div><div className="budget-tip"><span>✦</span><p>{spentToday <= budget ? `Kamu masih punya ${rupiah(remaining)} untuk hari ini. Keep it up!` : 'Pengeluaran melewati batas harian.'}</p></div><button className="text-button" onClick={() => setActive('Budget')}>Manage budget <span>→</span></button></article>
          </section>

          <section className="panel transactions-panel"><div className="panel-heading"><div><h3>Recent transactions</h3><p>Your latest money movements</p></div><button className="view-all" onClick={() => setActive('History')}>View all <span>→</span></button></div><div className="transaction-list">{transactions.slice(0, 5).map(t => <div className="transaction-row" key={t.id}><div className={`transaction-icon ${t.type}`}>{t.icon}</div><div className="transaction-info"><b>{t.title}</b><small>{t.category} · {t.date}</small></div><strong className={t.type}>{t.type === 'income' ? '+' : '−'}{rupiah(t.amount)}</strong><span className={`status-dot ${t.type}`}/></div>)}</div></section>
          <footer className="footer"><span>© 2026 FINORA. Take Control. Build Your Future.</span><span><CircleHelp size={14}/> Help center</span></footer>
        </div>
      </main>

      <nav className="mobile-nav">{navItems.slice(0,2).map(item => <button className={active === item.label ? 'active' : ''} key={item.label} onClick={() => setActive(item.label)}><item.icon size={19}/><small>{item.label}</small></button>)}<button className="add-nav" onClick={() => setShowAdd(true)}><Plus size={23}/></button>{navItems.slice(2).map(item => <button className={active === item.label ? 'active' : ''} key={item.label} onClick={() => setActive(item.label)}><item.icon size={19}/><small>{item.label}</small></button>)}</nav>

      {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><div className="modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div><h3>Add transaction</h3><p>Record your money movement</p></div><button className="icon-btn" onClick={() => setShowAdd(false)}><X size={18}/></button></div><div className="type-switch"><button className={type === 'expense' ? 'chosen expense' : ''} onClick={() => setType('expense')}>Expense</button><button className={type === 'income' ? 'chosen income' : ''} onClick={() => setType('income')}>Income</button></div><label>Transaction name<input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Lunch, salary..." /></label><label>Amount (IDR)<input type="number" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" /></label><button className="primary-btn full" onClick={addTransaction}>Save transaction</button></div></div>}
    </div>
  )
}