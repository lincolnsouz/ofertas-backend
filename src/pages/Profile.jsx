import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { db, getDaysSince } from '../lib/db'
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
    setStreak(db.getStreak(user.email))
    const ids = db.getFavorites(user.email)
    setFavIds(ids)
    const all = db.getPublishedOffers()
    setFavOffers(all.filter(o => ids.includes(o.id)))
    const monthSet = {}
    all.forEach(o => {
      const key = (o.offerDate || o.createdAt).split('T')[0].slice(0, 7)
      if (!monthSet[key]) monthSet[key] = []
      monthSet[key].push(o)
    })
    const sorted = Object.entries(monthSet).sort((a, b) => b[0].localeCompare(a[0]))
    setAllMonths(sorted)
    if (sorted.length > 0) { setVaultMonth(sorted[0][0]); setVaultOffers(sorted[0][1]) }
  }, [user])

  const days = member ? getDaysSince(member.createdAt) : 0
  const viewedCount = db.getViewed(user?.email || '').length

  // Subscription status
  const getSubStatus = () => {
    if (!member?.expiresAt) return { label: 'Ativo', color: '#16a34a', bg: '#dcfce7', daysLeft: null }
    const exp = new Date(member.expiresAt)
    const now = new Date()
    const daysLeft = Math.ceil((exp - now) / 86400000)
    if (daysLeft < 0) return { label: 'Vencido', color: '#dc2626', bg: '#fee2e2', daysLeft }
    if (daysLeft <= 7) return { label: `Vence em ${daysLeft}d`, color: '#d97706', bg: '#fef3c7', daysLeft }
    return { label: 'Ativo', color: '#16a34a', bg: '#dcfce7', daysLeft }
  }

  const sub = getSubStatus()

  const handleFav = (offerId) => {
    db.toggleFavorite(user.email, offerId)
    const ids = db.getFavorites(user.email)
    setFavIds(ids)
    setFavOffers(db.getPublishedOffers().filter(o => ids.includes(o.id)))
  }

  const selectMonth = (key, offers) => { setVaultMonth(key); setVaultOffers(offers) }

  const monthLabel = (key) => {
    const [y, m] = key.split('-')
    const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    return `${names[parseInt(m)-1]} ${y}`
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerIn}>
          <button style={s.backBtn} onClick={() => navigate('/feed')}>← Voltar ao Feed</button>
          <img src="/logo.webp" alt="ScaleAds" style={{ height: '34px' }} />
          <button style={s.logoutBtn} onClick={() => { logout(); navigate('/') }}>Sair</button>
        </div>
      </header>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.avatar}>{(member?.name || user?.email || 'U')[0].toUpperCase()}</div>
        <div style={s.userName}>{member?.name || user?.email}</div>
        {member?.name && <div style={s.userEmail}>{user?.email}</div>}
        <div style={s.statsRow}>
          <div style={s.statBox}>
            <div style={s.statNum}>{days}</div>
            <div style={s.statLbl}>dias de membro</div>
          </div>
          <div style={s.statBox}>
            <div style={s.statNum}>{streak.streak}🔥</div>
            <div style={s.statLbl}>streak</div>
          </div>
          <div style={s.statBox}>
            <div style={s.statNum}>{viewedCount}</div>
            <div style={s.statLbl}>ofertas vistas</div>
          </div>
          <div style={s.statBox}>
            <div style={s.statNum}>{favIds.length}❤️</div>
            <div style={s.statLbl}>favoritas</div>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div style={s.tabsWrap}>
        {[
          { key: 'visao', label: '👤 Perfil' },
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
            {/* Assinatura */}
            <div style={{ ...s.card, gridColumn: 'span 2' }}>
              <div style={s.cardHead}>
                <h3 style={s.cardTitle}>💳 Minha Assinatura</h3>
                <span style={{ ...s.subBadge, background: sub.bg, color: sub.color }}>{sub.label}</span>
              </div>
              <div style={s.subGrid}>
                <div style={s.subItem}>
                  <div style={s.subItemLabel}>Plano</div>
                  <div style={s.subItemVal}>ScaleAds Mensal</div>
                </div>
                <div style={s.subItem}>
                  <div style={s.subItemLabel}>Membro desde</div>
                  <div style={s.subItemVal}>
                    {member ? new Date(member.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                  </div>
                </div>
                <div style={s.subItem}>
                  <div style={s.subItemLabel}>Vencimento</div>
                  <div style={{ ...s.subItemVal, color: sub.color, fontWeight: 700 }}>
                    {member?.expiresAt
                      ? new Date(member.expiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'Sem vencimento definido'}
                  </div>
                </div>
                <div style={s.subItem}>
                  <div style={s.subItemLabel}>Valor</div>
                  <div style={s.subItemVal}>R$ 97,00 / mês</div>
                </div>
              </div>
              {sub.daysLeft !== null && sub.daysLeft >= 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                    <span>Tempo restante</span>
                    <span style={{ color: sub.color, fontWeight: 600 }}>{sub.daysLeft} dias</span>
                  </div>
                  <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: Math.min(100, (sub.daysLeft / 30) * 100) + '%', background: sub.color, borderRadius: '3px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              )}
              {sub.daysLeft !== null && sub.daysLeft < 0 && (
                <div style={{ marginTop: '12px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>
                  ⚠️ Sua assinatura venceu. Renove para continuar acessando as ofertas.
                </div>
              )}
            </div>

            {/* streak */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>🔥 Streak Atual</h3>
              <div style={s.bigNum}>{streak.streak}</div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>dias consecutivos</div>
              <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: 600, color: streak.streak >= 7 ? '#16a34a' : '#9ca3af' }}>
                {streak.streak >= 30 ? '🏆 Incrível! 30+ dias!' : streak.streak >= 7 ? '⚡ Ótimo ritmo!' : 'Acesse todo dia para aumentar!'}
              </div>
            </div>

            {/* atividade */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>📊 Atividade</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <div style={s.actRow}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Ofertas visualizadas</span>
                  <span style={{ fontWeight: 700, color: '#111' }}>{viewedCount}</span>
                </div>
                <div style={s.actRow}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Ofertas favoritas</span>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}>{favIds.length} ❤️</span>
                </div>
                <div style={s.actRow}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Dias de membro</span>
                  <span style={{ fontWeight: 700, color: '#6B21D6' }}>{days}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'favoritos' && (
          favOffers.length === 0
            ? <div style={s.empty}><div style={{ fontSize: '48px' }}>🤍</div><p>Nenhuma oferta favoritada ainda. Clique no ❤️ nos cards!</p></div>
            : <div style={s.grid}>{favOffers.map(o => (
                <OfferCard key={o.id} offer={o} isAdmin={false} userEmail={user?.email} isFav={favIds.includes(o.id)} onFavoriteToggle={handleFav} />
              ))}</div>
        )}

        {tab === 'vault' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ ...s.cardTitle, fontSize: '18px', color: '#111' }}>🗄️ Arquivo de Ofertas</h3>
              <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>Acesse todas as ofertas dos últimos 12 meses</p>
            </div>
            <div style={s.monthTabs}>
              {allMonths.map(([key, offers]) => (
                <button key={key}
                  style={{ ...s.monthBtn, ...(vaultMonth === key ? s.monthBtnOn : {}) }}
                  onClick={() => selectMonth(key, offers)}>
                  {monthLabel(key)} <span style={{ opacity: 0.6, fontSize: '11px' }}>({offers.length})</span>
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
  page: { minHeight: '100vh', background: '#f3f4f6', fontFamily: "'DM Sans', sans-serif" },
  header: { background: '#6B21D6', position: 'sticky', top: 0, zIndex: 100 },
  headerIn: { maxWidth: '1100px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: 'pointer' },
  logoutBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' },
  hero: { background: 'linear-gradient(180deg, #6B21D6 0%, #5518B0 100%)', padding: '40px 24px 32px', textAlign: 'center' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: '32px', color: 'white', margin: '0 auto 12px' },
  userName: { fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: '20px', color: 'white' },
  userEmail: { fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' },
  statsRow: { display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px', flexWrap: 'wrap' },
  statBox: { background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 20px', minWidth: '80px' },
  statNum: { fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: '22px', color: 'white' },
  statLbl: { fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' },
  tabsWrap: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'flex', borderBottom: '2px solid #e5e7eb', background: 'white' },
  tab: { padding: '14px 20px', border: 'none', borderBottom: '3px solid transparent', background: 'transparent', color: '#9ca3af', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '14px', cursor: 'pointer', marginBottom: '-2px' },
  tabOn: { color: '#6B21D6', borderBottomColor: '#6B21D6' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '28px 24px 60px' },
  visaoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  card: { background: 'white', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  cardTitle: { fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: '15px', color: '#111' },
  subBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 },
  subGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  subItem: { display: 'flex', flexDirection: 'column', gap: '3px' },
  subItemLabel: { fontSize: '11px', color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' },
  subItemVal: { fontSize: '14px', color: '#111', fontWeight: 500 },
  bigNum: { fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: '52px', color: '#f97316', lineHeight: 1 },
  actRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', fontSize: '14px' },
  monthTabs: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' },
  monthBtn: { padding: '8px 18px', border: '2px solid #e5e7eb', borderRadius: '24px', background: 'white', color: '#6b7280', fontSize: '13px', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: 'pointer' },
  monthBtnOn: { background: '#6B21D6', borderColor: '#6B21D6', color: 'white' },
}
