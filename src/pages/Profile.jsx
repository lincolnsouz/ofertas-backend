import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { db, getMemberLevel, getDaysSince, LEVEL_CONFIG } from '../lib/db'
import OfferCard from '../components/OfferCard'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [streak, setStreak] = useState({ streak: 0 })
  const [favOffers, setFavOffers] = useState([])
  const [favIds, setFavIds] = useState([])
  const [tab, setTab] = useState('visao')
  const [vaultMonth, setVaultMonth] = useState(null)
  const [vaultOffers, setVaultOffers] = useState([])
  const [allMonths, setAllMonths] = useState([])

  useEffect(() => {
    if (!user) { navigate('/'); return }
    const m = db.getMember(user.email)
    setMember(m)
    const s = db.getStreak(user.email)
    setStreak(s)
    const ids = db.getFavorites(user.email)
    setFavIds(ids)
    const all = db.getPublishedOffers()
    setFavOffers(all.filter(o => ids.includes(o.id)))

    // build months from all offers
    const monthSet = {}
    all.forEach(o => {
      const d = (o.offerDate || o.createdAt).split('T')[0]
      const key = d.slice(0, 7) // YYYY-MM
      if (!monthSet[key]) monthSet[key] = []
      monthSet[key].push(o)
    })
    const sorted = Object.entries(monthSet).sort((a, b) => b[0].localeCompare(a[0]))
    setAllMonths(sorted)
    if (sorted.length > 0) {
      setVaultMonth(sorted[0][0])
      setVaultOffers(sorted[0][1])
    }
  }, [user])

  const level = member ? getMemberLevel(member.createdAt) : LEVEL_CONFIG[0]
  const days = member ? getDaysSince(member.createdAt) : 0
  const nextLevel = LEVEL_CONFIG[LEVEL_CONFIG.findIndex(l => l.name === level.name) + 1]
  const progressToNext = nextLevel
    ? Math.min(100, ((days - level.minDays) / (nextLevel.minDays - level.minDays)) * 100)
    : 100

  const viewedCount = db.getViewed(user?.email || '').length

  const handleFav = (offerId) => {
    db.toggleFavorite(user.email, offerId)
    const ids = db.getFavorites(user.email)
    setFavIds(ids)
    const all = db.getPublishedOffers()
    setFavOffers(all.filter(o => ids.includes(o.id)))
    // update vault too
    if (vaultMonth) {
      const monthOffers = allMonths.find(m => m[0] === vaultMonth)?.[1] || []
      setVaultOffers(monthOffers)
    }
  }

  const selectMonth = (key, offers) => {
    setVaultMonth(key)
    setVaultOffers(offers)
  }

  const monthLabel = (key) => {
    const [y, m] = key.split('-')
    const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${names[parseInt(m) - 1]} ${y}`
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerIn}>
          <button style={s.backBtn} onClick={() => navigate('/feed')}>← Feed</button>
          <img src="/logo.webp" alt="ScaleAds" style={{ height: '36px' }} />
          <button style={s.logoutBtn} onClick={() => { logout(); navigate('/') }}>Sair</button>
        </div>
      </header>

      {/* Hero do perfil */}
      <div style={s.hero}>
        <div style={s.heroGlow} />
        <div style={s.avatarWrap}>
          <div style={s.avatar}>{(user?.email || 'U')[0].toUpperCase()}</div>
          <div style={{ ...s.levelBadge, background: level.color }}>
            {level.emoji} {level.name}
          </div>
        </div>
        <div style={s.userName}>{member?.name || user?.email}</div>
        <div style={s.userEmail}>{member?.name ? user?.email : ''}</div>

        <div style={s.statsRow}>
          <div style={s.statBox}>
            <div style={s.statNum}>{days}</div>
            <div style={s.statLbl}>dias de membro</div>
          </div>
          <div style={s.statBox}>
            <div style={s.statNum}>{streak.streak}</div>
            <div style={s.statLbl}>🔥 streak</div>
          </div>
          <div style={s.statBox}>
            <div style={s.statNum}>{viewedCount}</div>
            <div style={s.statLbl}>ofertas vistas</div>
          </div>
          <div style={s.statBox}>
            <div style={s.statNum}>{favIds.length}</div>
            <div style={s.statLbl}>❤️ favoritas</div>
          </div>
        </div>

        {/* barra de nível */}
        <div style={s.levelBarWrap}>
          <div style={s.levelBarLabel}>
            <span style={{ color: level.color, fontWeight: 700 }}>{level.emoji} {level.name}</span>
            {nextLevel && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>→ {nextLevel.emoji} {nextLevel.name} em {nextLevel.minDays - days} dias</span>}
          </div>
          <div style={s.levelBarBg}>
            <div style={{ ...s.levelBarFill, width: progressToNext + '%', background: level.color }} />
          </div>
        </div>
      </div>

      {/* tabs */}
      <div style={s.tabs}>
        {[
          { key: 'visao', label: '📊 Visão Geral' },
          { key: 'favoritos', label: `❤️ Favoritos (${favIds.length})` },
          { key: 'vault', label: '🗄️ Arquivo' },
        ].map(t => (
          <button key={t.key} style={{ ...s.tab, ...(tab === t.key ? s.tabOn : {}) }} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <main style={s.main}>
        {tab === 'visao' && (
          <div style={s.visaoGrid}>
            {/* card de nível */}
            <div style={{ ...s.card, gridColumn: 'span 2' }}>
              <h3 style={s.cardTitle}>🏆 Jornada de Níveis</h3>
              <div style={s.levelsRow}>
                {LEVEL_CONFIG.map((l, i) => (
                  <div key={l.name} style={{
                    ...s.levelChip,
                    background: l.name === level.name ? l.color : '#f3f4f6',
                    color: l.name === level.name ? 'white' : '#9ca3af',
                    transform: l.name === level.name ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: l.name === level.name ? `0 4px 16px ${l.color}55` : 'none',
                  }}>
                    <div style={{ fontSize: '22px' }}>{l.emoji}</div>
                    <div style={{ fontSize: '11px', fontWeight: 700 }}>{l.name}</div>
                    <div style={{ fontSize: '10px', opacity: 0.7 }}>{l.minDays}+ dias</div>
                  </div>
                ))}
              </div>
            </div>

            {/* streak */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>🔥 Streak Atual</h3>
              <div style={{ fontSize: '56px', fontWeight: 900, color: '#f97316', fontFamily: 'Verdana', margin: '12px 0' }}>{streak.streak}</div>
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>dias consecutivos acessando</div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: streak.streak >= 7 ? '#16a34a' : '#9ca3af', fontWeight: 600 }}>
                {streak.streak >= 30 ? '🏆 Incrível! 30+ dias!' : streak.streak >= 7 ? '⚡ Ótimo ritmo! 7+ dias' : 'Continue acessando todo dia!'}
              </div>
            </div>

            {/* membro desde */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>📅 Membro desde</h3>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#6B21D6', margin: '12px 0' }}>
                {member ? new Date(member.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
              </div>
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>{days} dias de acesso</div>
              <div style={{ marginTop: '8px' }}>
                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: Math.min(100, (days / 365) * 100) + '%', background: 'linear-gradient(90deg, #6B21D6, #a855f7)', borderRadius: '3px', transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{Math.min(100, Math.round((days / 365) * 100))}% do primeiro ano</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'favoritos' && (
          <>
            {favOffers.length === 0
              ? <div style={s.empty}><div style={{ fontSize: '48px' }}>🤍</div><p>Você ainda não favoritou nenhuma oferta. Clique no coração nos cards!</p></div>
              : <div style={s.grid}>{favOffers.map(o => (
                  <OfferCard key={o.id} offer={o} isAdmin={false} userEmail={user?.email} isFav={favIds.includes(o.id)} onFavoriteToggle={handleFav} />
                ))}</div>
            }
          </>
        )}

        {tab === 'vault' && (
          <>
            <div style={s.vaultHeader}>
              <h3 style={s.cardTitle}>🗄️ Arquivo de Ofertas</h3>
              <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>Acesse todas as ofertas dos últimos 12 meses</p>
            </div>
            <div style={s.monthTabs}>
              {allMonths.map(([key, offers]) => (
                <button key={key}
                  style={{ ...s.monthBtn, ...(vaultMonth === key ? s.monthBtnOn : {}) }}
                  onClick={() => selectMonth(key, offers)}>
                  {monthLabel(key)}
                  <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '4px' }}>({offers.length})</span>
                </button>
              ))}
            </div>
            {vaultOffers.length === 0
              ? <div style={s.empty}><div style={{ fontSize: '48px' }}>📭</div><p>Nenhuma oferta neste mês.</p></div>
              : <div style={s.grid}>{vaultOffers.map(o => (
                  <OfferCard key={o.id} offer={o} isAdmin={false} userEmail={user?.email} isFav={favIds.includes(o.id)} onFavoriteToggle={handleFav} />
                ))}</div>
            }
          </>
        )}
      </main>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#f3f4f6' },
  header: { background: '#6B21D6', position: 'sticky', top: 0, zIndex: 100 },
  headerIn: { maxWidth: '1100px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontFamily: 'Verdana', fontWeight: 700, cursor: 'pointer' },
  logoutBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontFamily: 'Verdana', cursor: 'pointer' },
  hero: { background: 'linear-gradient(180deg, #6B21D6 0%, #5518B0 100%)', padding: '40px 24px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  heroGlow: { position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', top: '-100px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' },
  avatarWrap: { position: 'relative', display: 'inline-block', marginBottom: '12px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Verdana', fontWeight: 900, fontSize: '32px', color: 'white', margin: '0 auto' },
  levelBadge: { position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', padding: '2px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: 'white', fontFamily: 'Verdana', whiteSpace: 'nowrap' },
  userName: { fontFamily: 'Verdana', fontWeight: 700, fontSize: '20px', color: 'white', marginTop: '16px' },
  userEmail: { fontFamily: 'Verdana', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' },
  statsRow: { display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', flexWrap: 'wrap' },
  statBox: { background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 20px', minWidth: '80px' },
  statNum: { fontFamily: 'Verdana', fontWeight: 900, fontSize: '24px', color: 'white' },
  statLbl: { fontFamily: 'Verdana', fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' },
  levelBarWrap: { maxWidth: '500px', margin: '20px auto 0' },
  levelBarLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontFamily: 'Verdana', fontSize: '13px' },
  levelBarBg: { height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' },
  levelBarFill: { height: '100%', borderRadius: '4px', transition: 'width 1.2s ease' },
  tabs: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '0', borderBottom: '2px solid #e5e7eb', background: 'white' },
  tab: { padding: '14px 20px', border: 'none', borderBottom: '3px solid transparent', background: 'transparent', color: '#9ca3af', fontFamily: 'Verdana', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.15s' },
  tabOn: { color: '#6B21D6', borderBottomColor: '#6B21D6' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '28px 24px 60px' },
  visaoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  card: { background: 'white', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  cardTitle: { fontFamily: 'Verdana', fontWeight: 700, fontSize: '15px', color: '#111', marginBottom: '4px' },
  levelsRow: { display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  levelChip: { padding: '12px 16px', borderRadius: '12px', textAlign: 'center', minWidth: '80px', transition: 'all 0.3s', cursor: 'default' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontFamily: 'Verdana', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', fontSize: '14px' },
  vaultHeader: { marginBottom: '20px' },
  monthTabs: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' },
  monthBtn: { padding: '8px 18px', border: '2px solid #e5e7eb', borderRadius: '24px', background: 'white', color: '#6b7280', fontSize: '13px', fontFamily: 'Verdana', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' },
  monthBtnOn: { background: '#6B21D6', borderColor: '#6B21D6', color: 'white' },
}
