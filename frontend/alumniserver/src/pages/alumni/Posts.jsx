import React, { useState, useEffect } from 'react'
import { api, API_BASE_URL } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  FileText, Loader2, Plus, X, Heart, Calendar, User,
  ShieldCheck, GraduationCap, Clock, CheckCircle2
} from 'lucide-react'

const img = (url) => url ? (url.includes('/uploads/') && !url.startsWith(API_BASE_URL) ? `${API_BASE_URL}/uploads/${url.split('/uploads/')[1]}` : url) : null

const Posts = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPost, setShowPost] = useState(false)
  const [posting, setPosting] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', tags: '' })
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const [feedRes, myRes] = await Promise.all([
        api.get('/posts'),
        api.get('/posts/my').catch(() => ({ data: [] })),
      ])
      setPosts(feedRes.data || [])
      setMyPosts(myRes.data || [])
    } catch (err) {
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setPosting(true)
    try {
      const res = await api.post('/posts', null, {
        params: { title: form.title, content: form.content, tags: form.tags || undefined }
      })
      setForm({ title: '', content: '', tags: '' })
      setShowPost(false)
      if (res.data?.is_published === false) {
        setNotice('Your post has been submitted. It will be visible to everyone after admin approval.')
      } else {
        setNotice('')
      }
      await fetchPosts()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create post')
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(prev => prev.filter(p => p.id !== postId))
      setMyPosts(prev => prev.filter(p => p.id !== postId))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete post')
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : ''

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  const myPending = myPosts.filter(p => !p.is_published)

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto md:px-4 px-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-amber-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Community Posts</h1>
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">{posts.length} posts</span>
          </div>
          <button onClick={() => setShowPost(!showPost)}
            className="flex items-center gap-2 bg-amber-500 text-gray-900 font-semibold px-4 py-2.5 rounded-xl hover:bg-amber-600 transition text-sm">
            {showPost ? <X size={16} /> : <Plus size={16} />}
            {showPost ? 'Cancel' : 'New Post'}
          </button>
        </div>

        {notice && (
          <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4">
            <Clock size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm">{notice}</p>
            <button onClick={() => setNotice('')} className="ml-auto text-blue-400 hover:text-blue-700">
              <X size={15} />
            </button>
          </div>
        )}

        {showPost && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <FileText size={18} className="text-amber-500" /> Create a Post
            </h3>
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-amber-500" />
              Posts are reviewed by an admin before being published to the community.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Title</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Content</label>
                <textarea rows={5} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  placeholder="e.g. career, advice, networking"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <button type="submit" disabled={posting}
                className="flex items-center gap-2 bg-amber-500 text-gray-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-amber-600 transition disabled:opacity-50">
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
                {posting ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        )}

        {myPending.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              My Posts Awaiting Approval
              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">{myPending.length}</span>
            </h2>
            <div className="space-y-3">
              {myPending.map(post => (
                <div key={post.id} className="bg-white rounded-2xl border border-dashed border-blue-300 p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900">{post.title}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} /> {formatDate(post.created_at)}
                        {post.tags && <span>· {post.tags}</span>}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      <Clock size={11} /> Pending Approval
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{post.content}</p>
                  <button onClick={() => handleDelete(post.id)}
                    className="mt-3 text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <X size={12} /> Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-lg">No posts yet</p>
            <p className="text-gray-400 text-sm">Be the first to share something with the community.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                    {post.author_image ? (
                      <img src={img(post.author_image)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      post.author_name?.charAt(0)?.toUpperCase() || <User size={18} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{post.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="font-semibold text-gray-700">
                        {post.author_name || 'Unknown'}
                      </span>
                      {post.author_role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                          <ShieldCheck size={10} /> Admin
                        </span>
                      ) : post.author_role === 'alumni' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                          <GraduationCap size={10} /> Alumni
                        </span>
                      ) : null}
                      <span>·</span>
                      <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(post.created_at)}</span>
                      {post.tags && <span>· {post.tags}</span>}
                    </p>
                  </div>
                  {post.author_id === user?.userId && (
                    <button onClick={() => handleDelete(post.id)}
                      className="p-1 text-gray-300 hover:text-red-500 transition">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{post.content}</p>
                {post.like_count > 0 && (
                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                    <Heart size={12} className="text-red-400" /> {post.like_count}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Posts
