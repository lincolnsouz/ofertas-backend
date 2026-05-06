// Simple data store using localStorage — swap for real API later

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
    if (idx >= 0) {
      offers[idx] = { ...offers[idx], ...data }
      db.saveOffers(offers)
    }
  },

  deleteOffer: (id) => {
    const offers = db.getOffers().filter(o => o.id !== id)
    db.saveOffers(offers)
  },

  publishOffer: (id) => db.updateOffer(id, { published: true }),
  unpublishOffer: (id) => db.updateOffer(id, { published: false }),

  getPublishedOffers: () => db.getOffers().filter(o => o.published),

  // MEMBERS
  getMembers: () => JSON.parse(localStorage.getItem('sa_members') || '[]'),
  saveMembers: (members) => localStorage.setItem('sa_members', JSON.stringify(members)),

  addMember: (member) => {
    const members = db.getMembers()
    const newMember = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      active: true,
    }
    members.unshift(newMember)
    db.saveMembers(members)
    return newMember
  },

  toggleMember: (id) => {
    const members = db.getMembers()
    const idx = members.findIndex(m => m.id === id)
    if (idx >= 0) {
      members[idx].active = !members[idx].active
      db.saveMembers(members)
    }
  },

  deleteMember: (id) => {
    const members = db.getMembers().filter(m => m.id !== id)
    db.saveMembers(members)
  },
}

export const CATEGORIES = ['NUTRA', 'INFOPRODUTO']
export const COUNTRIES = [
  { code: 'US', flag: '🇺🇸', name: 'Estados Unidos' },
  { code: 'BR', flag: '🇧🇷', name: 'Brasil' },
  { code: 'MX', flag: '🇲🇽', name: 'México' },
  { code: 'ES', flag: '🇪🇸', name: 'Espanha' },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal' },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina' },
  { code: 'CO', flag: '🇨🇴', name: 'Colômbia' },
]
