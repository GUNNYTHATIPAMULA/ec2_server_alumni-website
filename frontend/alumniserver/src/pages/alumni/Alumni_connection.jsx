import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, API_BASE_URL } from '../../services/api'
import { Users, UserPlus, Loader2, Check, X, Eye, Search, Briefcase, GraduationCap, Star } from 'lucide-react'

const img = (url) => url ? (url.startsWith('http') ? url : `${API_BASE_URL}${url}`) : null

const Alumni_connection = () => {
  const navigate = useNavigate()
  const [connections, setConnections] = useState([])
  const [pending, setPending] = useState([])
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/alumni/directory').catch(() => ({ data: [] })),
      api.get('/connections').catch(() => ({ data: [] })),
      api.get('/connections/pending').catch(() => ({ data: [] })),
    ]).then(([alumniRes, connRes, pendingRes]) => {
      setAlumni(alumniRes.data || [])
      setConnections(connRes.data || [])
      setPending(pendingRes.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleConnect = async (userId) => {
    setActionLoading(userId)
    try {
      await api.post(`/connections/request/${userId}`)
      const [connRes, pendingRes] = await Promise.all([
        api.get('/connections').catch(() => ({ data: [] })),
        api.get('/connections/pending').catch(() => ({ data: [] })),
      ])
      setConnections(connRes.data || [])
      setPending(pendingRes.data || [])
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send request')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRespond = async (requestId, status) => {
    setActionLoading(requestId)
    try {
      await api.patch(`/connections/request/${requestId}`, { status })
      setPending(prev => prev.filter(p => p.id !== requestId))
      if (status === 'accepted') {
        const updated = await api.get('/connections')
        setConnections(updated.data || [])
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to respond')
    } finally {
      setActionLoading(null)
    }
  }

  const connectedUserIds = new Set(connections.map(c => c.sender_id || c.receiver_id))
  const pendingUserIds = new Set(pending.map(p => p.sender_id || p.receiver_id))

  const filteredAlumni = alumni.filter(a => {
    const q = search.toLowerCase()
    return a.full_name?.toLowerCase().includes(q) || a.occupation?.toLowerCase().includes(q) || a.company_name?.toLowerCase().includes(q)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto md:px-4 px-1">
        {/* Header */}
        <div className="bg-blue-900 text-white rounded-3xl p-6 md:p-8 mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Star size={28} className="text-white" />
            <h1 className="text-2xl md:text-3xl font-bold text-slate-50">Alumni Spotlights</h1>
          </div>
          <p className="text-slate-100 text-sm md:text-base max-w-xl">
            Discover and connect with fellow TKR alumni. Expand your professional network and build lasting relationships.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { key: 'all', label: 'All Alumni' },
            { key: 'connected', label: `Connected (${connections.length})` },
            { key: 'pending', label: `Pending (${pending.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === t.key ? 'bg-blue-900 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Pending Requests Section */}
        {tab === 'pending' && pending.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <UserPlus size={18} className="text-amber-500" />
              Pending Requests
            </h2>
            <div className="space-y-2">
              {pending.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-white overflow-hidden shrink-0">
                        {req.profile_image ? (
                          <img src={img(req.profile_image)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          req.full_name?.charAt(0) || '?'
                        )}
                      </div>
                      <div className="min-w-0">
                        <button onClick={() => navigate(`/alumnidashboard/profile/${req.other_user_id || req.sender_id}`)}
                          className="font-semibold text-gray-900 text-sm hover:text-blue-700 transition truncate block">
                          {req.full_name || 'Unknown'}
                        </button>
                        {req.occupation && (
                          <p className="text-xs text-gray-500 truncate">
                            {req.occupation}{req.company_name ? ` at ${req.company_name}` : ''}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">Wants to connect with you</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => navigate(`/alumnidashboard/profile/${req.other_user_id || req.sender_id}`)}
                        className="flex items-center gap-1 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition">
                        <Eye size={13} /> View Profile
                      </button>
                      <button onClick={() => handleRespond(req.id, 'accepted')}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1 bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-800 transition disabled:opacity-50"
                      >
                        {actionLoading === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check size={13} />}
                        Accept
                      </button>
                      <button onClick={() => handleRespond(req.id, 'rejected')}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-200 transition disabled:opacity-50"
                      >
                        <X size={13} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        {tab !== 'pending' && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search alumni by name, role, or company..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white shadow-sm" />
          </div>
        )}

        {/* Alumni Grid or Connected */}
        {tab !== 'pending' && tab !== 'connected' && (
          <>
            {filteredAlumni.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <Users size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-lg">No alumni found</p>
                <p className="text-gray-400 text-sm">Try adjusting your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAlumni.map(a => {
                  const isConnected = connectedUserIds.has(a.user_id)
                  const hasPending = pendingUserIds.has(a.user_id)
                  return (
                    <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
                        {a.profile_image ? (
                          <img src={img(a.profile_image)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          a.full_name?.charAt(0) || '?'
                        )}
                      </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 truncate">{a.full_name}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <GraduationCap size={11} /> {a.branch} · {'\''}{a.batch_end_year?.toString().slice(-2)}
                          </p>
                          {a.occupation && (
                            <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                              <Briefcase size={11} /> {a.occupation}{a.company_name ? ` at ${a.company_name}` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleConnect(a.user_id)}
                          disabled={actionLoading === a.user_id || isConnected || hasPending}
                          className={`flex-1 cursor-pointer flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
                            isConnected
                              ? 'bg-blue-600 text-white cursor-default'
                              : hasPending
                                ? 'bg-amber-50 text-amber-700 cursor-default'
                                : 'bg-amber-300 text-gray-900 hover:bg-amber-400'
                          } `}
                        >
                          {actionLoading === a.user_id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : isConnected ? (
                            <><Check size={13} /> Connected</>
                          ) : hasPending ? (
                            <><UserPlus size={13} /> Requested</>
                          ) : (
                            <><UserPlus size={13} /> Connect</>
                          )}
                        </button>
                        <button onClick={() => navigate(`/alumnidashboard/profile/${a.user_id}`)}
                          className="flex cursor-pointer items-center justify-center gap-1.5 border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold text-blue-800 hover:bg-blue-50 transition">
                          <Eye size={13} /> View Profile
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Connected Tab */}
        {tab === 'connected' && (
          <>
            {connections.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <Users size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-lg">No connections yet</p>
                <p className="text-gray-400 text-sm">Connect with fellow alumni to grow your network.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alumni.filter(a => connectedUserIds.has(a.user_id)).map(a => (
                  <div key={a.id} className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
                        {a.profile_image ? (
                          <img src={img(a.profile_image)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          a.full_name?.charAt(0) || '?'
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{a.full_name}</h3>
                        <p className="text-xs text-gray-500 truncate">{a.occupation || 'Alumni'}</p>
                        {a.company_name && <p className="text-xs text-amber-600 truncate">{a.company_name}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span>{a.branch}</span>
                      <span>·</span>
                      <span>Batch {a.batch_start_year}-{a.batch_end_year}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-green-50 text-green-700">
                        <Check size={13} /> Connected
                      </span>
                      <button onClick={() => navigate(`/alumnidashboard/profile/${a.user_id}`)}
                        className="flex items-center justify-center gap-1.5 border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold text-blue-800 hover:bg-blue-50 transition">
                        <Eye size={13} /> View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pending empty state */}
        {tab === 'pending' && pending.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <UserPlus size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-lg">No pending requests</p>
            <p className="text-gray-400 text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Alumni_connection
