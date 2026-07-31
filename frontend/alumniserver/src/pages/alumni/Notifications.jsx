import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Bell, Loader2, CheckCircle, Calendar, UserPlus, Heart, Briefcase, Info } from 'lucide-react'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data || [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'event': return <Calendar size={16} className="text-amber-500" />
      case 'connection': return <UserPlus size={16} className="text-blue-500" />
      case 'mentorship': return <Heart size={16} className="text-red-500" />
      case 'referral': return <Briefcase size={16} className="text-blue-500" />
      case 'job': return <Briefcase size={16} className="text-green-500" />
      default: return <Info size={16} className="text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={24} className="text-amber-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
          {notifications.filter(n => !n.is_read).length > 0 && (
            <span className="bg-amber-500 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {notifications.filter(n => !n.is_read).length} new
            </span>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-lg">No notifications</p>
            <p className="text-gray-400 text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className={`bg-white rounded-2xl border p-4 flex items-start gap-4 cursor-pointer transition ${
                  n.is_read ? 'border-gray-100 opacity-70' : 'border-amber-200 shadow-sm hover:shadow'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.is_read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
                {!n.is_read && (
                  <button onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id) }}
                    className="text-amber-600 hover:text-amber-700 shrink-0">
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
