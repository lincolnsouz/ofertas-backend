import { COUNTRIES } from '../lib/db'

export default function OfferCard({ offer, isAdmin, onEdit, onDelete, onPublish }) {
  const country = COUNTRIES.find(c => c.code === offer.country)

  return (
    <div style={styles.card}>
      {isAdmin && (
        <div style={styles.adminBar}>
          <span style={{
            ...styles.statusBadge,
            background: offer.published ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.12)',
            color: offer.published ? '#22c55e' : '#f97316',
            border: `1px solid ${offer.published ? 'rgba(34,197,94,0.2)' : 'rgba(249,115,22,0.2)'}`,
          }}>
            {offer.published ? '● Publicado' : '○ Rascunho'}
          </span>
          <div style={styles.adminActions}>
            <button style={styles.adminBtn} onClick={() => onPublish(offer)}>
              {offer.published ? 'Despublicar' : 'Publicar'}
            </button>
            <button style={styles.adminBtn} onClick={() => onEdit(offer)}>Editar</button>
            <button style={{...styles.adminBtn, color:'#f87171'}} onClick={() => onDelete(offer.id)}>Excluir</button>
          </div>
        </div>
      )}

      <div style={styles.imageWrap}>
        {offer.imageUrl ? (
          <img src={offer.imageUrl} alt={offer.title} style={styles.image} />
        ) : (
          <div style={styles.imagePlaceholder}>
            <span style={{fontSize:'32px'}}>📊</span>
          </div>
        )}
        <div style={styles.categoryBadge} className={`badge badge-${offer.category === 'NUTRA' ? 'nutra' : 'info'}`}>
          {offer.category}
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.stats}>
          <span style={styles.fire}>🔥 {offer.adsCount?.toLocaleString()} anúncios ativos 🔥</span>
          <span style={styles.flag}>{country?.flag || '🌎'}</span>
        </div>

        <div style={styles.scaleBadge}>
          <span style={{color:'#f97316', fontSize:'13px'}}>🚀</span>
          <span style={styles.scaleText}>Escaladíssima!</span>
        </div>

        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: Math.min(100, (offer.adsCount / 30)) + '%'}} />
        </div>

        <div style={styles.buttons}>
          <a href={offer.linkDirect} target="_blank" rel="noreferrer">
            <button className="btn-orange" style={{marginBottom:'8px'}}>ACESSAR AGORA</button>
          </a>
          {offer.linkNoCloaker && (
            <a href={offer.linkNoCloaker} target="_blank" rel="noreferrer">
              <button className="btn-ghost">ACESSAR SEM CLOACKER</button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'border-color 0.2s, transform 0.2s',
    display: 'flex',
    flexDirection: 'column',
  },
  adminBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: 'var(--bg3)',
    borderBottom: '1px solid var(--border)',
    gap: '8px',
    flexWrap: 'wrap',
  },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: 'var(--font-head)',
    letterSpacing: '0.04em',
  },
  adminActions: { display: 'flex', gap: '8px' },
  adminBtn: {
    background: 'transparent',
    border: '1px solid var(--border2)',
    color: 'var(--text2)',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'var(--font-head)',
    fontWeight: 600,
    transition: 'all 0.15s',
  },
  imageWrap: {
    position: 'relative',
    background: 'var(--bg2)',
    height: '200px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg3)',
  },
  categoryBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
  },
  body: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
  stats: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  fire: { fontSize: '13px', color: 'var(--text)', fontWeight: 500 },
  flag: { fontSize: '22px' },
  scaleBadge: { display: 'flex', alignItems: 'center', gap: '6px' },
  scaleText: {
    fontFamily: 'var(--font-head)',
    fontWeight: 700,
    fontSize: '15px',
    color: '#f97316',
    letterSpacing: '0.02em',
  },
  progressBar: {
    height: '4px',
    background: 'var(--bg3)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #22c55e, #86efac)',
    borderRadius: '2px',
    minWidth: '20%',
  },
  buttons: { marginTop: '4px' },
}
