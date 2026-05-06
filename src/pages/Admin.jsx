import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { db, CATEGORIES, COUNTRIES } from '../lib/db'
import OfferCard from '../components/OfferCard'

const EMPTY_OFFER = { title: '', imageUrl: '', adsCount: '', country: 'US', category: 'NUTRA', linkDirect: '', linkNoCloaker: '' }

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('ofertas')
  const [offers, setOffers] = useState([])
  const [members, setMembers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_OFFER)
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '' })
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return }
    reload()
  }, [user])

  const reload = () => {
    setOffers(db.getOffers())
    setMembers(db.getMembers())
  }

  const openNew = () => { setForm(EMPTY_OFFER); setEditing(null); setShowForm(true) }
  const openEdit = (o) => { setForm({...o}); setEditing(o.id); setShowForm(true) }

  const saveOffer = () => {
    if (!form.linkDirect) { alert('Link direto é obrigatório'); return }
    if (editing) {
      db.updateOffer(editing, form)
    } else {
      db.addOffer(form)
    }
    setShowForm(false)
    reload()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const deleteOffer = (id) => {
    if (!confirm('Excluir esta oferta?')) return
    db.deleteOffer(id)
    reload()
  }

  const togglePublish = (o) => {
    if (o.published) db.unpublishOffer(o.id)
    else db.publishOffer(o.id)
    reload()
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm(f => ({...f, imageUrl: ev.target.result}))
    reader.readAsDataURL(file)
  }

  const addMember = () => {
    if (!newMember.email || !newMember.password) { alert('Email e senha obrigatórios'); return }
    db.addMember(newMember)
    setNewMember({ name: '', email: '', password: '' })
    reload()
  }

  const stats = {
    total: offers.length,
    published: offers.filter(o => o.published).length,
    drafts: offers.filter(o => !o.published).length,
    members: members.filter(m => m.active).length,
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span>⚡</span>
            <span style={styles.logoText}>SCALE<span style={{color:'#9d5cf7'}}>ADS</span></span>
            <span style={styles.adminTag}>ADMIN</span>
          </div>
          <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
            {saved && <span style={{fontSize:'13px', color:'#22c55e'}}>✓ Salvo</span>}
            <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/') }}>Sair</button>
          </div>
        </div>
      </header>

      <div style={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total, color: '#9d5cf7' },
          { label: 'Publicadas', value: stats.published, color: '#22c55e' },
          { label: 'Rascunhos', value: stats.drafts, color: '#f97316' },
          { label: 'Membros ativos', value: stats.members, color: '#38bdf8' },
        ].map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={{...styles.statValue, color: s.color}}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.tabs}>
        {['ofertas', 'membros'].map(t => (
          <button key={t} style={{...styles.tabBtn, ...(tab===t?styles.tabActive:{})}} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <main style={styles.main}>
        {tab === 'ofertas' && (
          <>
            <div style={styles.actionRow}>
              <h2 style={styles.sectionTitle}>Gerenciar Ofertas</h2>
              <button className="btn-primary" onClick={openNew}>+ Nova Oferta</button>
            </div>

            {showForm && (
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>{editing ? 'Editar Oferta' : 'Nova Oferta'}</h3>
                <div style={styles.formGrid}>
                  <div style={styles.field}>
                    <label style={styles.label}>Imagem (screenshot)</label>
                    <div style={styles.imageUploadArea} onClick={() => fileRef.current.click()}>
                      {form.imageUrl ? (
                        <img src={form.imageUrl} alt="" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'8px'}} />
                      ) : (
                        <div style={{textAlign:'center', color:'var(--text3)'}}>
                          <div style={{fontSize:'32px', marginBottom:'8px'}}>📸</div>
                          <div style={{fontSize:'13px'}}>Clique para fazer upload</div>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageUpload} />
                    <div style={{marginTop:'6px'}}>
                      <label style={{...styles.label, marginBottom:'3px', display:'block'}}>Ou cole uma URL</label>
                      <input style={styles.input} value={form.imageUrl} onChange={e => setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://..." />
                    </div>
                  </div>

                  <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                    <div style={styles.field}>
                      <label style={styles.label}>Nº de anúncios ativos</label>
                      <input style={styles.input} type="number" value={form.adsCount} onChange={e => setForm(f=>({...f,adsCount:e.target.value}))} placeholder="2400" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Categoria</label>
                      <select style={styles.input} value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>País</label>
                      <select style={styles.input} value={form.country} onChange={e => setForm(f=>({...f,country:e.target.value}))}>
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                      </select>
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Link direto *</label>
                      <input style={styles.input} value={form.linkDirect} onChange={e => setForm(f=>({...f,linkDirect:e.target.value}))} placeholder="https://..." />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Link sem cloacker (opcional)</label>
                      <input style={styles.input} value={form.linkNoCloaker} onChange={e => setForm(f=>({...f,linkNoCloaker:e.target.value}))} placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button className="btn-primary" onClick={saveOffer}>
                    {editing ? 'Salvar alterações' : 'Criar oferta'}
                  </button>
                  <button style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
                </div>
              </div>
            )}

            <div style={styles.grid}>
              {offers.length === 0 ? (
                <div style={styles.empty}>Nenhuma oferta ainda. Crie a primeira!</div>
              ) : offers.map(o => (
                <OfferCard
                  key={o.id}
                  offer={o}
                  isAdmin={true}
                  onEdit={openEdit}
                  onDelete={deleteOffer}
                  onPublish={togglePublish}
                />
              ))}
            </div>
          </>
        )}

        {tab === 'membros' && (
          <>
            <div style={styles.actionRow}>
              <h2 style={styles.sectionTitle}>Membros</h2>
            </div>

            <div style={styles.memberFormCard}>
              <h3 style={{...styles.formTitle, marginBottom:'16px'}}>Adicionar membro manualmente</h3>
              <div style={styles.memberFormRow}>
                <input style={styles.input} placeholder="Nome" value={newMember.name} onChange={e => setNewMember(m=>({...m,name:e.target.value}))} />
                <input style={styles.input} placeholder="Email" type="email" value={newMember.email} onChange={e => setNewMember(m=>({...m,email:e.target.value}))} />
                <input style={styles.input} placeholder="Senha" type="text" value={newMember.password} onChange={e => setNewMember(m=>({...m,password:e.target.value}))} />
                <button className="btn-primary" style={{whiteSpace:'nowrap'}} onClick={addMember}>+ Adicionar</button>
              </div>
            </div>

            <div style={styles.memberList}>
              {members.length === 0 ? (
                <div style={styles.empty}>Nenhum membro cadastrado.</div>
              ) : members.map(m => (
                <div key={m.id} style={styles.memberItem}>
                  <div style={styles.memberAvatar}>{(m.name||m.email)[0].toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:500, fontSize:'14px'}}>{m.name || '—'}</div>
                    <div style={{fontSize:'12px', color:'var(--text3)'}}>{m.email}</div>
                  </div>
                  <div style={{fontSize:'12px', color:'var(--text3)'}}>
                    {new Date(m.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <span style={{
                    padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:600,
                    fontFamily:'var(--font-head)',
                    background: m.active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                    color: m.active ? '#22c55e' : '#f87171',
                    border: `1px solid ${m.active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}>{m.active ? 'Ativo' : 'Inativo'}</span>
                  <div style={{display:'flex', gap:'6px'}}>
                    <button style={styles.memberBtn} onClick={() => { db.toggleMember(m.id); reload() }}>
                      {m.active ? 'Suspender' : 'Ativar'}
                    </button>
                    <button style={{...styles.memberBtn, color:'#f87171'}} onClick={() => { if(confirm('Excluir membro?')) { db.deleteMember(m.id); reload() } }}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg)' },
  header: { background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoText: { fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '20px', letterSpacing: '0.06em' },
  adminTag: { background: 'rgba(124,58,237,0.15)', color: '#9d5cf7', border: '1px solid rgba(124,58,237,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-head)', fontWeight: 700, letterSpacing: '0.08em' },
  logoutBtn: { background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-head)', fontWeight: 600 },
  statsRow: { maxWidth: '1200px', margin: '0 auto', padding: '24px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  statCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' },
  statValue: { fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '28px' },
  statLabel: { fontSize: '12px', color: 'var(--text3)', marginTop: '2px' },
  tabs: { maxWidth: '1200px', margin: '20px auto 0', padding: '0 24px', display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)' },
  tabBtn: { padding: '10px 20px', border: 'none', borderBottom: '2px solid transparent', background: 'transparent', color: 'var(--text3)', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '14px', transition: 'all 0.15s', cursor: 'pointer' },
  tabActive: { color: 'var(--purple2)', borderBottomColor: 'var(--purple2)' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
  actionRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  sectionTitle: { fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '18px' },
  formCard: { background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '24px', marginBottom: '24px' },
  formTitle: { fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '16px', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: 'var(--text2)', fontWeight: 500 },
  input: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', width: '100%' },
  imageUploadArea: { height: '160px', background: 'var(--bg3)', border: '1px dashed var(--border2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  formActions: { display: 'flex', gap: '12px', marginTop: '20px', alignItems: 'center' },
  cancelBtn: { background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', padding: '10px 20px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontFamily: 'var(--font-head)', fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  empty: { color: 'var(--text3)', fontSize: '14px', padding: '40px', textAlign: 'center', gridColumn: '1/-1' },
  memberFormCard: { background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '20px', marginBottom: '20px' },
  memberFormRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' },
  memberList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  memberItem: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' },
  memberAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(124,58,237,0.2)', color: '#9d5cf7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '14px', flexShrink: 0 },
  memberBtn: { background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-head)', fontWeight: 600 },
}
