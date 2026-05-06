import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { db, CATEGORIES, COUNTRIES } from '../lib/db'
import OfferCard from '../components/OfferCard'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Feed() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [favIds, setFavIds] = useState([])
  const [newCount, setNewCount] = useState(0)

  const [dateFilter, setDateFilter] = useState('HOJE')
  const [customDate, setCustomDate] = useState('')
  const [category, setCategory] = useState('TODAS')
  const [country, setCountry] = useState('TODOS')
  const [activeFilters, setActiveFilters] = useState({ dateFilter: 'HOJE', customDate: '', category: 'TODAS', country: 'TODOS' })

  useEffect(() => {
    if (!user) { navigate('/'); return }
    db.getStreak(user.email)
    const all = db.getPublishedOffers()
    setOffers(all)
    setFavIds(db.getFavorites(user.email))
    const todayCount = all.filter(o => {
      const d = parseISO((o.offerDate || o.createdAt).split('T')[0])
      return isToday(d)
    }).length
    setNewCount(todayCount)
  }, [user])

  const applyFilters = () => setActiveFilters({ dateFilter, customDate, category, country })

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
    const f = activeFilters
    const catOk = f.category === 'TODAS' || o.category === f.category
    const countryOk = f.country === 'TODOS' || o.country === f.country
    if (!catOk || !countryOk) return false
    const dateStr = (o.offerDate || o.createdAt).split('T')[0]
    const d = parseISO(dateStr)
    if (f.dateFilter === 'HOJE') return isToday(d)
    if (f.dateFilter === 'ONTEM') return isYesterday(d)
    if (f.dateFilter === 'PERSONALIZADO' && f.customDate) return dateStr === f.customDate
    return true
  })

  const grouped = groupByDate(filtered)

  const dateLabel = (dateStr) => {
    const d = parseISO(dateStr)
    if (isToday(d)) return '🔥 HOJE'
    if (isYesterday(d)) return '📅 ONTEM'
    return '📅 ' + format(d, "dd 'de' MMMM", { locale: ptBR }).toUpperCase()
  }

  const handleFav = (offerId) => {
    db.markViewed(user.email, offerId)
    db.toggleFavorite(user.email, offerId)
    setFavIds(db.getFavorites(user.email))
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.topBar}>
          <button style={styles.profileBtn} onClick={() => navigate('/perfil')}>
            <div style={styles.profileAvatar}>{(user?.email || 'U')[0].toUpperCase()}</div>
            <span>Meu Perfil</span>
          </button>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/') }}>Sair</button>
        </div>

        <img src="/logo.webp" alt="ScaleAds" style={styles.logo} />

        <div style={styles.socialRow}>
          {['✈️','📘','📸','🎵','▶️'].map((icon, i) => (
            <div key={i} style={styles.socialBtn}>{icon}</div>
          ))}
        </div>

        <h1 style={styles.heroTitle}>TOP OFERTAS ESCALADAS</h1>

        {newCount > 0 && (
          <div style={styles.newBadge}>🔥 {newCount} nova{newCount > 1 ? 's' : ''} oferta{newCount > 1 ? 's' : ''} hoje!</div>
        )}

        <div style={styles.filterBox}>
          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>📅 Data</span>
            <div style={styles.filterGroup}>
              {['HOJE', 'ONTEM', 'PERSONALIZADO'].map(d => (
                <button key={d}
                  style={{ ...styles.filterBtn, ...(dateFilter === d ? styles.filterOn : {}) }}
                  onClick={() => { setDateFilter(d); if (d !== 'PERSONALIZADO') setActiveFilters(f => ({ ...f, dateFilter: d, customDate: '' })) }}
                >{d}</button>
              ))}
            </div>
            {dateFilter === 'PERSONALIZADO' && (
              <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} style={styles.dateInput} />
            )}
          </div>

          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>🏷️ Categoria</span>
            <div style={styles.filterGroup}>
              {['TODAS', ...CATEGORIES].map(c => (
                <button key={c}
                  style={{ ...styles.filterBtn, ...(category === c ? styles.filterOn : {}) }}
                  onClick={() => setCategory(c)}
                >{c}</button>
              ))}
            </div>
          </div>

          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>🌎 País</span>
            <div style={styles.filterGroup}>
              <button style={{ ...styles.filterBtn, ...(country === 'TODOS' ? styles.filterOn : {}) }} onClick={() => setCountry('TODOS')}>TODOS</button>
              {COUNTRIES.map(c => (
                <button key={c.code}
                  style={{ ...styles.filterBtn, ...(country === c.code ? styles.filterOn : {}) }}
                  onClick={() => setCountry(c.code)}>{c.flag} {c.code}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <button style={styles.btnFilter} onClick={applyFilters}>🔍 FILTRAR</button>
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
              {items.map(o => (
                <OfferCard key={o.id} offer={o} isAdmin={false}
                  userEmail={user?.email}
                  isFav={favIds.includes(o.id)}
                  onFavoriteToggle={handleFav}
                />
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#6B21D6' },
  header: { textAlign: 'center', padding: '16px 24px 32px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  profileBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
    color: 'white', padding: '6px 14px', borderRadius: '20px',
    fontSize: '13px', fontFamily: 'Verdana', fontWeight: 700, cursor: 'pointer',
  },
  profileAvatar: {
    width: '24px', height: '24px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '12px', fontWeight: 900,
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
    color: 'rgba(255,255,255,0.7)', padding: '6px 14px', borderRadius: '20px',
    fontSize: '12px', fontFamily: 'Verdana', cursor: 'pointer',
  },
  logo: { width: '120px', marginBottom: '16px', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))' },
  socialRow: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' },
  socialBtn: {
    width: '50px', height: '50px', background: 'rgba(0,0,0,0.25)',
    borderRadius: '14px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '22px', cursor: 'pointer',
  },
  heroTitle: {
    fontFamily: 'Verdana, sans-serif', fontWeight: 700,
    fontSize: 'clamp(18px, 4vw, 38px)', color: 'white',
    letterSpacing: '0.04em', textTransform: 'uppercase',
    marginBottom: '12px', textShadow: '0 2px 16px rgba(0,0,0,0.3)',
  },
  newBadge: {
    display: 'inline-block', background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.4)', color: 'white',
    padding: '6px 20px', borderRadius: '20px', fontSize: '13px',
    fontFamily: 'Verdana', fontWeight: 700, marginBottom: '16px',
  },
  filterBox: {
    background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '16px 20px',
    maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px',
  },
  filterRow: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  filterLabel: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Verdana', fontSize: '12px', fontWeight: 700, minWidth: '90px', textAlign: 'left' },
  filterGroup: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  filterBtn: {
    padding: '6px 14px', border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '24px', background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.85)', fontSize: '11px',
    fontFamily: 'Verdana', fontWeight: 700, cursor: 'pointer',
  },
  filterOn: { background: 'white', borderColor: 'white', color: '#6B21D6' },
  dateInput: {
    background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.4)',
    borderRadius: '8px', padding: '5px 10px', color: 'white', fontSize: '12px', fontFamily: 'Verdana', outline: 'none',
  },
  btnFilter: {
    background: 'white', color: '#6B21D6', border: 'none',
    padding: '10px 36px', borderRadius: '24px', fontFamily: 'Verdana',
    fontWeight: 700, fontSize: '13px', cursor: 'pointer', letterSpacing: '0.05em',
  },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' },
  empty: { textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  group: { marginBottom: '48px' },
  dateDivider: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  dateLine: { flex: 1, height: '2px', background: 'rgba(255,255,255,0.25)', borderRadius: '1px' },
  dateLabel: { fontFamily: 'Verdana', fontWeight: 700, fontSize: '14px', color: 'white', letterSpacing: '0.06em', whiteSpace: 'nowrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
}
