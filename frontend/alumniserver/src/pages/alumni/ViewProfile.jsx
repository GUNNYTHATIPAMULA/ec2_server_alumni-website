import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, API_BASE_URL } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  Loader2, ArrowLeft, MapPin, Briefcase, GraduationCap, Award,
  Users, UserPlus, Check, MessageCircle, Calendar, BookOpen,
  ShieldCheck, Link as LinkIcon
} from 'lucide-react'

const img = (url) => url ? (url.includes('/uploads/') && !url.startsWith(API_BASE_URL) ? `${API_BASE_URL}/uploads/${url.split('/uploads/')[1]}` : url) : null

const ViewProfile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [connectedIds, setConnectedIds] = useState([])
  const [pendingIds, setPendingIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  const isSelf = user?.userId === userId

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const [profileRes, connRes, pendingRes] = await Promise.all([
        api.get(`/alumni/${userId}`),
        api.get('/connections').catch(() => ({ data: [] })),
        api.get('/connections/pending').catch(() => ({ data: [] })),
      ])
      setProfile(profileRes.data)
      setConnectedIds((connRes.data || []).map(c => c.other_user_id))
      setPendingIds((pendingRes.data || []).map(c => c.other_user_id))
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      await api.post(`/connections/request/${userId}`)
      await loadProfile()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send request')
    } finally {
      setConnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm max-w-xl mx-auto mt-8">
        <Users size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-lg">Profile not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-blue-600 hover:underline">
          Go back
        </button>
      </div>
    )
  }

  const isConnected = connectedIds.includes(profile.user_id)
  const hasPending = pendingIds.includes(profile.user_id)
  const initials = profile.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto md:px-4 px-1">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 mb-4 transition">
          <ArrowLeft size={15} /> Back
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="h-15 md:h-20" />
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0 overflow-hidden">
                {profile.profile_image ? (
                  <img src={img(profile.profile_image)} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                <p className="text-gray-600 text-sm md:text-base mt-0.5">
                  {profile.occupation || 'Alumni'}{profile.company_name ? ` at ${profile.company_name}` : ''}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5 flex-wrap">
                  {profile.current_location && (
                    <span className="flex items-center gap-1"><MapPin size={12} /> {profile.current_location}</span>
                  )}
                  <span className="flex items-center gap-1"><GraduationCap size={12} /> {profile.degree} · {profile.branch}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> Batch {profile.batch_start_year} - {profile.batch_end_year}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {!isSelf && (
                  <>
                    <button onClick={handleConnect}
                      disabled={connecting || isConnected || hasPending}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60 ${
                        isConnected
                          ? 'bg-blue-800 text-white cursor-default'
                          : hasPending
                            ? 'bg-amber-50 text-amber-700 cursor-default border border-amber-200'
                            : 'bg-amber-500 text-gray-900 hover:bg-amber-600'
                      }`}>
                      {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> :
                        isConnected ? <><Check size={15} /> Connected</> :
                        hasPending ? <><UserPlus size={15} /> Requested</> :
                        <><UserPlus size={15} /> Connect</>}
                    </button>
                    <button
                      className="flex items-center gap-1.5 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                      <MessageCircle size={15} /> Message
                    </button>
                  </>
                )}
                {isSelf && (
                  <button onClick={() => navigate('/alumnidashboard/profile')}
                    className="flex items-center gap-1.5 bg-blue-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition">
                    Edit My Profile
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-5 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-800">
                <Users size={15} />
                {profile.connections_count > 0
                  ? `${profile.connections_count} connection${profile.connections_count > 1 ? 's' : ''}`
                  : '0 connections'}
              </span>
              {profile.mentorship_available && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  <ShieldCheck size={11} /> Open to mentorship
                </span>
              )}
              {isSelf && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  <Users size={11} /> This is you
                </span>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        {profile.bio && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-700" /> About
            </h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{profile.bio}</p>
            {profile.address && (
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                <MapPin size={12} /> {profile.address}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {/* Experience */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase size={18} className="text-blue-700" /> Experience
            </h2>
            {profile.experience.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No experience added</p>
            ) : (
              <div className="space-y-4">
                {profile.experience.map(exp => (
                  <div key={exp.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-100 shrink-0" />
                      <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                    </div>
                    <div className="pb-2">
                      <p className="font-semibold text-gray-900 text-sm">{exp.role}</p>
                      <p className="text-xs text-gray-600">{exp.company_name}</p>
                      <p className="text-xs text-amber-600 mt-1">
                        {exp.start_year} - {exp.end_year || 'Present'}
                      </p>
                      {exp.description && <p className="text-xs text-gray-500 mt-1">{exp.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap size={18} className="text-blue-700" /> Education
            </h2>
            {profile.education.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No education added</p>
            ) : (
              <div className="space-y-4">
                {profile.education.map(edu => (
                  <div key={edu.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-700 ring-4 ring-blue-100 shrink-0" />
                      <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                    </div>
                    <div className="pb-2">
                      <p className="font-semibold text-gray-900 text-sm">{edu.degree}</p>
                      <p className="text-xs text-gray-600">{edu.institution}</p>
                      {edu.field_of_study && <p className="text-xs text-gray-500">{edu.field_of_study}</p>}
                      <p className="text-xs text-blue-700 mt-1">
                        {edu.start_year} - {edu.end_year || 'Present'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={18} className="text-blue-700" /> Skills
          </h2>
          {profile.skills.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">No skills added</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <span key={skill.id} className="px-3 py-1.5 bg-blue-50 text-blue-800 text-sm rounded-full font-medium">
                  {skill.skill_name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Social links */}
        {(profile.linkedin_url || profile.github_url) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <LinkIcon size={18} className="text-blue-700" /> Links
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 transition">
                  LinkedIn
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition">
                  GitHub
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewProfile
