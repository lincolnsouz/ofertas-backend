import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Login() {
  const [tab, setTab] = useState('member')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginAdmin, loginMember } = useAuth()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 600))
    const ok = tab === 'admin'
      ? loginAdmin(email, password)
      : loginMember(email, password)
    if (ok) {
      navigate(tab === 'admin' ? '/admin' : '/feed')
    } else {
      setError(tab === 'admin' ? 'Credenciais inválidas.' : 'Email ou senha incorretos, ou assinatura inativa.')
    }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⚡</div>
          <span style={styles.logoText}>SCALE<span style={{color:'#9d5cf7'}}>ADS</span></span>
        </div>
        <p style={styles.sub}>Top ofertas escaladas todo dia</p>

        <div style={styles.tabs}>
          <button
            style={{...styles.tabBtn, ...(tab==='member' ? styles.tabActive : {})}}
            onClick={() => { setTab('member'); setError('') }}
          >Membro</button>
          <button
            style={{...styles.tabBtn, ...(tab==='admin' ? styles.tabActive : {})}}
            onClick={() => { setTab('admin'); setError('') }}
          >Admin</button>
        </div>

        <form onSubmit={handle} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" className="btn-primary" style={{width:'100%', padding:'14px', fontSize:'15px', marginTop:'4px'}} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {tab === 'member' && (
          <p style={styles.join}>
            Não é membro?{' '}
            <a href="https://lastlink.com" target="_blank" rel="noreferrer" style={{color:'#9d5cf7'}}>
              Assine por R$97/mês →
            </a>
          </p>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  glow: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'var(--card)',
    border: '1px solid var(--border2)',
    borderRadius: '20px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    zIndex: 1,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: '28px' },
  logoText: {
    fontFamily: 'var(--font-head)',
    fontWeight: 800,
    fontSize: '26px',
    letterSpacing: '0.06em',
    color: 'var(--text)',
  },
  sub: {
    textAlign: 'center',
    color: 'var(--text3)',
    fontSize: '13px',
    marginBottom: '28px',
  },
  tabs: {
    display: 'flex',
    background: 'var(--bg3)',
    borderRadius: 'var(--radius-sm)',
    padding: '4px',
    marginBottom: '24px',
  },
  tabBtn: {
    flex: 1,
    padding: '8px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text3)',
    fontFamily: 'var(--font-head)',
    fontWeight: 600,
    fontSize: '13px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'var(--card)',
    color: 'var(--text)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: 'var(--text2)', fontWeight: 500, letterSpacing: '0.03em' },
  input: {
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '11px 14px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
  },
  join: {
    textAlign: 'center',
    color: 'var(--text3)',
    fontSize: '13px',
    marginTop: '20px',
  },
}
