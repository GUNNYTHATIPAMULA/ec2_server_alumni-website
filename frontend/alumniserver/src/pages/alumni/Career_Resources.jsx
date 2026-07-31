import React, { useState, useEffect } from 'react'
import { api, API_BASE_URL } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  Loader2, Send, Check, X, Search, Users, GraduationCap,
  Briefcase, BookOpen, FileText, Award, ClipboardList, MessageSquare
} from 'lucide-react'

const img = (url) => url ? (url.includes('/uploads/') && !url.startsWith(API_BASE_URL) ? `${API_BASE_URL}/uploads/${url.split('/uploads/')[1]}` : url) : null

const initials = (name) => (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

const bgColors = [
  'from-amber-400 to-amber-600', 'from-blue-500 to-blue-700', 'from-green-400 to-green-600',
  'from-purple-500 to-purple-700', 'from-pink-400 to-pink-600', 'from-teal-400 to-teal-600'
]

const resources = [
  {
    icon: FileText,
    title: 'Resume Guide',
    desc: 'Action words, one-page rule, and tailoring tips to make your resume stand out to recruiters.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MessageSquare,
    title: 'Interview Prep',
    desc: 'Common behavioral questions, STAR method, and how to ace technical and HR rounds.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Award,
    title: 'Personal Branding',
    desc: 'Build a strong LinkedIn presence and a professional network that opens new doors.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: BookOpen,
    title: 'Skill Building',
    desc: 'In-demand technical and soft skills, with free learning paths to stay ahead in the industry.',
    color: 'bg-purple-50 text-purple-600',
  },
]

const Career_Resources = () => {
  const { user } = useAuth()
  const myId = user?.userId

  const [alumni, setAlumni] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [requestFor, setRequestFor] = useState(null)
  const [requestMsg, setRequestMsg] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [tab, setTab] = useState('referrals')

  useEffect(() => {
    (async () => {
      try {
        const [dirRes, reqRes] = await Promise.all([
          api.get('/alumni/directory'),
          api.get('/referrals/requests').catch(() => ({ data: [] })),
        ])
        setAlumni(dirRes.data || [])
        setRequests(reqRes.data || [])
      } catch (e) {
        console.error('Error loading career resources:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSend = async (refereeUserId) => {
    setActionLoading(refereeUserId)
    try {
      await api.post(`/referrals/request/${refereeUserId}`, null, { params: { message: requestMsg || undefined } })
      setRequestFor(null)
      setRequestMsg('')
      const res = await api.get('/referrals/requests')
      setRequests(res.data || [])
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send referral request')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRespond = async (requestId, status) => {
    setActionLoading(requestId)
    try {
      await api.put(`/referrals/request/${requestId}?status=${status}`)
      const res = await api.get('/referrals/requests')
      setRequests(res.data || [])
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to respond')
    } finally {
      setActionLoading(null)
    }
  }

  const incoming = requests.filter(r => r.referee_id === myId)
  const sent = requests.filter(r => r.requester_id === myId)
  const pendingIncoming = incoming.filter(r => r.status === 'pending')
  const pendingIds = new Set(sent.filter(r => r.status === 'pending').map(r => r.referee_id))

  const filtered = alumni.filter(a =>
    (a.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.occupation || '').toLowerCase().includes(search.toLowerCase())
  )

  const statusMeta = (status) => {
    if (status === 'accepted') return { label: 'Accepted', cls: 'bg-green-100 text-green-700' }
    if (status === 'rejected') return { label: 'Declined', cls: 'bg-red-100 text-red-600' }
    return { label: 'Pending', cls: 'bg-amber-100 text-amber-700' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Briefcase size={24} className="text-amber-500" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Career Resources</h1>
              <p className="text-sm text-gray-500">Guides, tips and referrals from the alumni community.</p>
            </div>
          </div>
          {pendingIncoming.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {pendingIncoming.length} referral request{pendingIncoming.length > 1 ? 's' : ''} waiting for you
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setTab('referrals')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              tab === 'referrals' ? 'bg-blue-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            Ask for Referral
          </button>
          <button onClick={() => setTab('resources')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              tab === 'resources' ? 'bg-blue-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            Guides & Tips
          </button>
          <button onClick={() => setTab('requests')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition relative ${
              tab === 'requests' ? 'bg-blue-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            My Requests
            {requests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        {tab === 'referrals' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Users size={15} className="text-blue-700" />
                Request a referral from alumni working across the industry.
              </p>
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, company, role..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-amber-200" />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <Users size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-lg">No alumni found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((a, idx) => {
                  const hasPending = pendingIds.has(a.user_id)
                  const color = bgColors[idx % bgColors.length]
                  return (
                    <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold overflow-hidden shrink-0`}>
                          {a.profile_image ? (
                            <img src={img(a.profile_image)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            initials(a.full_name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{a.full_name}</p>
                          <p className="text-xs text-amber-600 font-medium truncate">
                            {a.occupation || 'Alumni'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {a.company_name && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            <Briefcase size={10} /> {a.company_name}
                          </span>
                        )}
                        {a.branch && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            <GraduationCap size={10} /> {a.branch}
                          </span>
                        )}
                        {a.batch_end_year && (
                          <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            Batch '{String(a.batch_end_year).slice(-2)}
                          </span>
                        )}
                      </div>
                      <button onClick={() => setRequestFor(a)}
                        disabled={hasPending}
                        className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition ${
                          hasPending
                            ? 'bg-gray-100 text-gray-400 cursor-default'
                            : 'bg-blue-900 text-white hover:bg-blue-800'
                        } disabled:opacity-60`}>
                        {hasPending ? (
                          <><Check size={15} /> Request Pending</>
                        ) : (
                          <><Send size={15} /> Request Referral</>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'resources' && (
          <div className="grid md:grid-cols-2 gap-4">
            {resources.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className={`h-12 w-12 rounded-xl ${r.color} flex items-center justify-center mb-4`}>
                  <r.icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1.5">{r.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{r.desc}</p>
                <div className="mt-4 space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs text-gray-500">
                      <Check size={13} className="text-green-500 mt-0.5 shrink-0" />
                      <span>Actionable tip #{j + 1} to get started right away</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'requests' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {pendingIncoming.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ClipboardList size={18} className="text-amber-500" />
                  Requests for You ({pendingIncoming.length})
                </h2>
                <div className="space-y-3">
                  {pendingIncoming.map(req => (
                    <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                          {req.requester?.image ? (
                            <img src={img(req.requester.image)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            initials(req.requester?.name)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{req.requester?.name || 'Alumni'}</p>
                          <p className="text-xs text-gray-500">wants a referral from you</p>
                        </div>
                      </div>
                      {req.message && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5 mb-3 border border-gray-100">
                          "{req.message}"
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => handleRespond(req.id, 'accepted')}
                          disabled={actionLoading === req.id}
                          className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50">
                          {actionLoading === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check size={14} />}
                          Accept
                        </button>
                        <button onClick={() => handleRespond(req.id, 'rejected')}
                          disabled={actionLoading === req.id}
                          className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-100 transition disabled:opacity-50">
                          <X size={14} />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Send size={18} className="text-blue-700" />
                My Referral Requests ({sent.length})
              </h2>
              {sent.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                  <Send size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">You haven't sent any referral requests yet.</p>
                  <button onClick={() => setTab('referrals')} className="mt-3 text-sm text-blue-700 font-semibold hover:underline">
                    Browse alumni profiles
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sent.map(req => {
                    const meta = statusMeta(req.status)
                    return (
                      <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${bgColors[(req.referee?.name?.length || 0) % bgColors.length]} flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0`}>
                          {req.referee?.image ? (
                            <img src={img(req.referee.image)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            initials(req.referee?.name)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{req.referee?.name || 'Alumni'}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {req.message || 'Referral request'}
                            <span className="text-gray-300 mx-1">·</span>
                            {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${meta.cls}`}>{meta.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Request Referral modal */}
      {requestFor && (
        <div className="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-4"
          onClick={() => { setRequestFor(null); setRequestMsg('') }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-5">
              <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${bgColors[(requestFor.full_name?.length || 0) % bgColors.length]} flex items-center justify-center text-white font-bold text-lg overflow-hidden`}>
                {requestFor.profile_image ? (
                  <img src={img(requestFor.profile_image)} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(requestFor.full_name)
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900">{requestFor.full_name}</p>
                <p className="text-sm text-gray-500">
                  {requestFor.occupation || 'Alumni'}{requestFor.company_name ? ` at ${requestFor.company_name}` : ''}
                </p>
                <p className="text-xs text-gray-400">{requestFor.branch}{requestFor.batch_end_year ? ` · ${requestFor.batch_end_year}` : ''}</p>
              </div>
            </div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Why should they refer you? (optional)</label>
            <textarea rows={4} value={requestMsg} onChange={e => setRequestMsg(e.target.value)}
              placeholder="e.g. I'm applying to the SDE role at your company and would appreciate your referral..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-200 outline-none resize-none" />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setRequestFor(null); setRequestMsg('') }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition">
                Cancel
              </button>
              <button onClick={() => handleSend(requestFor.user_id)}
                disabled={actionLoading === requestFor.user_id}
                className="flex items-center gap-2 bg-blue-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50">
                {actionLoading === requestFor.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={15} />}
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Career_Resources
