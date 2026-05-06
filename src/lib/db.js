// Data store using localStorage — swap for real API later

export const db = {
  // OFFERS
  getOffers: () => JSON.parse(localStorage.getItem('sa_offers') || '[]'),
  saveOffers: (offers) => localStorage.setItem('sa_offers', JSON.stringify(offers)),

  addOffer: (offer) => {
    const offers = db.getOffers()
    const newOffer = {
      ...offer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      published: false,
    }
    offers.unshift(newOffer)
    db.saveOffers(offers)
    return newOffer
  },

  updateOffer: (id, data) => {
    const offers = db.getOffers()
    const idx = offers.findIndex(o => o.id === id)
    if (idx >= 0) { offers[idx] = { ...offers[idx], ...data }; db.saveOffers(offers) }
  },

  deleteOffer: (id) => { db.saveOffers(db.getOffers().filter(o => o.id !== id)) },
  publishOffer: (id) => db.updateOffer(id, { published: true }),
  unpublishOffer: (id) => db.updateOffer(id, { published: false }),
  getPublishedOffers: () => db.getOffers().filter(o => o.published),

  // FAVORITES (per user email)
  getFavorites: (email) => JSON.parse(localStorage.getItem(`sa_fav_${email}`) || '[]'),
  toggleFavorite: (email, offerId) => {
    const favs = db.getFavorites(email)
    const idx = favs.indexOf(offerId)
    if (idx >= 0) favs.splice(idx, 1)
    else favs.push(offerId)
    localStorage.setItem(`sa_fav_${email}`, JSON.stringify(favs))
    return favs
  },
  isFavorite: (email, offerId) => db.getFavorites(email).includes(offerId),

  // VIEWS (per user email)
  getViewed: (email) => JSON.parse(localStorage.getItem(`sa_viewed_${email}`) || '[]'),
  markViewed: (email, offerId) => {
    const viewed = db.getViewed(email)
    if (!viewed.includes(offerId)) {
      viewed.push(offerId)
      localStorage.setItem(`sa_viewed_${email}`, JSON.stringify(viewed))
    }
  },

  // STREAK
  getStreak: (email) => {
    const data = JSON.parse(localStorage.getItem(`sa_streak_${email}`) || '{"streak":0,"lastVisit":""}')
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (data.lastVisit === today) return data
    if (data.lastVisit === yesterday) {
      data.streak += 1
    } else if (data.lastVisit !== today) {
      data.streak = 1
    }
    data.lastVisit = today
    localStorage.setItem(`sa_streak_${email}`, JSON.stringify(data))
    return data
  },

  // MEMBERS
  getMembers: () => JSON.parse(localStorage.getItem('sa_members') || '[]'),
  saveMembers: (members) => localStorage.setItem('sa_members', JSON.stringify(members)),

  addMember: (member) => {
    const members = db.getMembers()
    const newMember = { ...member, id: Date.now().toString(), createdAt: new Date().toISOString(), active: true, expiresAt: member.expiresAt || '' }
    members.unshift(newMember)
    db.saveMembers(members)
    return newMember
  },

  getMember: (email) => db.getMembers().find(m => m.email === email),

  toggleMember: (id) => {
    const members = db.getMembers()
    const idx = members.findIndex(m => m.id === id)
    if (idx >= 0) { members[idx].active = !members[idx].active; db.saveMembers(members) }
  },

  deleteMember: (id) => { db.saveMembers(db.getMembers().filter(m => m.id !== id)) },
}

export const CATEGORIES = ['NUTRA', 'INFOPRODUTO']
export const FORMATS = ['VSL', 'PÁGINA DE VENDAS', 'QUIZ']
export const COUNTRIES = [
  { code: 'US', flag: '🇺🇸', name: 'Estados Unidos' },
  { code: 'BR', flag: '🇧🇷', name: 'Brasil' },
  { code: 'MX', flag: '🇲🇽', name: 'México' },
  { code: 'ES', flag: '🇪🇸', name: 'Espanha' },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal' },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina' },
  { code: 'CO', flag: '🇨🇴', name: 'Colômbia' },
]

export const LEVEL_CONFIG = [
  { name: 'Iniciante', minDays: 0, maxDays: 30, color: '#9ca3af', bg: '#f3f4f6', emoji: '🌱' },
  { name: 'Escalador', minDays: 31, maxDays: 90, color: '#6B21D6', bg: '#ede9fe', emoji: '🚀' },
  { name: 'Pro', minDays: 91, maxDays: 180, color: '#0891b2', bg: '#e0f2fe', emoji: '⚡' },
  { name: 'Elite', minDays: 181, maxDays: 365, color: '#d97706', bg: '#fef3c7', emoji: '🔥' },
  { name: 'Lendário', minDays: 366, maxDays: Infinity, color: '#dc2626', bg: '#fee2e2', emoji: '👑' },
]

export const getMemberLevel = (createdAt) => {
  const days = Math.floor((Date.now() - new Date(createdAt)) / 86400000)
  return LEVEL_CONFIG.find(l => days >= l.minDays && days <= l.maxDays) || LEVEL_CONFIG[0]
}

export const getDaysSince = (createdAt) => Math.floor((Date.now() - new Date(createdAt)) / 86400000)
