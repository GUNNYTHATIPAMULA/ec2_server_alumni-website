import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=lax`
}

function removeCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=lax`
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getCookie('token') || localStorage.getItem('token')
    const role = getCookie('role') || localStorage.getItem('role')
    const userId = getCookie('userId') || localStorage.getItem('userId')
    const fullName = getCookie('fullName') || localStorage.getItem('fullName')

    const validateSession = async () => {
      if (!token || !role) {
        setUser(null)
        setLoading(false)
        return
      }
      try {
        const res = await api.get('/auth/me')
        const me = res.data
        setUser({
          token,
          role: me.role || role,
          userId: String(me.id) || userId,
          fullName,
        })
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    validateSession()
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    const data = res.data
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('role', data.role)
    localStorage.setItem('userId', data.user_id)
    localStorage.setItem('fullName', data.full_name || '')
    setCookie('token', data.access_token)
    setCookie('role', data.role)
    setCookie('userId', data.user_id)
    setCookie('fullName', data.full_name || '')
    setUser({ token: data.access_token, role: data.role, userId: data.user_id, fullName: data.full_name })
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    localStorage.removeItem('fullName')
    removeCookie('token')
    removeCookie('role')
    removeCookie('userId')
    removeCookie('fullName')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
