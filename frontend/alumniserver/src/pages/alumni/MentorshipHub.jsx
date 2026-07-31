import React, { useState, useEffect, useRef } from 'react'
import { api, API_BASE_URL } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  Loader2, Send, Check, X, MessageCircle,
  Search, Plus, ArrowLeft, CheckCheck, GraduationCap, Users
} from 'lucide-react'

const img = (url) => url ? (url.startsWith('http') ? url : `${API_BASE_URL}${url}`) : null

const initials = (name) => (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

const bgColors = [
  'from-amber-400 to-amber-600', 'from-blue-500 to-blue-700', 'from-green-400 to-green-600',
  'from-purple-500 to-purple-700', 'from-pink-400 to-pink-600', 'from-teal-400 to-teal-600'
]

const MentorshipHub = () => {
  const { user } = useAuth()
  const myId = user?.userId

  const [requests, setRequests] = useState([])
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [showFind, setShowFind] = useState(false)
  const [requestFor, setRequestFor] = useState(null)
  const [requestMsg, setRequestMsg] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgInput, setMsgInput] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const endRef = useRef(null)

  const loadRequests = async () => {
    const [dirRes, reqRes] = await Promise.all([
      api.get('/alumni/directory'),
      api.get('/mentorship/requests').catch(() => ({ data: [] })),
    ])
    setMentors(dirRes.data || [])
    setRequests(reqRes.data || [])
  }

  useEffect(() => {
    (async () => {
      try { await loadRequests() } catch (e) { console.error('Error loading mentorship:', e) }
      setLoading(false)
    })()
  }, [])

  const selected = requests.find(r => r.id === selectedId)

  const loadMessages = async (reqId) => {
    try {
      const res = await api.get(`/mentorship/${reqId}/messages`)
      setMessages(res.data || [])
    } catch {
      setMessages([])
    }
  }

  useEffect(() => {
    setMessages([])
    if (selectedId) loadMessages(selectedId)
  }, [selectedId])

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedId])

  const otherOf = (r) => (myId && r.mentor_id === myId) ? r.mentee : r.mentor
  const isMentorOf = (r) => myId && r.mentor_id === myId

  const conversations = requests.filter(r => {
    if (!search.trim()) return true
    const other = otherOf(r)
    return (other?.name || '').toLowerCase().includes(search.toLowerCase())
  })

  const incomingPending = requests.filter(r => r.status === 'pending' && isMentorOf(r)).length

  const handleSendRequest = async (mentorUserId) => {
    setActionLoading(mentorUserId)
    try {
      await api.post(`/mentorship/request/${mentorUserId}`, null, { params: { message: requestMsg || undefined } })
      setRequestFor(null)
      setRequestMsg('')
      setShowFind(false)
      await loadRequests()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send request')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRespond = async (requestId, status) => {
    setActionLoading(requestId)
    try {
      await api.put(`/mentorship/request/${requestId}?status=${status}`)
      await loadRequests()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to respond')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!msgInput.trim() || !selectedId) return
    setSendingMsg(true)
    try {
      const res = await api.post(`/mentorship/${selectedId}/messages`, null, { params: { content: msgInput.trim() } })
      setMessages(prev => [...prev, res.data])
      setMsgInput('')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send message')
    } finally {
      setSendingMsg(false)
    }
  }

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
    <div className="h-[calc(100vh-6.5rem)] p-1 md:p-2">
      <div className="max-w-6xl mx-auto h-full flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* ===== Two-pane body ===== */}
        <div className="flex flex-1 overflow-hidden">

          {/* ---------- Conversation list ---------- */}
          <div className={`w-full md:w-80 lg:w-96 flex-col border-r border-gray-100 bg-gray-50/60 ${selected ? 'hidden md:flex' : 'flex'}`}>
            <div className="px-5 pt-5 pb-3 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-bold text-gray-900">Mentorship</h1>
                <button onClick={() => setShowFind(true)}
                  className="flex items-center gap-1.5 bg-blue-900 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-800 transition">
                  <Plus size={14} /> New Chat
                </button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search mentors..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">{search ? 'No matches found' : 'No conversations yet'}</p>
                  {!search && (
                    <button onClick={() => setShowFind(true)}
                      className="mt-3 text-xs text-blue-700 hover:underline font-medium">
                      Request a mentor to get started
                    </button>
                  )}
                </div>
              ) : (
                conversations.map(r => {
                  const other = otherOf(r)
                  const active = r.id === selectedId
                  const meta = statusMeta(r.status)
                  const color = bgColors[(other?.name?.length || 0) % bgColors.length]
                  const pendingForMe = r.status === 'pending' && isMentorOf(r)
                  return (
                    <button key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition border-b border-gray-50 ${
                        active ? 'bg-blue-50/70' : 'hover:bg-gray-100'
                      }`}>
                      <div className="relative shrink-0">
                        <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold overflow-hidden`}>
                          {other?.image ? (
                            <img src={img(other.image)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            initials(other?.name)
                          )}
                        </div>
                        {pendingForMe && (
                          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-500 border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{other?.name || 'Unknown'}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${meta.cls}`}>{meta.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {pendingForMe ? 'Wants your mentorship' : r.message || (r.status === 'accepted' ? 'Connected · say hi!' : 'Request sent')}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* ---------- Chat pane ---------- */}
          {selected ? (
            <div className="flex-1 flex-col flex min-w-0">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-gray-100 bg-white shrink-0">
                <button onClick={() => setSelectedId(null)} className="md:hidden text-gray-500 hover:text-gray-800 mr-1">
                  <ArrowLeft size={18} />
                </button>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-white font-bold overflow-hidden">
                  {otherOf(selected)?.image ? (
                    <img src={img(otherOf(selected).image)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(otherOf(selected)?.name)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{otherOf(selected)?.name || 'Unknown'}</p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {otherOf(selected)?.role === 'admin' ? 'Administrator'
                      : otherOf(selected)?.role === 'alumni' ? 'Alumni Mentor'
                      : 'Mentor'}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusMeta(selected.status).cls}`}>
                    {statusMeta(selected.status).label}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto bg-gray-50/70 px-4 md:px-6 py-4 space-y-3">
                {/* Request message bubble */}
                <div className="flex justify-start">
                  <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-white border border-gray-100 px-4 py-2.5 shadow-sm">
                    <p className="text-[11px] font-semibold text-gray-400 mb-1">
                      Mentorship request · {selected.created_at ? new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-snug">
                      {selected.message || 'Hi! I would like to connect with you for mentorship.'}
                    </p>
                  </div>
                </div>

                {selected.status === 'accepted' && (
                  <>
                    {messages.map(m => {
                      const mine = m.sender_id === myId
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                            mine ? 'bg-blue-900 text-white rounded-br-md' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                          }`}>
                            <p className="whitespace-pre-line leading-snug">{m.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                              <span className={`text-[10px] ${mine ? 'text-blue-200' : 'text-gray-400'}`}>
                                {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}
                              </span>
                              {mine && <CheckCheck size={12} className="text-blue-300" />}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={endRef} />
                  </>
                )}

                {selected.status === 'pending' && (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl px-5 py-3 text-sm font-medium">
                      <MessageCircle size={16} />
                      {isMentorOf(selected)
                        ? 'This member has requested your mentorship'
                        : 'Waiting for the mentor to respond'}
                    </div>
                    {isMentorOf(selected) && (
                      <div className="flex justify-center gap-3 mt-5">
                        <button onClick={() => handleRespond(selected.id, 'accepted')}
                          disabled={actionLoading === selected.id}
                          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50">
                          {actionLoading === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                          Accept Request
                        </button>
                        <button onClick={() => handleRespond(selected.id, 'rejected')}
                          disabled={actionLoading === selected.id}
                          className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50">
                          <X size={16} />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {selected.status === 'rejected' && (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 rounded-2xl px-5 py-3 text-sm font-medium">
                      <X size={16} />
                      This mentorship request was declined
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              {selected.status === 'accepted' && (
                <form onSubmit={handleSendMessage} className="px-4 md:px-6 py-3 border-t border-gray-100 bg-white flex items-center gap-2 shrink-0">
                  <input type="text" value={msgInput} onChange={e => setMsgInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                  <button type="submit" disabled={!msgInput.trim() || sendingMsg}
                    className="h-10 w-10 rounded-full bg-blue-900 text-white flex items-center justify-center hover:bg-blue-800 transition disabled:opacity-40 shrink-0">
                    {sendingMsg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center bg-gray-50/40 px-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-4">
                <MessageCircle size={34} className="text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Your messages</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-5">Send a mentorship request and start meaningful conversations with fellow alumni.</p>
              {incomingPending > 0 && (
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  {incomingPending} pending request{incomingPending > 1 ? 's' : ''} waiting for you
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== Find mentors modal ===== */}
      {showFind && (
        <div className="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-4" onClick={() => { setShowFind(false); setRequestFor(null) }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Find a Mentor</h3>
                <p className="text-xs text-gray-500">Pick an alumnus to send a mentorship request</p>
              </div>
              <button onClick={() => { setShowFind(false); setRequestFor(null) }}
                className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                <X size={16} />
              </button>
            </div>

            {requestFor ? (
              <div className="p-6">
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Message (optional)</label>
                <textarea rows={4} value={requestMsg} onChange={e => setRequestMsg(e.target.value)}
                  placeholder="e.g. Hi, I'd love to learn more about your career journey and get your guidance..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none resize-none" />
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => { setRequestFor(null); setRequestMsg('') }}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition">
                    Back
                  </button>
                  <button onClick={() => handleSendRequest(requestFor.user_id)}
                    disabled={actionLoading === requestFor.user_id}
                    className="flex items-center gap-2 bg-blue-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50">
                    {actionLoading === requestFor.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={15} />}
                    Send Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search by name or company..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                </div>
                {mentors.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={36} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No alumni available yet</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {mentors.filter(m => (m.full_name || '').toLowerCase().includes(search.toLowerCase())).map(m => (
                      <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3.5 hover:shadow-md hover:border-gray-200 transition">
                        <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${bgColors[(m.full_name?.length || 0) % bgColors.length]} flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0`}>
                          {m.profile_image ? (
                            <img src={img(m.profile_image)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            initials(m.full_name)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{m.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {m.occupation || 'Alumni'}{m.company_name ? ` · ${m.company_name}` : ''}
                          </p>
                        </div>
                        <button onClick={() => setRequestFor(m)}
                          className="shrink-0 flex items-center gap-1 bg-blue-50 text-blue-900 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-100 transition">
                          <GraduationCap size={13} /> Request
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MentorshipHub
