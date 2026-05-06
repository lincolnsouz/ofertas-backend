import { useEffect, useRef, useState } from 'react'
import { COUNTRIES } from '../lib/db'

const FORMAT_CONFIG = {
  'VSL': { icon: '🎥', color: '#dc2626', bg: '#fee2e2', label: 'VSL' },
  'PÁGINA DE VENDAS': { icon: '📄', color: '#0891b2', bg: '#e0f2fe', label: 'PÁG. VENDAS' },
  'QUIZ': { icon: '🧠', color: '#7c3aed', bg: '#ede9fe', label: 'QUIZ' },
}

export default function OfferCard({ offer, isAdmin, onEdit, onDelete, onPublish, userEmail, onFavoriteToggle, isFav }) {
  const country = COUNTRIES.find(c => c.code === offer.country)
  const adsCount = parseInt(offer.adsCount) || 0
  const fillRef = useRef()
  const [fav, setFav] = useState(isFav || false)
  const fmt = FORMAT_CONFIG[offer.format] || null

  useEffect(() => setFav(isFav || false), [isFav])

  useEffect(() => {
    const fill = fillRef.current
    if (!fill) return
    const pct = Math.min(100, Math.max(10, adsCount / 30))
    setTimeout(() => {
      fill.style.transition = 'width 1.2s ease'
      fill.style.width = pct + '%'
    }, 300)
  }, [adsCount])

  const getGradient = () => {
    const pct = Math.min(100, adsCount / 30)
    if (pct < 30) return 'linear-gradient(90deg, #22c55e, #86efac)'
    if (pct < 70) return 'linear-gradient(90deg, #f59e0b, #fcd34d)'
    return 'linear-gradient(90deg, #ef4444, #f97316)'
  }

  const handleFav = () => {
    setFav(!fav)
    if (onFavoriteToggle) onFavoriteToggle(offer.id)
  }

  return (
    <div style={styles.card}>
      {isAdmin && (
        <div style={styles.adminBar}>
          <span style={{ color: offer.published ? '#16a34a' : '#d97706', fontSize: '12px', fontWeight: 700 }}>
            {offer.published ? '● Publicado' : '○ Rascunho'}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button style={styles.aBtn} onClick={() => onPublish(offer)}>{offer.published ? 'Despublicar' : 'Publicar'}</button>
            <button style={styles.aBtn} onClick={() => onEdit(offer)}>Editar</button>
            <button style={{ ...styles.aBtn, color: '#dc2626' }} onClick={() => onDelete(offer.id)}>✕</button>
          </div>
        </div>
      )}

      <div style={styles.imageWrap}>
        {offer.imageUrl
          ? <img src={offer.imageUrl} alt="oferta" style={styles.image} />
          : <div style={styles.noImg}><span style={{ fontSize: '40px' }}>📊</span></div>
        }

        {/* badges top */}
        <div style={styles.topBadges}>
          {offer.category && (
            <span style={{
              ...styles.badge,
              background: offer.category === 'NUTRA' ? '#dcfce7' : '#ede9fe',
              color: offer.category === 'NUTRA' ? '#15803d' : '#6d28d9',
            }}>{offer.category}</span>
          )}
          {fmt && (
            <span style={{ ...styles.badge, background: fmt.bg, color: fmt.color }}>
              {fmt.icon} {fmt.label}
            </span>
          )}
        </div>

        {/* fav button */}
        {!isAdmin && (
          <button style={styles.favBtn} onClick={handleFav} title={fav ? 'Remover favorito' : 'Favoritar'}>
            {fav ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      <div style={styles.body}>
        <div style={styles.adsRow}>
          <span style={styles.adsText}>🔥 {adsCount.toLocaleString('pt-BR')} anúncios ativos 🔥</span>
          {country
            ? <img src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} alt={country.name} style={{ width: '36px', borderRadius: '3px' }} />
            : <span style={{ fontSize: '26px' }}>🌎</span>
          }
        </div>

        <p style={styles.scaleText}>🌡️ Escaladíssima!</p>

        <div style={styles.thermBg}>
          <div ref={fillRef} style={{ height: '100%', width: '0%', borderRadius: '15px', background: getGradient() }} />
        </div>

        <div style={{ marginTop: '14px' }}>
          {offer.linkDirect
            ? <a href={offer.linkDirect} target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: '8px' }}>
                <button style={styles.btnOrange}>ACESSAR AGORA</button>
              </a>
            : <button style={{ ...styles.btnOrange, opacity: 0.4, marginBottom: '8px' }} disabled>ACESSAR AGORA</button>
          }
          {offer.linkNoCloaker && (
            <a href={offer.linkNoCloaker} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
              <button style={styles.btnOrange}>ACESSAR PAGINA SEM CLOACKER</button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    fontFamily: "'DM Sans', sans-serif",
    background: '#f9f9f9',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: 'inset 0 0 20px #ccc, 0 6px 12px rgba(0,0,0,0.5), 0 10px 15px rgba(0,0,0,0.6)',
    border: '2px solid #444',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  adminBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 12px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb',
  },
  aBtn: {
    background: 'transparent', border: '1px solid #d1d5db', color: '#374151',
    padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
  },
  imageWrap: {
    position: 'relative', background: '#e5e7eb',
    height: '220px', overflow: 'hidden',
  },
  image: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' },
  noImg: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' },
  topBadges: { position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' },
  badge: {
    padding: '3px 9px', borderRadius: '20px', fontSize: '10px',
    fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.03em',
  },
  favBtn: {
    position: 'absolute', top: '10px', right: '10px',
    background: 'rgba(255,255,255,0.85)', border: 'none',
    borderRadius: '50%', width: '36px', height: '36px',
    fontSize: '18px', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  body: { padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 },
  adsRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  adsText: { fontSize: '14px', fontWeight: 700, color: '#1a1a1a' },
  scaleText: { fontSize: '20px', color: '#ff4d4d', fontWeight: 700 },
  thermBg: { width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '20px', overflow: 'hidden' },
  btnOrange: {
    display: 'block', width: '100%', padding: '12px 20px',
    fontSize: '14px', color: '#fff', background: '#ff4d4d',
    border: 'none', borderRadius: '5px', fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
  },
}
