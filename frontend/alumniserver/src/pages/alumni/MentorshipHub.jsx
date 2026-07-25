import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { GraduationCap, Loader2, Send, Check, X, MessageCircle } from 'lucide-react'

const MentorshipHub = () => {
  const [mentors, setMentors] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [tab, setTab] = useState('mentors')

  useEffect(() => {
    Promise.all([
      api.get('/alumni/directory'),
      api.get('/mentorship/requests').catch(() => ({ data: [] })),
    ]).then(([dirRes, reqRes]) => {
      setMentors(dirRes.data || [])
      setRequests(reqRes.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleRequest = async (mentorUserId) => {
    setActionLoading(mentorUserId)
    try {
      await api.post(`/mentorship/request/${mentorUserId}`)
      alert('Mentorship request sent!')
      const res = await api.get('/mentorship/requests')
      setRequests(res.data || [])
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
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to respond')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const mySentRequests = requests.filter(r => r.status !== 'pending')
  const pendingMentorIds = new Set(requests.filter(r => r.status === 'pending').map(r => r.mentor_id))

  const bgColors = ['bg-amber-100 text-amber-800', 'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-teal-100 text-teal-800']

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
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">TKR Mentorship Network</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Connect with fellow alumni to share knowledge, guidance, and opportunities.</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          <button onClick={() => setTab('mentors')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
              tab === 'mentors' ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            Find Mentors
          </button>
          <button onClick={() => setTab('requests')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition relative ${
              tab === 'requests' ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            My Requests
            {pendingRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {tab === 'mentors' && (
          <>
            {mentors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-lg">No mentors available yet</p>
                <p className="text-gray-400 text-sm">Check back later.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {mentors.map((mentor, idx) => {
                  const hasPending = pendingMentorIds.has(mentor.id)
                  const colorClass = bgColors[idx % bgColors.length]
                  return (
                    <div key={mentor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-center mb-4">
                        <div className={`h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm ${colorClass}`}>
                          {mentor.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                        </div>
                      </div>
                      <h3 className="text-center text-xl font-bold text-gray-900">{mentor.full_name}</h3>
                      <p className="text-center text-sm text-gray-500 mb-1">
                        {mentor.branch} · {'\''}{mentor.batch_end_year?.toString().slice(-2)}
                      </p>
                      {mentor.occupation && (
                        <p className="text-center text-sm text-gray-600 mb-4">{mentor.occupation}{mentor.company_name ? ` at ${mentor.company_name}` : ''}</p>
                      )}
                      <button onClick={() => handleRequest(mentor.user_id)}
                        disabled={actionLoading === mentor.user_id || hasPending}
                        className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition ${
                          hasPending
                            ? 'bg-gray-100 text-gray-400 cursor-default'
                            : 'bg-blue-900 text-white hover:bg-blue-800'
                        } disabled:opacity-50`}>
                        {actionLoading === mentor.user_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : hasPending ? (
                          <><Check size={16} /> Request Pending</>
                        ) : (
                          <><Send size={16} /> Request Mentorship</>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'requests' && (
          <div className="max-w-3xl mx-auto">
            {pendingRequests.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageCircle size={18} className="text-amber-500" />
                  Pending Requests ({pendingRequests.length})
                </h2>
                <div className="space-y-2">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Mentorship Request</p>
                        <p className="text-xs text-gray-500">Status: <span className="text-amber-600 font-medium">{req.status}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleRespond(req.id, 'accepted')}
                          disabled={actionLoading === req.id}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition disabled:opacity-50">
                          {actionLoading === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check size={13} />}
                          Accept
                        </button>
                        <button onClick={() => handleRespond(req.id, 'rejected')}
                          disabled={actionLoading === req.id}
                          className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-200 transition disabled:opacity-50">
                          <X size={13} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-lg font-bold text-gray-900 mb-3">All Requests ({requests.length})</h2>
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-lg">No mentorship requests yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map(req => (
                  <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Mentorship Request</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Status: <span className={`font-medium ${
                            req.status === 'accepted' ? 'text-green-600' : req.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                          }`}>{req.status}</span>
                        </p>
                        {req.message && <p className="text-xs text-gray-400 mt-1">Message: {req.message}</p>}
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MentorshipHub
