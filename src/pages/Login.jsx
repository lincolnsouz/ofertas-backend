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
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 500))
    const ok = tab === 'admin' ? loginAdmin(email, password) : loginMember(email, password)
    if (ok) navigate(tab === 'admin' ? '/admin' : '/feed')
    else setError(tab === 'admin' ? 'Credenciais inválidas.' : 'Email ou senha incorretos, ou assinatura inativa.')
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.logoWrap}>
        <img src="/logo.webp" alt="ScaleAds" style={styles.logo} />
        <p style={styles.sub}>Top ofertas escaladas todo dia</p>
      </div>

      <div style={styles.card}>
        <div style={styles.tabs}>
          <button style={{ ...styles.tabBtn, ...(tab === 'member' ? styles.tabOn : {}) }}
            onClick={() => { setTab('member'); setError('') }}>Área do Membro</button>
          <button style={{ ...styles.tabBtn, ...(tab === 'admin' ? styles.tabOn : {}) }}
            onClick={() => { setTab('admin'); setError('') }}>Admin</button>
        </div>

        <form onSubmit={handle} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" required style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required style={styles.input} />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" style={styles.btnSubmit} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {tab === 'member' && (
          <p style={styles.join}>
            Ainda não é membro?{' '}
            <a href="https://lastlink.com" target="_blank" rel="noreferrer"
              style={{ color: '#6B21D6', fontWeight: 700 }}>
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
    minHeight: '100vh', background: '#6B21D6',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '24px',
  },
  logoWrap: { textAlign: 'center', marginBottom: '28px' },
  logo: { width: '130px', filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginTop: '8px', fontFamily: 'Verdana' },
  card: {
    background: 'white', borderRadius: '20px', padding: '32px 28px',
    width: '100%', maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  tabs: {
    display: 'flex', gap: '4px', background: '#f3f4f6',
    borderRadius: '10px', padding: '4px', marginBottom: '24px',
  },
  tabBtn: {
    flex: 1, padding: '9px', border: 'none', background: 'transparent',
    color: '#9ca3af', fontFamily: 'Verdana', fontWeight: 700,
    fontSize: '12px', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.2s',
  },
  tabOn: { background: 'white', color: '#6B21D6', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', color: '#374151', fontWeight: 700, fontFamily: 'Verdana' },
  input: {
    background: '#f9fafb', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', padding: '11px 14px',
    color: '#111', fontSize: '14px', outline: 'none',
  },
  error: {
    background: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', fontWeight: 600,
  },
  btnSubmit: {
    background: 'linear-gradient(180deg, #7B2FE8 0%, #5518B0 100%)',
    color: 'white', border: 'none', padding: '14px',
    borderRadius: '10px', fontSize: '15px', fontWeight: 700,
    fontFamily: 'Verdana', cursor: 'pointer', marginTop: '4px',
    boxShadow: '0 4px 16px rgba(107,33,214,0.4)',
  },
  join: { textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '20px', fontFamily: 'Verdana' },
}
