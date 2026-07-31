import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api, API_BASE_URL } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import {
  Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, Users, UserPlus, Loader2, CheckCircle, Circle, Briefcase, GraduationCap, Award, MapPin, FileText
} from "lucide-react"
import FutureCalendar from "../../components/FutureCalendar"
import graduationImg from "../../assets/graduation.jpg"
import culturalImg from "../../assets/cultural.jpg"
import graduation2Img from "../../assets/graduation2.jpg"

const img = (url) => url ? (url.includes('/uploads/') && !url.startsWith(API_BASE_URL) ? `${API_BASE_URL}/uploads/${url.split('/uploads/')[1]}` : url) : null

const Alumni_Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [events, setEvents] = useState([])
  const [alumni, setAlumni] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/alumni/profile').catch(() => null),
      api.get('/events'),
      api.get('/alumni/directory'),
      api.get('/alumni/skills').catch(() => ({ data: [] })),
    ]).then(([profileRes, eventsRes, alumniRes, skillsRes]) => {
      if (profileRes) setProfile(profileRes.data)
      setEvents(eventsRes.data || [])
      setAlumni((alumniRes.data || []).slice(0, 6))
      setSkills(skillsRes.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const profileFields = [
    { key: 'profile_image', label: 'Photo' },
    { key: 'bio', label: 'Bio' },
    { key: 'occupation', label: 'Work' },
    { key: 'company_name', label: 'Company' },
    { key: 'current_location', label: 'Location' },
    { key: 'linkedin_url', label: 'LinkedIn' },
    { key: 'github_url', label: 'GitHub' },
  ]

  const filledCount = profileFields.filter(f => profile?.[f.key]).length
  const totalFields = profileFields.length
  const completionPct = Math.round((filledCount / totalFields) * 100)

  const handleEventClick = (event) => {
    navigate('/alumnidashboard/events')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto md:px-4 px-1 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl md:p-6 py-4 px-2 text-white shadow-sm bg-gradient-to-br from-blue-900 to-blue-700">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full ring-2 ring-white/30 bg-white/20 flex items-center justify-center overflow-hidden">
                  {profile?.profile_image ? (
                    <img src={img(profile.profile_image)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {profile?.full_name?.charAt(0) || user?.fullName?.charAt(0) || 'A'}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Welcome back, {profile?.full_name || user?.fullName || 'Alumni'}!
                  </h1>
                  <p className="text-white/70 mt-1 text-sm">
                    {profile?.occupation ? `${profile.occupation} at ${profile.company_name}` : "We're glad to have you back."}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-md md:p-6 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Featured Gallery</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">View all</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[{ name: "Graduation Day", img: graduationImg }, { name: "Cultural Fest", img: culturalImg }, { name: "Convocation", img: graduation2Img }].map((item) => (
                  <figure key={item.name} className="group relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer">
                    <img src={item.img} alt={item.name} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
                    <figcaption className="absolute bottom-3 left-3 right-3 text-white font-semibold">{item.name}</figcaption>
                  </figure>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white rounded-md md:p-6 py-2 px-4 shadow-md flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">All Alumni</h2>
                  <div className="flex items-center gap-1 text-gray-500">
                    <button className="p-1 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-medium">1/1</span>
                    <button className="p-1 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search alumni..."
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <ul className="space-y-3 flex-1">
                  {alumni.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 p-3 rounded-md border border-gray-200 hover:border-blue-500/30 hover:bg-gray-50 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center flex-shrink-0 text-white font-bold">
                        {a.full_name?.charAt(0) || 'A'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-gray-900 truncate">{a.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{a.occupation || 'Alumni'}</p>
                        {a.company_name && <p className="text-xs text-gray-500 truncate">{a.company_name}</p>}
                      </div>
                      <div className="flex gap-1.5">
                        <button title="Connect" className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-900 hover:text-white transition-colors">
                          <UserPlus className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/alumnidashboard/alumnidirectory')}
                  className="mt-4 w-full py-3 rounded-xl text-white font-semibold shadow-lg bg-gradient-to-br from-blue-900 to-blue-700 hover:brightness-95 transition">
                  View Full Directory
                </button>
              </section>

              <section className="bg-white rounded-md md:p-6 py-2 px-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
                  <button onClick={() => navigate('/alumnidashboard/events')} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">View all</button>
                </div>
                <div className="mb-5">
                  <FutureCalendar events={events} onEventClick={handleEventClick} />
                </div>
                <div className="space-y-4">
                  {events.slice(0, 2).map((event) => (
                    <article key={event.id} className="border-t border-gray-200 pt-4">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <button onClick={() => navigate('/alumnidashboard/events')}
                        className="mt-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-gray-900 hover:brightness-95 transition">
                        Register Event
                      </button>
                    </article>
                  ))}
                  {events.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No upcoming events</p>
                  )}
                </div>
              </section>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-5">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center ring-2 ring-blue-300 text-white font-bold text-xl overflow-hidden">
                 {profile?.profile_image ? (
                    <img src={img(profile.profile_image)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {profile?.full_name?.charAt(0) || user?.fullName?.charAt(0) || 'A'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Personalized:</p>
                  <h3 className="font-bold text-gray-900 leading-tight">My Portfolio Snapshot</h3>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-900 mb-2">Skills</p>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {skills.slice(0, 5).map(s => (
                      <span key={s.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">{s.skill_name}</span>
                    ))}
                    {skills.length > 5 && <span className="text-xs text-gray-400">+{skills.length - 5} more</span>}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mb-3">No skills added yet</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900">Profile Completion</p>
                  <div className="relative h-12 w-12">
                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3"
                        strokeDasharray="94.2" strokeDashoffset={94.2 - (94.2 * completionPct) / 100}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-amber-800">{completionPct}%</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  {profileFields.map(f => {
                    const filled = !!profile?.[f.key]
                    return (
                      <li key={f.key} className={`flex items-center gap-2 ${filled ? 'text-gray-900' : 'text-gray-500'}`}>
                        {filled ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4" />}
                        <span>{filled ? `✓ ${f.label}` : `Add ${f.label}`}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>

            <section className="bg-white rounded-md p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Career Journey & Mentorship</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-gray-800 ring-4 ring-blue-100" />
                    <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                  </div>
                  <div className="pb-2">
                    <p className="text-xs text-gray-500">Next Milestone</p>
                    <p className="font-semibold text-gray-900">Become a Mentor</p>
                    <p className="text-xs text-gray-500 mb-2">Help shape the next generation</p>
                    <button onClick={() => navigate('/alumnidashboard/mentorship')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-gray-900 hover:brightness-95 transition">
                      Activate Mentoring Profile
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mentor Status:</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      {profile?.mentorship_available ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-md p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                {profile?.current_location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-blue-600" />
                    {profile.current_location}
                  </div>
                )}
                {profile?.occupation && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase size={14} className="text-blue-600" />
                    {profile.occupation}{profile.company_name ? ` at ${profile.company_name}` : ''}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap size={14} className="text-blue-600" />
                  {profile?.degree} - {profile?.branch}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText size={14} className="text-blue-600" />
                  Batch {profile?.batch_start_year} - {profile?.batch_end_year}
                </div>
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default Alumni_Dashboard
