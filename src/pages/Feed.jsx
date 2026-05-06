import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { db, CATEGORIES } from '../lib/db'
import OfferCard from '../components/OfferCard'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Feed() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [category, setCategory] = useState('TODAS')
  const [dateFilter, setDateFilter] = useState('HOJE')

  useEffect(() => {
    if (!user) { navigate('/'); return }
    setOffers(db.getPublishedOffers())
  }, [user])

  const groupByDate = (list) => {
    const groups = {}
    list.forEach(o => {
      const d = o.createdAt.split('T')[0]
      if (!groups[d]) groups[d] = []
      groups[d].push(o)
    })
    return Object.entries(groups).sort((a,b) => b[0].localeCompare(a[0]))
  }

  const filtered = offers.filter(o => {
    const catOk = category === 'TODAS' || o.category === category
    if (!catOk) return false
    const d = parseISO(o.createdAt)
    if (dateFilter === 'HOJE') return isToday(d)
    if (dateFilter === 'ONTEM') return isYesterday(d)
    return true
  })

  const grouped = groupByDate(filtered)

  const dateLabel = (dateStr) => {
    const d = parseISO(dateStr)
    if (isToday(d)) return 'Hoje'
    if (isYesterday(d)) return 'Ontem'
    return format(d, "dd 'de' MMMM", { locale: ptBR })
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={{fontSize:'20px'}}>⚡</span>
            <span style={styles.logoText}>SCALE<span style={{color:'#9d5cf7'}}>ADS</span></span>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.userInfo}>{user?.email}</span>
            <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/') }}>Sair</button>
          </div>
        </div>
      </header>

      <div style={styles.hero}>
        <div style={styles.heroGlow} />
        <h1 style={styles.heroTitle}>🔥 TOP OFERTAS ESCALADAS</h1>
        <p style={styles.heroSub}>Curadoria diária das ofertas mais quentes do mercado</p>
      </div>

      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          {['HOJE', 'ONTEM', 'TODAS'].map(d => (
            <button
              key={d}
              style={{...styles.filterBtn, ...(dateFilter===d ? styles.filterActive : {})}}
              onClick={() => setDateFilter(d)}
            >{d}</button>
          ))}
        </div>
        <div style={styles.filterGroup}>
          {['TODAS', ...CATEGORIES].map(c => (
            <button
              key={c}
              style={{...styles.filterBtn, ...(category===c ? styles.filterActive : {})}}
              onClick={() => setCategory(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      <main style={styles.main}>
        {grouped.length === 0 ? (
          <div style={styles.empty}>
            <span style={{fontSize:'48px'}}>📭</span>
            <p>Nenhuma oferta encontrada para esse filtro.</p>
          </div>
        ) : (
          grouped.map(([date, items]) => (
            <div key={date} style={styles.group}>
              <div style={styles.dateDivider}>
                <div style={styles.dateLine} />
                <span style={styles.dateLabel}>{dateLabel(date)}</span>
                <div style={styles.dateLine} />
              </div>
              <div style={styles.grid}>
                {items.map(o => (
                  <OfferCard key={o.id} offer={o} isAdmin={false} />
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg)' },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(10,10,15,0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
  },
  headerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoText: { fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '20px', letterSpacing: '0.06em' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  userInfo: { fontSize: '13px', color: 'var(--text3)' },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border2)',
    color: 'var(--text2)',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'var(--font-head)',
    fontWeight: 600,
  },
  hero: {
    textAlign: 'center',
    padding: '48px 24px 32px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: '500px',
    height: '300px',
    background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
  },
  heroTitle: {
    fontFamily: 'var(--font-head)',
    fontWeight: 800,
    fontSize: 'clamp(22px, 4vw, 36px)',
    letterSpacing: '0.04em',
    marginBottom: '8px',
    position: 'relative',
  },
  heroSub: { color: 'var(--text3)', fontSize: '14px', position: 'relative' },
  filters: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px 24px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterGroup: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  filterBtn: {
    padding: '7px 16px',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    background: 'transparent',
    color: 'var(--text3)',
    fontSize: '12px',
    fontFamily: 'var(--font-head)',
    fontWeight: 600,
    letterSpacing: '0.04em',
    transition: 'all 0.15s',
  },
  filterActive: {
    background: 'rgba(124,58,237,0.15)',
    borderColor: 'rgba(124,58,237,0.4)',
    color: '#c4b5fd',
  },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px' },
  empty: { textAlign: 'center', padding: '80px 20px', color: 'var(--text3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  group: { marginBottom: '40px' },
  dateDivider: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  dateLine: { flex: 1, height: '1px', background: 'var(--border)' },
  dateLabel: {
    fontFamily: 'var(--font-head)',
    fontWeight: 700,
    fontSize: '13px',
    color: 'var(--text3)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
}
