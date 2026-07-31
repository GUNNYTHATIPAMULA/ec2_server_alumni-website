import React, { useState, useEffect } from 'react'
import { api, API_BASE_URL } from '../../services/api'
import { Loader2, Search, Shield, ShieldOff, Users, Check, X, Mail, Phone, MapPin, GraduationCap, Calendar, ExternalLink, User } from 'lucide-react'

const img = (url) => url ? (url.startsWith('http') ? url : `${API_BASE_URL}${url}`) : null

const Admin_AllAlumni = () => {
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedAlumni, setSelectedAlumni] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchAlumni()
  }, [])

  const fetchAlumni = async () => {
    try {
      const res = await api.get('/admin/alumni')
      setAlumni(res.data)
    } catch (err) {
      console.error('Error fetching alumni:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (userId) => {
    setActionLoading(userId)
    try {
      const res = await api.patch(`/admin/block-user/${userId}`)
      setAlumni(prev => prev.map(a =>
        a.user_id === userId ? { ...a, is_active: res.data.is_active } : a
      ))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRowClick = async (userId) => {
    setDetailLoading(true)
    try {
      const res = await api.get(`/admin/alumni/${userId}`)
      setSelectedAlumni(res.data)
    } catch (err) {
      console.error('Error fetching alumni details:', err)
      setSelectedAlumni(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const filtered = alumni.filter(a => {
    const q = search.toLowerCase()
    return a.full_name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) ||
      a.roll_number?.toLowerCase().includes(q) || a.branch?.toLowerCase().includes(q)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  const tableContent = (
    <>
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search name, email, roll number, branch..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No alumni found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600 hidden md:table-cell">Email</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Roll No</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600 hidden sm:table-cell">Branch</th>
                  <th className="text-center px-3 py-2 font-medium text-gray-600">Status</th>
                  <th className="text-center px-3 py-2 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((a) => (
                  <tr key={a.user_id}
                    onClick={() => handleRowClick(a.user_id)}
                    className={`hover:bg-blue-50 cursor-pointer transition-colors ${selectedAlumni?.user_id === a.user_id ? 'bg-blue-50' : ''}`}>
                    <td className="px-3 py-2 font-medium text-gray-900">{a.full_name}</td>
                    <td className="px-3 py-2 text-gray-600 hidden md:table-cell">{a.email}</td>
                    <td className="px-3 py-2 text-gray-600">{a.roll_number}</td>
                    <td className="px-3 py-2 text-gray-600 hidden sm:table-cell">{a.branch}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                        !a.is_active ? 'text-red-600 bg-red-50' :
                        a.is_verified ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'
                      }`}>
                        {!a.is_active ? <ShieldOff size={11} /> : a.is_verified ? <Check size={11} /> : <X size={11} />}
                        {!a.is_active ? 'Blocked' : a.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={(e) => { e.stopPropagation(); handleToggleBlock(a.user_id) }}
                        disabled={actionLoading === a.user_id}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${
                          a.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                        } disabled:opacity-50`}
                      >
                        {actionLoading === a.user_id ? <Loader2 className="h-3 w-3 animate-spin" /> :
                          a.is_active ? <ShieldOff size={12} /> : <Shield size={12} />}
                        {a.is_active ? 'Block' : 'Unblock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-2">{filtered.length} of {alumni.length} alumni</p>
    </>
  )

  const detailPanel = selectedAlumni && (
    <div className="w-80 lg:w-96 shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
      {detailLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-sm font-semibold text-gray-900">Alumni Details</h2>
            <button onClick={() => setSelectedAlumni(null)} className="p-1 hover:bg-gray-100 rounded-full transition">
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                {selectedAlumni.profile_image ? (
                  <img src={img(selectedAlumni.profile_image)} alt="" className="h-full w-full object-cover" />
                ) : (
                  selectedAlumni.full_name?.charAt(0) || 'A'
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate">{selectedAlumni.full_name}</h3>
                <p className="text-xs text-gray-500 truncate">{selectedAlumni.occupation || 'Alumni'}{selectedAlumni.company_name ? ` at ${selectedAlumni.company_name}` : ''}</p>
              </div>
            </div>
            <DetailRow icon={User} label="Username" value={selectedAlumni.username || 'N/A'} />
            <DetailRow icon={Mail} label="Email" value={selectedAlumni.email} />
            <DetailRow icon={Phone} label="Phone" value={selectedAlumni.phone_number || 'N/A'} />
            <DetailRow icon={GraduationCap} label="Roll Number" value={selectedAlumni.roll_number} />
            <DetailRow icon={BookOpen} label="Branch" value={selectedAlumni.branch} />
            <DetailRow icon={GraduationCap} label="Degree" value={selectedAlumni.degree} />
            <DetailRow icon={Calendar} label="Batch" value={`${selectedAlumni.batch_start_year} - ${selectedAlumni.batch_end_year}`} />
            <DetailRow icon={MapPin} label="Location" value={selectedAlumni.current_location || 'N/A'} />
            <DetailRow icon={MapPin} label="Address" value={selectedAlumni.address || 'N/A'} />
            {selectedAlumni.linkedin_url && (
              <DetailRow icon={LinkedInIcon} label="LinkedIn" value={selectedAlumni.linkedin_url} isLink />
            )}
            {selectedAlumni.github_url && (
              <DetailRow icon={GithubIcon} label="GitHub" value={selectedAlumni.github_url} isLink />
            )}
            {selectedAlumni.bio && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Bio</p>
                <p className="text-sm text-gray-700">{selectedAlumni.bio}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                selectedAlumni.is_verified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {selectedAlumni.is_verified ? <Check size={11} /> : <X size={11} />}
                {selectedAlumni.is_verified ? 'Verified' : 'Unverified'}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                selectedAlumni.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {selectedAlumni.is_active ? <Check size={11} /> : <ShieldOff size={11} />}
                {selectedAlumni.is_active ? 'Active' : 'Blocked'}
              </span>
              {selectedAlumni.mentorship_available && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                  Mentor
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <Users size={20} className="text-blue-600" />
        <h1 className="text-xl font-bold text-gray-900">All Alumni</h1>
      </div>

      <div className="flex gap-0 flex-1 min-h-0">
        <div className={`flex-1 min-w-0 ${selectedAlumni ? 'overflow-y-auto pr-4' : ''}`}>
          {tableContent}
        </div>
        {detailPanel}
      </div>
    </div>
  )
}

const DetailRow = ({ icon: Icon, label, value, isLink }) => (
  <div className="flex items-start gap-3">
    <div className="p-1.5 bg-gray-50 rounded-lg mt-0.5">
      <Icon size={14} className="text-blue-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-400">{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 truncate">
          {value} <ExternalLink size={12} />
        </a>
      ) : (
        <p className="text-sm text-gray-700 truncate">{value}</p>
      )}
    </div>
  </div>
)

const GithubIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
)

const LinkedInIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const BookOpen = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
)

export default Admin_AllAlumni
