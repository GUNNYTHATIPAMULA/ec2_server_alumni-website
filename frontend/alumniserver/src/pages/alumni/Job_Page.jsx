import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Briefcase, MapPin, Loader2, Calendar, Search, Plus, X } from 'lucide-react'

const Job_Page = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPost, setShowPost] = useState(false)
  const [posting, setPosting] = useState(false)
  const [form, setForm] = useState({
    title: '', company: '', location: '', description: '',
    requirements: '', employment_type: 'full-time', contact_email: ''
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs')
      setJobs(res.data || [])
    } catch (err) {
      console.error('Error fetching jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async (e) => {
    e.preventDefault()
    setPosting(true)
    try {
      await api.post('/jobs', form)
      setForm({ title: '', company: '', location: '', description: '', requirements: '', employment_type: 'full-time', contact_email: '' })
      setShowPost(false)
      await fetchJobs()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to post job')
    } finally {
      setPosting(false)
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Briefcase size={24} className="text-amber-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Job Portal</h1>
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">{jobs.length} openings</span>
          </div>
          <button onClick={() => setShowPost(!showPost)}
            className="flex items-center gap-2 bg-blue-900 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-amber-600 transition text-sm">
            {showPost ? <X size={16} /> : <Plus size={16} />}
            {showPost ? 'Cancel' : 'Post a Job'}
          </button>
        </div>

        {/* Post Job Form */}
        {showPost && (
          <form onSubmit={handlePost} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Post a New Job</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Job Title</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Company</label>
                <input type="text" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Location</label>
                <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Requirements</label>
                <textarea rows={2} value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Contact Email</label>
                <input type="email" value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Employment Type</label>
                <select value={form.employment_type} onChange={e => setForm(p => ({ ...p, employment_type: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={posting}
              className="mt-4 flex items-center gap-2 bg-amber-500 text-gray-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-amber-600 transition disabled:opacity-50">
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
              {posting ? 'Posting...' : 'Post Job'}
            </button>
          </form>
        )}

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-lg">No jobs posted yet</p>
            <p className="text-gray-400 text-sm">Check back later or post a new opportunity.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                      <Briefcase size={24} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                      <p className="text-sm text-amber-600 font-medium">{job.company}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                        <span className="flex items-center gap-1"><Briefcase size={12} /> {job.employment_type}</span>
                        {job.created_at && <span className="flex items-center gap-1"><Calendar size={12} /> Posted {formatDate(job.created_at)}</span>}
                      </div>
                      <div className=" flex justify-between">
                        {job.salary_range && <span className="inline-block mt-2 text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{job.salary_range}</span>}
                             <button onClick={() => window.location.href = `mailto:${job.contact_email}`}
                      className="flex items-center gap-1 bg-blue-900 text-white font-semibold px-3 py-2 rounded-xl hover:bg-amber-600 transition text-sm">
                      <span>Apply</span>
                    </button>
                      </div>
                    </div>
                
                  </div>
               
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">Filter Jobs</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Job Type</label>
                    <select className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                      <option>All Types</option>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                    <select className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                      <option>All Locations</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-5 text-gray-900">
                <h3 className="font-bold text-lg mb-1">Featured Opportunities</h3>
                <p className="text-sm opacity-90">Discover top job matches tailored for TKR alumni.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Job_Page
