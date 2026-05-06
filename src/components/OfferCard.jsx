import { useEffect, useRef } from 'react'
import { COUNTRIES } from '../lib/db'

export default function OfferCard({ offer, isAdmin, onEdit, onDelete, onPublish }) {
  const country = COUNTRIES.find(c => c.code === offer.country)
  const adsCount = parseInt(offer.adsCount) || 0
  const fillRef = useRef()

  useEffect(() => {
    const fill = fillRef.current
    if (!fill) return
    const pct = Math.min(100, Math.max(10, adsCount / 30))
    setTimeout(() => {
      fill.style.transition = 'width 1.2s ease'
      fill.style.width = pct + '%'
    }, 200)
  }, [adsCount])

  const getGradient = () => {
    const pct = Math.min(100, adsCount / 30)
    if (pct < 30) return 'linear-gradient(90deg, #22c55e, #86efac)'
    if (pct < 70) return 'linear-gradient(90deg, #f59e0b, #fcd34d)'
    return 'linear-gradient(90deg, #ef4444, #f97316)'
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

      <div style={styles.inner}>
        {offer.imageUrl && (
          <img src={offer.imageUrl} alt="oferta" style={styles.image} />
        )}

        <h2 style={styles.adsTitle}>🔥 {adsCount.toLocaleString('pt-BR')} anúncios ativos 🔥</h2>

        <div style={{ margin: '8px 0' }}>
          {country ? (
            <img
              src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
              alt={country.name}
              style={{ width: '40px', borderRadius: '3px' }}
            />
          ) : <span style={{ fontSize: '28px' }}>🌎</span>}
        </div>

        <p style={styles.scaleText}>🌡️ Escaladíssima!</p>

        <div style={styles.thermWrap}>
          <div style={styles.thermBg}>
            <div ref={fillRef} style={{ height: '100%', width: '0%', borderRadius: '15px', background: getGradient() }} />
          </div>
        </div>

        <div style={{ marginTop: '16px', width: '100%' }}>
          {offer.linkDirect ? (
            <a href={offer.linkDirect} target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: '10px' }}>
              <button style={styles.btnOrange}>ACESSAR AGORA</button>
            </a>
          ) : (
            <button style={{ ...styles.btnOrange, opacity: 0.5, marginBottom: '10px' }} disabled>ACESSAR AGORA</button>
          )}

          {offer.linkNoCloaker && (
            <a href={offer.linkNoCloaker} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
              <button style={styles.btnOrange}>ACESSAR PAGINA SEM CLOACKER</button>
            </a>
          )}
        </div>

        {offer.category && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            background: offer.category === 'NUTRA' ? '#dcfce7' : '#ede9fe',
            color: offer.category === 'NUTRA' ? '#15803d' : '#6d28d9',
            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
            fontFamily: 'Verdana, sans-serif',
          }}>{offer.category}</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: {
    fontFamily: 'Verdana, sans-serif',
    background: '#f9f9f9',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '0 auto',
    boxShadow: 'inset 0 0 20px #ccc, 0 6px 12px rgba(0,0,0,0.5), 0 10px 15px rgba(0,0,0,0.6)',
    border: '2px solid #444',
    overflow: 'hidden',
    position: 'relative',
  },
  adminBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 12px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb',
  },
  aBtn: {
    background: 'transparent', border: '1px solid #d1d5db', color: '#374151',
    padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
  },
  inner: {
    padding: '20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  image: {
    width: '100%', maxWidth: '300px', borderRadius: '8px', marginBottom: '10px',
  },
  adsTitle: {
    color: '#333', fontSize: '20px', fontWeight: 700, margin: '8px 0',
  },
  scaleText: {
    fontSize: '22px', color: '#ff4d4d', fontWeight: 700, margin: '10px 0 8px',
  },
  thermWrap: {
    width: '100%', maxWidth: '400px', padding: '0',
  },
  thermBg: {
    position: 'relative', width: '100%', height: '10px',
    background: '#e0e0e0', borderRadius: '20px', overflow: 'hidden',
  },
  btnOrange: {
    display: 'block', width: '100%', padding: '12px 40px',
    fontSize: '16px', color: '#fff', background: '#ff4d4d',
    border: 'none', borderRadius: '5px', fontWeight: 700,
    fontFamily: 'Verdana, sans-serif', cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
}
