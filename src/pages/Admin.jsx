import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { db, CATEGORIES, COUNTRIES, FORMATS } from '../lib/db'
import OfferCard from '../components/OfferCard'

const EMPTY = { title: '', imageUrl: '', adsCount: '', country: 'US', category: 'NUTRA', format: 'VSL', linkDirect: '', linkNoCloaker: '', offerDate: new Date().toISOString().split('T')[0] }

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('ofertas')
  const [offers, setOffers] = useState([])
  const [members, setMembers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', expiresAt: '' })
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return }
    reload()
  }, [user])

  const reload = () => { setOffers(db.getOffers()); setMembers(db.getMembers()) }

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true) }
  const openEdit = (o) => { setForm({...o, offerDate: o.offerDate || o.createdAt.split('T')[0]}); setEditing(o.id); setShowForm(true) }

  const saveOffer = () => {
    if (!form.linkDirect) { alert('Link direto é obrigatório'); return }
    if (editing) db.updateOffer(editing, form)
    else db.addOffer(form)
    setShowForm(false); reload()
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const deleteOffer = (id) => { if (confirm('Excluir oferta?')) { db.deleteOffer(id); reload() } }
  const togglePublish = (o) => { o.published ? db.unpublishOffer(o.id) : db.publishOffer(o.id); reload() }

  const handleImage = (e) => {
    const file = e.target.files[0]; if (!file) return
    const r = new FileReader()
    r.onload = ev => setForm(f => ({...f, imageUrl: ev.target.result}))
    r.readAsDataURL(file)
  }

  const addMember = () => {
    if (!newMember.email || !newMember.password) { alert('Email e senha obrigatórios'); return }
    db.addMember(newMember); setNewMember({ name: '', email: '', password: '', expiresAt: '' }); reload()
  }

  const stats = {
    total: offers.length,
    published: offers.filter(o => o.published).length,
    drafts: offers.filter(o => !o.published).length,
    members: members.filter(m => m.active).length,
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerIn}>
          <div style={s.logo}>⚡ SCALEADS <span style={s.adminTag}>ADMIN</span></div>
          <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
            {saved && <span style={{fontSize:'13px',color:'#16a34a',fontWeight:600}}>✓ Salvo!</span>}
            <button style={s.logoutBtn} onClick={() => { logout(); navigate('/') }}>Sair</button>
          </div>
        </div>
      </header>

      <div style={s.statsRow}>
        {[
          {label:'Total de ofertas', value:stats.total, color:'#7B2FE8'},
          {label:'Publicadas', value:stats.published, color:'#16a34a'},
          {label:'Rascunhos', value:stats.drafts, color:'#d97706'},
          {label:'Membros ativos', value:stats.members, color:'#0891b2'},
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={{...s.statVal, color:st.color}}>{st.value}</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      <div style={s.tabs}>
        {['ofertas','membros'].map(t => (
          <button key={t} style={{...s.tabBtn, ...(tab===t?s.tabActive:{})}} onClick={() => setTab(t)}>
            {t === 'ofertas' ? '📊 Ofertas' : '👥 Membros'}
          </button>
        ))}
      </div>

      <main style={s.main}>
        {tab === 'ofertas' && (
          <>
            <div style={s.actionRow}>
              <h2 style={s.sectionTitle}>Gerenciar Ofertas</h2>
              <button className="btn-primary" onClick={openNew} style={{borderRadius:'8px'}}>+ Nova Oferta</button>
            </div>

            {showForm && (
              <div style={s.formCard}>
                <h3 style={s.formTitle}>{editing ? 'Editar Oferta' : 'Nova Oferta'}</h3>
                <div style={s.formGrid}>
                  <div>
                    <label style={s.label}>Imagem (screenshot)</label>
                    <div style={s.imgUpload} onClick={() => fileRef.current.click()}>
                      {form.imageUrl
                        ? <img src={form.imageUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'8px'}} />
                        : <div style={{textAlign:'center',color:'#9ca3af'}}><div style={{fontSize:'36px',marginBottom:'6px'}}>📸</div><div style={{fontSize:'12px'}}>Clique para upload</div></div>
                      }
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImage} />
                    <div style={{marginTop:'8px'}}>
                      <label style={s.label}>Ou cole URL da imagem</label>
                      <input style={s.input} value={form.imageUrl} onChange={e => setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://..." />
                    </div>
                  </div>

                  <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    <div>
                      <label style={s.label}>📅 Data da oferta</label>
                      <input style={s.input} type="date" value={form.offerDate} onChange={e => setForm(f=>({...f,offerDate:e.target.value}))} />
                    </div>
                    <div>
                      <label style={s.label}>Formato da página</label>
                      <select style={s.input} value={form.format} onChange={e => setForm(f=>({...f,format:e.target.value}))}>
                        {FORMATS.map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={s.label}>Nº de anúncios ativos</label>
                      <input style={s.input} type="number" value={form.adsCount} onChange={e => setForm(f=>({...f,adsCount:e.target.value}))} placeholder="2400" />
                    </div>
                    <div>
                      <label style={s.label}>Categoria</label>
                      <select style={s.input} value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={s.label}>País</label>
                      <select style={s.input} value={form.country} onChange={e => setForm(f=>({...f,country:e.target.value}))}>
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={s.label}>Link direto *</label>
                      <input style={s.input} value={form.linkDirect} onChange={e => setForm(f=>({...f,linkDirect:e.target.value}))} placeholder="https://..." />
                    </div>
                    <div>
                      <label style={s.label}>Link sem cloacker (opcional)</label>
                      <input style={s.input} value={form.linkNoCloaker} onChange={e => setForm(f=>({...f,linkNoCloaker:e.target.value}))} placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div style={{display:'flex',gap:'12px',marginTop:'20px',alignItems:'center'}}>
                  <button className="btn-primary" onClick={saveOffer} style={{borderRadius:'8px',padding:'12px 28px'}}>
                    {editing ? 'Salvar alterações' : 'Criar oferta'}
                  </button>
                  <button style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
                </div>
              </div>
            )}

            <div style={s.grid}>
              {offers.length === 0
                ? <div style={s.empty}>Nenhuma oferta ainda. Crie a primeira!</div>
                : offers.map(o => (
                  <OfferCard key={o.id} offer={o} isAdmin onEdit={openEdit} onDelete={deleteOffer} onPublish={togglePublish} />
                ))
              }
            </div>
          </>
        )}

        {tab === 'membros' && (
          <>
            <div style={s.actionRow}>
              <h2 style={s.sectionTitle}>Membros</h2>
            </div>
            <div style={s.formCard}>
              <h3 style={{...s.formTitle,marginBottom:'16px'}}>Adicionar membro</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr auto',gap:'10px',alignItems:'end'}}>
                <div><label style={s.label}>Nome</label><input style={s.input} placeholder="Nome" value={newMember.name} onChange={e => setNewMember(m=>({...m,name:e.target.value}))} /></div>
                <div><label style={s.label}>Email</label><input style={s.input} placeholder="email@..." type="email" value={newMember.email} onChange={e => setNewMember(m=>({...m,email:e.target.value}))} /></div>
                <div><label style={s.label}>Senha</label><input style={s.input} placeholder="senha123" value={newMember.password} onChange={e => setNewMember(m=>({...m,password:e.target.value}))} /></div>
                <div><label style={s.label}>Vencimento</label><input style={s.input} type="date" value={newMember.expiresAt} onChange={e => setNewMember(m=>({...m,expiresAt:e.target.value}))} /></div>
                <button className="btn-primary" onClick={addMember} style={{borderRadius:'8px',padding:'10px 16px',whiteSpace:'nowrap'}}>+ Adicionar</button>
              </div>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {members.length === 0
                ? <div style={s.empty}>Nenhum membro cadastrado.</div>
                : members.map(m => (
                  <div key={m.id} style={s.memberItem}>
                    <div style={s.avatar}>{(m.name||m.email)[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:'14px'}}>{m.name||'—'}</div>
                      <div style={{fontSize:'12px',color:'#6b7280'}}>{m.email}</div>
                    </div>
                    <div style={{fontSize:'12px',color:'#9ca3af'}}>{new Date(m.createdAt).toLocaleDateString('pt-BR')}</div>
                    <span style={{
                      padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700,
                      fontFamily:"'Plus Jakarta Sans', sans-serif",
                      background:m.active?'#dcfce7':'#fee2e2',
                      color:m.active?'#15803d':'#dc2626',
                    }}>{m.active?'Ativo':'Suspenso'}</span>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button style={s.mBtn} onClick={() => {db.toggleMember(m.id);reload()}}>{m.active?'Suspender':'Ativar'}</button>
                      <button style={{...s.mBtn,color:'#dc2626'}} onClick={() => {if(confirm('Excluir?')){db.deleteMember(m.id);reload()}}}>Excluir</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        )}
      </main>
    </div>
  )
}

const s = {
  page: { minHeight:'100vh', background:'#f3f4f6' },
  header: { background:'var(--purple)', borderBottom:'3px solid rgba(255,255,255,0.1)', position:'sticky', top:0, zIndex:100 },
  headerIn: { maxWidth:'1200px', margin:'0 auto', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo: { fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:900, fontSize:'20px', color:'white', letterSpacing:'0.08em', display:'flex', alignItems:'center', gap:'10px' },
  adminTag: { background:'rgba(255,255,255,0.2)', color:'white', padding:'2px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700, letterSpacing:'0.1em' },
  logoutBtn: { background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'white', padding:'6px 16px', borderRadius:'20px', fontSize:'12px', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600 },
  statsRow: { maxWidth:'1200px', margin:'0 auto', padding:'24px 24px 0', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' },
  statCard: { background:'white', borderRadius:'12px', padding:'16px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  statVal: { fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:'28px' },
  statLabel: { fontSize:'12px', color:'#9ca3af', marginTop:'2px', fontWeight:500 },
  tabs: { maxWidth:'1200px', margin:'20px auto 0', padding:'0 24px', display:'flex', gap:'4px', borderBottom:'2px solid #e5e7eb' },
  tabBtn: { padding:'10px 20px', border:'none', borderBottom:'3px solid transparent', background:'transparent', color:'#9ca3af', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:'14px', cursor:'pointer', marginBottom:'-2px' },
  tabActive: { color:'var(--purple)', borderBottomColor:'var(--purple)' },
  main: { maxWidth:'1200px', margin:'0 auto', padding:'24px' },
  actionRow: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' },
  sectionTitle: { fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:'20px', color:'#111' },
  formCard: { background:'white', borderRadius:'16px', padding:'24px', marginBottom:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  formTitle: { fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:'16px', marginBottom:'20px', color:'#111' },
  formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' },
  label: { display:'block', fontSize:'12px', color:'#374151', fontWeight:600, fontFamily:"'Plus Jakarta Sans', sans-serif", marginBottom:'4px' },
  input: { background:'#f9fafb', border:'1.5px solid #e5e7eb', borderRadius:'8px', padding:'9px 12px', color:'#111', fontSize:'13px', outline:'none', width:'100%' },
  imgUpload: { height:'160px', background:'#f9fafb', border:'2px dashed #d1d5db', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', marginBottom:'8px' },
  cancelBtn: { background:'transparent', border:'1.5px solid #d1d5db', color:'#6b7280', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'20px' },
  empty: { color:'#9ca3af', fontSize:'14px', padding:'40px', textAlign:'center', gridColumn:'1/-1' },
  memberItem: { background:'white', borderRadius:'12px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  avatar: { width:'38px', height:'38px', borderRadius:'50%', background:'#ede9fe', color:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:'15px', flexShrink:0 },
  mBtn: { background:'transparent', border:'1.5px solid #e5e7eb', color:'#6b7280', padding:'5px 12px', borderRadius:'6px', fontSize:'12px', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600 },
}
