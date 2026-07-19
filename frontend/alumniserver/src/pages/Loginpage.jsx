import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast, Bounce } from "react-toastify"
import { useAuth } from '../context/AuthContext'
import { Shield, GraduationCap, Users, Loader2, LogIn } from 'lucide-react'

const roles = [
  { key: 'admin', label: 'Admin', icon: Shield, color: 'blue' },
  { key: 'alumni', label: 'Alumni', icon: GraduationCap, color: 'amber' },
  { key: 'student', label: 'Student', icon: Users, color: 'green' },
]

const colorMap = {
  blue: { bg: 'bg-blue-900', hover: 'hover:bg-blue-800', ring: 'focus:ring-blue-500', border: 'border-blue-900', text: 'text-blue-900', light: 'bg-blue-50', tab: 'data-[active=true]:bg-blue-900 data-[active=true]:text-white data-[active=false]:text-blue-900 data-[active=false]:hover:bg-blue-50' },
  amber: { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', ring: 'focus:ring-amber-500', border: 'border-amber-500', text: 'text-amber-600', light: 'bg-amber-50', tab: 'data-[active=true]:bg-amber-500 data-[active=true]:text-gray-900 data-[active=false]:text-amber-600 data-[active=false]:hover:bg-amber-50' },
  green: { bg: 'bg-green-600', hover: 'hover:bg-green-700', ring: 'focus:ring-green-500', border: 'border-green-600', text: 'text-green-600', light: 'bg-green-50', tab: 'data-[active=true]:bg-green-600 data-[active=true]:text-white data-[active=false]:text-green-600 data-[active=false]:hover:bg-green-50' },
}

const Loginpage = () => {
  const [role, setRole] = useState('alumni')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const c = colorMap[role === 'admin' ? 'blue' : role === 'student' ? 'green' : 'amber']

  const handlelogin = async (e) => {
    e?.preventDefault()
    if (!username || !password) {
      toast.error('Please enter username and password')
      return
    }
    setLoading(true)
    try {
      const data = await login(username, password)
      toast.success(`Welcome, ${data.full_name || role}!`)
      if (data.role === 'admin') navigate('/admindashboard')
      else if (data.role === 'alumni') navigate('/alumnidashboard')
      else if (data.role === 'student') navigate('/studentdashboard')
      else navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-0">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center shadow-lg">
                <GraduationCap size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">WELCOME BACK</h2>
              <p className="text-slate-500 text-sm font-medium">TKR Alumni Portal</p>
            </div>

            {/* Role Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
              {roles.map(r => {
                const active = role === r.key
                const rc = colorMap[r.key === 'admin' ? 'blue' : r.key === 'student' ? 'green' : 'amber']
                return (
                  <button key={r.key} type="button" onClick={() => setRole(r.key)}
                    data-active={active}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      active ? `${rc.bg} text-white shadow-sm` : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    <r.icon size={16} />
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlelogin} className="px-8 pb-8 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={`w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none transition ${c.ring} focus:border-transparent`}
                placeholder="Enter your credentials"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Password</label>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                className={`w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none transition ${c.ring} focus:border-transparent`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300" />
                Remember me
              </label>
              <a href="#" className={`${c.text} font-bold hover:underline`}>Forgot?</a>
            </div>

            <button type="submit" disabled={loading}
              className={`w-full ${c.bg} text-white font-bold py-3.5 rounded-xl shadow-lg ${c.hover} transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? 'Signing in...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-bold">New Here?</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button type="button" onClick={() => navigate('/register')}
              className="w-full border-2 border-slate-300 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition"
            >
              Create Alumni Account
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          TKR Engineering College Alumni Portal
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}
        newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss
        draggable pauseOnHover theme="light" transition={Bounce}
      />
    </div>
  )
}

export default Loginpage
