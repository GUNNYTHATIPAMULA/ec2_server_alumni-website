import React, { useState, useEffect, useMemo } from 'react'
import { api } from '../../services/api'
import { Loader2, Search, Users, UserPlus, Check, MessageCircle, Briefcase, MapPin, GraduationCap } from 'lucide-react'

const All_Alumni = () => {
  const [alumni, setAlumni] = useState([])
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState(null)
  const perPage = 6

  useEffect(() => {
    Promise.all([
      api.get('/alumni/directory'),
      api.get('/connections').catch(() => ({ data: [] })),
    ]).then(([dirRes, connRes]) => {
      setAlumni(dirRes.data || [])
      setConnections(connRes.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const connectedIds = new Set(connections.map(c => c.sender_id || c.receiver_id))

  const handleConnect = async (userId) => {
    setActionLoading(userId)
    try {
      await api.post(`/connections/request/${userId}`)
      const res = await api.get('/connections').catch(() => ({ data: [] }))
      setConnections(res.data || [])
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send request')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = useMemo(
    () => alumni.filter(a =>
      a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.occupation?.toLowerCase().includes(search.toLowerCase()) ||
      a.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.branch?.toLowerCase().includes(search.toLowerCase())
    ),
    [search, alumni]
  )
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl md:px-4 px-1">
        <div className="flex items-center gap-3 mb-6">
          <Users size={24} className="text-amber-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Alumni Directory</h1>
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">{alumni.length} members</span>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, role, company, or department..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>

        {paginated.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-lg">No alumni found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((a) => {
                const isConnected = connectedIds.has(a.user_id)
                return (
                  <div key={a.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold text-xl shrink-0 overflow-hidden">
                        {a.profile_image ? (
                          <img src={a.profile_image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          a.full_name?.charAt(0) || '?'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate">{a.full_name}</h3>
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
                      <button className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-1">
                        <MessageCircle size={13} /> Message
                      </button>
                      <button onClick={() => handleConnect(a.user_id)}
                        disabled={actionLoading === a.user_id || isConnected}
                        className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition flex items-center justify-center gap-1 ${
                          isConnected
                            ? 'bg-blue-800 text-white cursor-default'
                            : 'bg-amber-500 text-gray-900 hover:bg-amber-600'
                        }`}
                      >
                        {actionLoading === a.user_id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isConnected ? (
                          <><Check size={13} /> Connected</>
                        ) : (
                          <><UserPlus size={13} /> Connect</>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                  ‹ Prev
                </button>
                {Array.from({ length: Math.max(totalPages, 1) }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`h-9 w-9 rounded-xl text-sm font-medium ${
                      page === i + 1 ? 'bg-amber-500 text-gray-900' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                  Next ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default All_Alumni
