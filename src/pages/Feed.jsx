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
  const [dateFilter, setDateFilter] = useState('TODAS')

  useEffect(() => {
    if (!user) { navigate('/'); return }
    setOffers(db.getPublishedOffers())
  }, [user])

  const groupByDate = (list) => {
    const groups = {}
    list.forEach(o => {
      const d = (o.offerDate || o.createdAt).split('T')[0]
      if (!groups[d]) groups[d] = []
      groups[d].push(o)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }

  const filtered = offers.filter(o => {
    const catOk = category === 'TODAS' || o.category === category
    if (!catOk) return false
    const dateStr = (o.offerDate || o.createdAt).split('T')[0]
    const d = parseISO(dateStr)
    if (dateFilter === 'HOJE') return isToday(d)
    if (dateFilter === 'ONTEM') return isYesterday(d)
    return true
  })

  const grouped = groupByDate(filtered)

  const dateLabel = (dateStr) => {
    const d = parseISO(dateStr)
    if (isToday(d)) return '🔥 HOJE'
    if (isYesterday(d)) return '📅 ONTEM'
    return '📅 ' + format(d, "dd 'de' MMMM", { locale: ptBR }).toUpperCase()
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.topBar}>
          <span style={styles.userTag}>👤 {user?.email}</span>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/') }}>Sair</button>
        </div>

        <img src="/logo.webp" alt="ScaleAds" style={styles.logo} />

        <div style={styles.socialRow}>
          {[
            { icon: '✈️', label: 'Telegram' },
            { icon: '📘', label: 'Facebook' },
            { icon: '📸', label: 'Instagram' },
            { icon: '🎵', label: 'TikTok' },
            { icon: '▶️', label: 'YouTube' },
          ].map((s) => (
            <div key={s.label} style={styles.socialBtn} title={s.label}>{s.icon}</div>
          ))}
        </div>

        <h1 style={styles.heroTitle}>TOP OFERTAS ESCALADAS</h1>
        <div style={{ fontSize: '36px', marginBottom: '20px' }}>🔥</div>

        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            {['TODAS', 'HOJE', 'ONTEM'].map(d => (
              <button key={d}
                style={{ ...styles.filterBtn, ...(dateFilter === d ? styles.filterOn : {}) }}
                onClick={() => setDateFilter(d)}>{d}</button>
            ))}
          </div>
          <div style={styles.filterGroup}>
            {['TODAS', ...CATEGORIES].map(c => (
              <button key={c}
                style={{ ...styles.filterBtn, ...(category === c ? styles.filterOn : {}) }}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <main style={styles.main}>
        {grouped.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '52px' }}>📭</div>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '12px', fontFamily: 'Verdana', fontWeight: 600 }}>
              Nenhuma oferta encontrada.
            </p>
          </div>
        ) : grouped.map(([date, items]) => (
          <div key={date} style={styles.group}>
            <div style={styles.dateDivider}>
              <div style={styles.dateLine} />
              <span style={styles.dateLabel}>{dateLabel(date)}</span>
              <div style={styles.dateLine} />
            </div>
            <div style={styles.grid}>
              {items.map(o => <OfferCard key={o.id} offer={o} isAdmin={false} />)}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#6B21D6' },
  header: { textAlign: 'center', padding: '20px 24px 32px' },
  topBar: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '12px', alignItems: 'center' },
  userTag: { fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontFamily: 'Verdana' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
    color: 'white', padding: '5px 16px', borderRadius: '20px',
    fontSize: '12px', fontFamily: 'Verdana', fontWeight: 600,
  },
  logo: { width: '120px', marginBottom: '16px', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))' },
  socialRow: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' },
  socialBtn: {
    width: '52px', height: '52px', background: 'rgba(0,0,0,0.3)',
    borderRadius: '14px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '24px',
    backdropFilter: 'blur(4px)', cursor: 'pointer',
  },
  heroTitle: {
    fontFamily: 'Verdana, sans-serif', fontWeight: 700,
    fontSize: 'clamp(20px, 4vw, 40px)', color: 'white',
    letterSpacing: '0.04em', textTransform: 'uppercase',
    marginBottom: '8px', textShadow: '0 2px 16px rgba(0,0,0,0.3)',
  },
  filters: { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', gap: '6px' },
  filterBtn: {
    padding: '7px 18px', border: '2px solid rgba(255,255,255,0.35)',
    borderRadius: '24px', background: 'rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.85)', fontSize: '12px',
    fontFamily: 'Verdana', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
  },
  filterOn: { background: 'white', borderColor: 'white', color: '#6B21D6' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' },
  empty: { textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  group: { marginBottom: '48px' },
  dateDivider: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  dateLine: { flex: 1, height: '2px', background: 'rgba(255,255,255,0.25)', borderRadius: '1px' },
  dateLabel: {
    fontFamily: 'Verdana', fontWeight: 700, fontSize: '14px',
    color: 'white', letterSpacing: '0.06em', whiteSpace: 'nowrap',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
}
