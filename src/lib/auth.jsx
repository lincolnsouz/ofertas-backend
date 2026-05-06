import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const ADMIN_EMAIL = 'lincolnsouzav@gmail.com'
const ADMIN_PASS = 'scaleads@admin2024'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sa_user')
    return saved ? JSON.parse(saved) : null
  })

  const loginAdmin = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const u = { email, role: 'admin' }
      setUser(u)
      localStorage.setItem('sa_user', JSON.stringify(u))
      return true
    }
    return false
  }

  const loginMember = (email, password) => {
    const members = JSON.parse(localStorage.getItem('sa_members') || '[]')
    const found = members.find(m => m.email === email && m.password === password && m.active)
    if (found) {
      const u = { email: found.email, role: 'member', name: found.name }
      setUser(u)
      localStorage.setItem('sa_user', JSON.stringify(u))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sa_user')
  }

  return (
    <AuthContext.Provider value={{ user, loginAdmin, loginMember, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
