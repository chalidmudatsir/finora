import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, Bell, CalendarDays, ChartNoAxesCombined,
  ChevronDown, CircleHelp, CreditCard, LayoutDashboard, Moon, Plus,
  Search, Settings, ShieldCheck, Sun, Wallet, WalletCards, X, Trash2,
  TrendingUp, UserRound, SlidersHorizontal, Download, PiggyBank
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'

type Tx = { id: string; title: string; category: string; date: string; amount: number; type: 'income' | 'expense'; icon: string; note?: string }
type Page = 'Overview' | 'Budget' | 'History' | 'Reports' | 'Profile' | 'Settings'
const today = () => new Date().toISOString().slice(0, 10)
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }
const initialTransactions: Tx[] = [
  { id: 'demo-1', title: 'Gaji Bulanan', category: 'Salary', date: today(), amount: 5886695, type: 'income', icon: '💼' },
  { id: 'demo-2', title: 'Belanja kebutuhan', category: 'Groceries', date: today(), amount: 185000, type: 'expense', icon: '🛒' },
  { id: 'demo-3', title: 'Kopi & sarapan', category: 'Food & Drink', date: daysAgo(1), amount: 42000, type: 'expense', icon: '☕' },
  { id: 'demo-4', title: 'Transportasi', category: 'Transport', date: daysAgo(1), amount: 35000, type: 'expense', icon: '🛵' },
]
const money = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
const shortMoney = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace('.', ',')} jt` : money(n)
const dateLabel = (s: string) => s === today() ? 'Hari ini' : s === daysAgo(1) ? 'Kemarin' : new Date(`${s}T12:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const categories = ['Food & Drink', 'Groceries', 'Transport', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Salary', 'Business', 'Other']
const chartColors = ['#10b981', '#f59e0b', '#8b78d6', '#ef8c79', '#5c8dd6', '#9aa3b5']

export default function App() {
  const [dark, setDark] = useState(false)
  const [active, setActive] = useState<Page>('Overview')
  const [transactions, setTransactions] = useState<Tx[]>(() => { try { const raw = localStorage.getItem('finora-transactions'); return raw ? JSON.parse(raw) : initialTransactions } catch { return initialTransactions } })
  const [budget, setBudget] = useState(() => Number(localStorage.getItem('finora-budget-amount') || localStorage.getItem('finora-daily-budget')) || 50000)
  const [budgetPeriod, setBudgetPeriod] = useState<'day' | 'week' | 'month'>(() => (localStorage.getItem('finora-budget-period') as 'day' | 'week' | 'month') || 'day')
  const [budgetStartDate, setBudgetStartDate] = useState(() => localStorage.getItem('finora-budget-start') || today())
  const [showAdd, setShowAdd] = useState(false)
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food & Drink')
  const [txDate, setTxDate] = useState(today())
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(String(budget))
  const [profileName, setProfileName] = useState(localStorage.getItem('finora-name') || 'Chalid')
  const [period, setPeriod] = useState('month')

  useEffect(() => { localStorage.setItem('finora-transactions', JSON.stringify(transactions)) }, [transactions])
  useEffect(() => { localStorage.setItem('finora-budget-amount', String(budget)); localStorage.setItem('finora-daily-budget', String(budget)) }, [budget])
  useEffect(() => { localStorage.setItem('finora-budget-period', budgetPeriod) }, [budgetPeriod])
  useEffect(() => { localStorage.setItem('finora-budget-start', budgetStartDate) }, [budgetStartDate])
  useEffect(() => { localStorage.setItem('finora-name', profileName) }, [profileName])

  const todayTransactions = useMemo(() => transactions.filter(t => t.date === today()), [transactions])
  const spentToday = todayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const incomeToday = todayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const periodBounds = (dateString: string) => {
    const d = new Date(`${dateString}T12:00:00`)
    const start = new Date(d)
    if (budgetPeriod === 'week') { const day = (start.getDay() + 6) % 7; start.setDate(start.getDate() - day) }
    if (budgetPeriod === 'month') start.setDate(1)
    const end = new Date(start)
    if (budgetPeriod === 'day') end.setDate(end.getDate() + 1)
    if (budgetPeriod === 'week') end.setDate(end.getDate() + 7)
    if (budgetPeriod === 'month') end.setMonth(end.getMonth() + 1)
    return { start, end }
  }
  const periodKey = (dateString: string) => periodBounds(dateString).start.toISOString().slice(0, 10)
  const currentPeriodKey = periodKey(today())
  const currentPeriodTransactions = transactions.filter(t => periodKey(t.date) === currentPeriodKey && t.date >= budgetStartDate)
  const spentCurrentPeriod = currentPeriodTransactions.filter(t => t.type === 'expense').reduce((sum,t) => sum + t.amount, 0)
  const previousDebt = useMemo(() => {
    const eligible = transactions.filter(t => t.type === 'expense' && t.date >= budgetStartDate && t.date < periodBounds(today()).start.toISOString().slice(0,10))
    if (!eligible.length) return 0
    let cursor = periodBounds(eligible.map(t=>t.date).sort()[0]).start
    const currentStart = periodBounds(today()).start
    let carry = 0
    while (cursor < currentStart) {
      const key = cursor.toISOString().slice(0,10)
      const spent = transactions.filter(t=>t.type==='expense' && t.date>=key && periodKey(t.date)===key).reduce((sum,t)=>sum+t.amount,0)
      carry = Math.max(0, carry + spent - budget)
      if (budgetPeriod === 'day') cursor.setDate(cursor.getDate()+1)
      else if (budgetPeriod === 'week') cursor.setDate(cursor.getDate()+7)
      else cursor.setMonth(cursor.getMonth()+1)
    }
    return carry
  }, [transactions, budget, budgetPeriod, budgetStartDate])
  const adjustedLimit = Math.max(0, budget - previousDebt)
  const remaining = Math.max(0, adjustedLimit - spentCurrentPeriod)
  const overToday = Math.max(0, spentCurrentPeriod - adjustedLimit)
  const periodLabel = budgetPeriod === 'day' ? 'hari ini' : budgetPeriod === 'week' ? 'minggu ini' : 'bulan ini'
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpenses
  const monthlyTransactions = transactions.filter(t => t.date.slice(0, 7) === today().slice(0, 7))
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const addTransaction = () => {
    const value = Number(amount)
    if (!title.trim() || !Number.isFinite(value) || value <= 0) return
    const icons: Record<string, string> = { 'Food & Drink': '☕', Groceries: '🛒', Transport: '🛵', Salary: '💼', Shopping: '🛍️', Bills: '🧾', Health: '💊', Entertainment: '🎬', Business: '💻', Other: '📌' }
    setTransactions(prev => [{ id: crypto.randomUUID(), title: title.trim(), category, date: txDate, amount: value, type, icon: icons[category] || '📌' }, ...prev])
    setTitle(''); setAmount(''); setTxDate(today()); setShowAdd(false); setActive('History')
  }
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id))
  const navItems = [
    { label: 'Overview' as Page, icon: LayoutDashboard }, { label: 'Budget' as Page, icon: WalletCards },
    { label: 'History' as Page, icon: CalendarDays }, { label: 'Reports' as Page, icon: ChartNoAxesCombined },
  ]
  const filtered = transactions.filter(t => (filterType === 'all' || t.type === filterType) && `${t.title} ${t.category}`.toLowerCase().includes(query.toLowerCase())).sort((a,b) => b.date.localeCompare(a.date))
  const reportRows = categories.map(c => ({ name: c, value: transactions.filter(t => t.type === 'expense' && t.category === c).reduce((s,t) => s+t.amount,0) })).filter(x => x.value > 0).sort((a,b) => b.value-a.value)
  const dailyChart = Array.from({ length: 7 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() - (6-i)); const key = date.toISOString().slice(0,10); return { day: date.toLocaleDateString('id-ID',{weekday:'short'}), income: transactions.filter(t=>t.date===key&&t.type==='income').reduce((s,t)=>s+t.amount,0)/1e6, expense: transactions.filter(t=>t.date===key&&t.type==='expense').reduce((s,t)=>s+t.amount,0)/1e6 } })

  const pageTitle: Record<Page, string> = { Overview: 'Overview', Budget: 'Daily budget', History: 'Transaction history', Reports: 'Financial reports', Profile: 'My profile', Settings: 'Settings' }
  const renderTransactionRows = (rows: Tx[]) => rows.length ? rows.map(t => <div className="transaction-row" key={t.id}><div className={`transaction-icon ${t.type}`}>{t.icon}</div><div className="transaction-info"><b>{t.title}</b><small>{t.category} · {dateLabel(t.date)}</small></div><strong className={t.type}>{t.type === 'income' ? '+' : '−'}{money(t.amount)}</strong><button className="delete-tx" aria-label="Hapus transaksi" onClick={() => deleteTransaction(t.id)}><Trash2 size={15}/></button></div>) : <div className="empty-state"><Wallet size={27}/><b>Belum ada transaksi</b><span>Tambahkan transaksi pertamamu untuk mulai mencatat keuangan.</span><button className="primary-btn" onClick={() => setShowAdd(true)}>Tambah transaksi</button></div>

  return <div className={dark ? 'app dark' : 'app'}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">F</div><div><b>FINORA</b><small>PERSONAL FINANCE</small></div></div>
      <div className="workspace-label">WORKSPACE</div>
      {navItems.map(item => <button key={item.label} className={`side-link ${active === item.label ? 'selected' : ''}`} onClick={() => setActive(item.label)}><item.icon size={19}/><span>{item.label}</span></button>)}
      <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><ShieldCheck size={18}/></div><b>Your money, your rules.</b><p>Build better habits, one day at a time.</p><button onClick={() => setActive('Profile')}>Manage profile <span>↗</span></button></div>
        <button className={`side-link ${active === 'Settings' ? 'selected' : ''}`} onClick={() => setActive('Settings')}><Settings size={19}/><span>Settings</span></button>
        <button className="profile-mini profile-button" onClick={() => setActive('Profile')}><div className="avatar">{profileName.slice(0,2).toUpperCase()}</div><div><b>{profileName}</b><small>Personal account · Demo</small></div><ChevronDown size={16}/></button>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="mobile-brand"><div className="brand-mark">F</div><b>FINORA</b></div><div className="breadcrumb">Workspace <span>/</span> <b>{pageTitle[active]}</b></div><div className="top-actions"><button className="icon-btn search-btn" onClick={() => {setActive('History'); setQuery('')}}><Search size={18}/></button><button className="icon-btn" aria-label="Notifications"><Bell size={18}/><i/></button><button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><button className="avatar top-avatar" onClick={() => setActive('Profile')}>{profileName.slice(0,2).toUpperCase()}</button></div></header>
      <div className="content">
        {active === 'Overview' && <>
          <section className="welcome-row"><div><div className="eyebrow">{new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase()}</div><h1>Good morning, {profileName} <span>✦</span></h1><p>Here’s your financial overview for today.</p></div><div className="date-pill"><CalendarDays size={16}/> {new Date().toLocaleDateString('id-ID',{month:'long',year:'numeric'})}</div></section>
          <section className="stats-grid">
            <article className="stat-card balance-card"><div className="stat-top"><span>Total balance</span><span className="stat-icon"><Wallet size={18}/></span></div><h2>{money(balance)}</h2><div className="stat-foot"><span>Income − expenses</span></div><div className="balance-spark">{[35,55,75,48,90,62,40,72,96,58,78,45].map((h,i)=><span key={i} style={{height:`${h}%`}}/>)}</div></article>
            <article className="stat-card"><div className="stat-top"><span>Monthly income</span><span className="stat-icon green"><ArrowDownLeft size={18}/></span></div><h2>{money(monthlyIncome)}</h2><div className="stat-foot">{monthlyTransactions.filter(t=>t.type==='income').length} income transactions</div></article>
            <article className="stat-card"><div className="stat-top"><span>Monthly expenses</span><span className="stat-icon coral"><ArrowUpRight size={18}/></span></div><h2>{money(monthlyExpense)}</h2><div className="stat-foot">{monthlyTransactions.filter(t=>t.type==='expense').length} expense transactions</div></article>
            <article className="stat-card"><div className="stat-top"><span>Today's spending</span><span className="stat-icon violet"><CreditCard size={18}/></span></div><h2>{money(spentCurrentPeriod)}</h2><div className="stat-foot">{todayTransactions.length} transactions today</div></article>
          </section>
          <section className="middle-grid"><article className="panel chart-panel"><div className="panel-heading"><div><h3>Cash flow</h3><p>Income and expenses · last 7 days</p></div></div><div className="chart-legend"><span><i className="legend-income"/> Income</span><span><i className="legend-expense"/> Expenses</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={dailyChart} margin={{top:10,right:8,left:-18,bottom:0}}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={.2}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={.16}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:11}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:10}} tickFormatter={v=>`${v}jt`}/><Tooltip formatter={(v:any)=>money(Number(v)*1e6)} contentStyle={{borderRadius:12,border:'1px solid var(--line)',background:'var(--surface)'}}/><Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeFill)"/><Area type="monotone" dataKey="expense" stroke="#f59e0b" strokeWidth={2.5} fill="url(#expenseFill)"/></AreaChart></ResponsiveContainer></div></article>
            <article className="panel budget-panel"><div className="panel-heading"><div><h3>Custom budget</h3><p>Your custom spending limit</p></div><button className="more-btn" onClick={()=>setActive('Budget')}>•••</button></div><div className="budget-amount"><div><small>Remaining today</small><h2>{money(remaining)}</h2></div><span className={`budget-badge ${overToday>0?'over':''}`}>{overToday>0?'Over budget':'On track'}</span></div><div className="progress-track"><div className={overToday>0?'over-fill':''} style={{width:`${Math.min(100, adjustedLimit ? spentCurrentPeriod/adjustedLimit*100 : spentCurrentPeriod>0?100:0)}%`}}/></div><div className="budget-meta"><span>{money(spentCurrentPeriod)} spent</span><b>{adjustedLimit?Math.round(spentCurrentPeriod/adjustedLimit*100):spentCurrentPeriod?100:0}% of {money(adjustedLimit)}</b></div><div className="budget-tip"><span>✦</span><p>{overToday>0?`Pengeluaran melewati batas sebesar ${money(overToday)}. Kelebihan ini mengurangi anggaran periode berikutnya.`:`Kamu masih punya ${money(remaining)} untuk ${periodLabel}. Sisa budget tidak ditambahkan ke periode berikutnya.`}</p></div><button className="text-button" onClick={()=>setActive('Budget')}>Manage budget <span>→</span></button></article></section>
          <section className="panel transactions-panel"><div className="panel-heading"><div><h3>Recent transactions</h3><p>Your latest money movements</p></div><button className="view-all" onClick={()=>setActive('History')}>View all <span>→</span></button></div><div className="transaction-list">{renderTransactionRows([...transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5))}</div></section>
          <footer className="footer"><span>© {new Date().getFullYear()} FINORA. Take Control. Build Your Future.</span><span><CircleHelp size={14}/> Demo mode · Data tersimpan di perangkat</span></footer>
        </>}
        {active === 'Budget' && <><PageIntro eyebrow="SPENDING PLAN" title="Custom budget" subtitle="Tentukan sendiri nominal dan periode anggaranmu."/><section className="budget-page-grid"><article className="panel budget-main-card"><div className="panel-heading"><div><h3>Anggaran aktif</h3><p>Nominal yang kamu tentukan sendiri</p></div><span className={`budget-badge ${overToday>0?'over':''}`}>{overToday>0?'Over budget':'On track'}</span></div><div className="budget-big">{money(remaining)}<small>tersisa {periodLabel}</small></div><div className="progress-track large"><div className={overToday>0?'over-fill':''} style={{width:`${Math.min(100,adjustedLimit?spentCurrentPeriod/adjustedLimit*100:spentCurrentPeriod?100:0)}%`}}/></div><div className="budget-meta"><span>{money(spentCurrentPeriod)} terpakai</span><b>{adjustedLimit?Math.round(spentCurrentPeriod/adjustedLimit*100):spentCurrentPeriod?100:0}% dari {money(adjustedLimit)}</b></div><div className="budget-summary-grid"><div><small>Budget dasar</small><b>{money(budget)}</b></div><div><small>Potongan rollover</small><b className="negative">−{money(previousDebt)}</b></div><div><small>Batas periode ini</small><b>{money(adjustedLimit)}</b></div></div><div className="budget-tip"><span>✦</span><p>{overToday>0?`Kamu melewati batas ${periodLabel} sebesar ${money(overToday)}. Kelebihan ini akan mengurangi anggaran periode berikutnya.`:`Sisa anggaran tidak ditambahkan ke periode berikutnya. Hanya kelebihan pengeluaran yang dibawa sebagai pengurang.`}</p></div><button className="primary-btn" onClick={()=>{setBudgetInput(String(budget));setEditingBudget(true)}}>Atur custom budget</button></article><article className="panel rollover-card"><div className="feature-icon"><PiggyBank size={22}/></div><h3>Smart budget rollover</h3><p>Kelebihan pengeluaran dibawa sebagai potongan periode selanjutnya.</p><div className="rollover-example"><div><span>Budget dasar</span><b>{money(budget)}</b></div><div><span>Contoh pengeluaran</span><b>{money(budget+10000)}</b></div><div className="rollover-result"><span>Budget periode berikutnya</span><b>{money(Math.max(0,budget-10000))}</b></div></div><small className="muted-note">Periode: {budgetPeriod==='day'?'Harian':budgetPeriod==='week'?'Mingguan':'Bulanan'}. Sisa budget tidak diakumulasi.</small></article></section><section className="panel"><div className="panel-heading"><div><h3>Pengeluaran {periodLabel}</h3><p>Transaksi yang dihitung ke dalam budget aktif</p></div></div><div className="transaction-list">{renderTransactionRows(currentPeriodTransactions.filter(t=>t.type==='expense'))}</div></section></>}
        {active === 'History' && <><PageIntro eyebrow="ALL ACTIVITY" title="Transaction history" subtitle="Cari, tinjau, dan kelola semua pemasukan serta pengeluaran."/><section className="panel history-panel"><div className="history-tools"><div className="search-field"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari transaksi atau kategori..."/></div><select value={filterType} onChange={e=>setFilterType(e.target.value)}><option value="all">Semua transaksi</option><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select><button className="primary-btn" onClick={()=>setShowAdd(true)}><Plus size={16}/> Tambah</button></div><div className="history-totals"><div><small>Total pemasukan</small><b className="positive">{money(transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0))}</b></div><div><small>Total pengeluaran</small><b className="negative">{money(totalExpenses)}</b></div><div><small>Jumlah transaksi</small><b>{filtered.length}</b></div></div><div className="transaction-list">{renderTransactionRows(filtered)}</div></section></>}
        {active === 'Reports' && <><PageIntro eyebrow="INSIGHTS" title="Financial reports" subtitle="Pahami pola pemasukan dan pengeluaranmu."/><section className="stats-grid report-stats"><article className="stat-card"><div className="stat-top">Income bulan ini <ArrowDownLeft size={17}/></div><h2>{money(monthlyIncome)}</h2></article><article className="stat-card"><div className="stat-top">Expense bulan ini <ArrowUpRight size={17}/></div><h2>{money(monthlyExpense)}</h2></article><article className="stat-card"><div className="stat-top">Net cash flow <TrendingUp size={17}/></div><h2>{money(monthlyIncome-monthlyExpense)}</h2></article><article className="stat-card"><div className="stat-top">Rata-rata pengeluaran/hari</div><h2>{money(monthlyExpense/Math.max(1,new Date().getDate()))}</h2></article></section><section className="report-grid"><article className="panel"><div className="panel-heading"><div><h3>Pengeluaran per kategori</h3><p>Distribusi seluruh data transaksi</p></div></div>{reportRows.length?<><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={reportRows} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>{reportRows.map((r,i)=><Cell key={r.name} fill={chartColors[i%chartColors.length]}/>)}</Pie><Tooltip formatter={(v:any)=>money(Number(v))}/></PieChart></ResponsiveContainer></div><div className="category-legend">{reportRows.map((r,i)=><div key={r.name}><i style={{background:chartColors[i%chartColors.length]}}/><span>{r.name}</span><b>{money(r.value)}</b></div>)}</div></>:<EmptyInline text="Belum ada data pengeluaran untuk dianalisis."/>}</article><article className="panel"><div className="panel-heading"><div><h3>Cash flow · 7 hari</h3><p>Perbandingan pemasukan dan pengeluaran</p></div></div><div className="chart-wrap report-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={dailyChart}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:11}}/><YAxis hide/><Tooltip formatter={(v:any)=>money(Number(v)*1e6)}/><Area dataKey="income" stroke="#10b981" fill="#10b98122"/><Area dataKey="expense" stroke="#f59e0b" fill="#f59e0b22"/></AreaChart></ResponsiveContainer></div><button className="secondary-btn" onClick={()=>{const csv=['Tanggal,Nama,Kategori,Tipe,Jumlah',...transactions.map(t=>`${t.date},"${t.title}","${t.category}",${t.type},${t.amount}`)].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='finora-transactions.csv';a.click();URL.revokeObjectURL(a.href)}}><Download size={16}/> Export CSV</button></article></section></>}
        {active === 'Profile' && <><PageIntro eyebrow="ACCOUNT" title="My profile" subtitle="Kelola informasi profil lokal FINORA."/><section className="panel profile-card"><div className="profile-avatar-large">{profileName.slice(0,2).toUpperCase()}</div><div className="profile-form"><label>Nama tampilan<input value={profileName} onChange={e=>setProfileName(e.target.value)} /></label><label>Email<input value="Demo account · belum terhubung" disabled /></label><div className="notice-box">Akun ini masih berjalan dalam mode demo di perangkat ini. Login dan sinkronisasi cloud akan dibuat pada tahap backend Google Apps Script.</div><button className="secondary-btn" onClick={()=>setActive('Settings')}>Pengaturan aplikasi <Settings size={16}/></button></div></section></>}
        {active === 'Settings' && <><PageIntro eyebrow="PREFERENCES" title="Settings" subtitle="Atur preferensi tampilan dan data aplikasi."/><section className="panel settings-list"><div className="setting-row"><div><b>Appearance</b><small>Ubah tema aplikasi</small></div><button className="secondary-btn" onClick={()=>setDark(!dark)}>{dark?<Sun size={16}/>:<Moon size={16}/>} {dark?'Light mode':'Dark mode'}</button></div><div className="setting-row"><div><b>Custom budget</b><small>{budgetPeriod==='day'?'Harian':budgetPeriod==='week'?'Mingguan':'Bulanan'}</small></div><b>{money(budget)}</b></div><div className="setting-row"><div><b>Data lokal</b><small>Semua transaksi tersimpan di browser perangkat ini.</small></div><button className="danger-btn" onClick={()=>{if(confirm('Hapus semua transaksi lokal? Tindakan ini tidak dapat dibatalkan.'))setTransactions([])}}>Reset transaksi demo</button></div><div className="notice-box">Penting: versi ini belum menggunakan backend. Jangan gunakan sebagai satu-satunya tempat menyimpan catatan keuangan penting sebelum integrasi database dan backup selesai.</div></section></>}
      </div>
    </main>
    <nav className="mobile-nav">{navItems.slice(0,2).map(item=><button className={active===item.label?'active':''} key={item.label} onClick={()=>setActive(item.label)}><item.icon size={19}/><small>{item.label}</small></button>)}<button className="add-nav" onClick={()=>{setType('expense');setShowAdd(true)}}><Plus size={23}/></button>{navItems.slice(2).map(item=><button className={active===item.label?'active':''} key={item.label} onClick={()=>setActive(item.label)}><item.icon size={19}/><small>{item.label}</small></button>)}</nav>
    {showAdd && <div className="modal-backdrop" onClick={()=>setShowAdd(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h3>Tambah transaksi</h3><p>Catat pemasukan atau pengeluaran.</p></div><button className="icon-btn" onClick={()=>setShowAdd(false)}><X size={18}/></button></div><div className="type-switch"><button className={type==='expense'?'chosen expense':''} onClick={()=>{setType('expense');setCategory('Food & Drink')}}>Pengeluaran</button><button className={type==='income'?'chosen income':''} onClick={()=>{setType('income');setCategory('Salary')}}>Pemasukan</button></div><label>Nama transaksi<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Contoh: makan siang, gaji..." autoFocus/></label><label>Kategori<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.filter(c=>type==='income'?['Salary','Business','Other'].includes(c):c!=='Salary'&&c!=='Business').map(c=><option key={c}>{c}</option>)}</select></label><label>Tanggal<input type="date" value={txDate} onChange={e=>setTxDate(e.target.value)}/></label><label>Jumlah (Rupiah)<input type="number" min="1" inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0"/></label><button className="primary-btn full" disabled={!title.trim()||Number(amount)<=0} onClick={addTransaction}>Simpan transaksi</button></div></div>}
    {editingBudget && <div className="modal-backdrop" onClick={()=>setEditingBudget(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h3>Custom budget</h3><p>Tentukan nominal dan periode anggaranmu.</p></div><button className="icon-btn" onClick={()=>setEditingBudget(false)}><X size={18}/></button></div><label>Nominal budget (Rupiah)<input type="number" min="1" inputMode="numeric" value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} placeholder="Masukkan nominal budget"/></label><label>Periode budget<select value={budgetPeriod} onChange={e=>setBudgetPeriod(e.target.value as 'day'|'week'|'month')}><option value="day">Harian</option><option value="week">Mingguan</option><option value="month">Bulanan</option></select></label><label>Mulai berlaku<input type="date" value={budgetStartDate} onChange={e=>setBudgetStartDate(e.target.value)}/></label><div className="notice-box">Jika pengeluaran melebihi batas periode, kelebihannya akan mengurangi budget periode berikutnya. Sisa budget tidak dibawa.</div><button className="primary-btn full" disabled={!Number.isFinite(Number(budgetInput))||Number(budgetInput)<=0||!budgetStartDate} onClick={()=>{setBudget(Number(budgetInput));setEditingBudget(false)}}>Simpan custom budget</button></div></div>}
  </div>
}

function PageIntro({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle:string}) { return <section className="page-intro"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></section> }
function EmptyInline({text}:{text:string}) { return <div className="empty-inline">{text}</div> }
