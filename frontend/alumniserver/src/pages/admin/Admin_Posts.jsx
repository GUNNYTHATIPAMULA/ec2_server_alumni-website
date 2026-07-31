import React, { useState, useEffect } from "react";
import { api, API_BASE_URL } from "../../services/api";
import {
  FileText, Loader2, Trash2, Check, X, Clock, Mail, Phone,
  Calendar, ShieldCheck, GraduationCap, Inbox
} from "lucide-react";

const img = (url) => url ? (url.startsWith('http') ? url : `${API_BASE_URL}${url}`) : null

const Admin_Posts = () => {
  const [posts, setPosts] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [tab, setTab] = useState('requests');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const [postsRes, pendingRes] = await Promise.all([
        api.get("/admin/posts"),
        api.get("/admin/posts/pending"),
      ]);
      setPosts(postsRes.data);
      setPending(pendingRes.data);
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/posts/${id}/approve`);
      await loadPosts();
    } catch (err) {
      alert("Failed to approve post");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Reject and remove this post request?")) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/posts/${id}`);
      await loadPosts();
    } catch (err) {
      alert("Failed to reject post");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this published post?")) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      await loadPosts();
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : '';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-blue-600" /> Post Management
        </h1>
      </div>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('requests')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            tab === 'requests' ? 'bg-blue-900 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}>
          Post Requests
          {pending.length > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${tab === 'requests' ? 'bg-white text-blue-900' : 'bg-amber-500 text-white'}`}>
              {pending.length}
            </span>
          )}
        </button>
        <button onClick={() => setTab('published')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            tab === 'published' ? 'bg-blue-900 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}>
          Published Posts
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${tab === 'published' ? 'bg-white text-blue-900' : 'bg-gray-100 text-gray-600'}`}>
            {posts.filter(p => p.is_published).length}
          </span>
        </button>
      </div>

      {tab === 'requests' && (
        <>
          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
            <Clock size={14} className="text-amber-500" />
            Posts submitted by alumni wait here until you approve them. Once approved they are visible to everyone.
          </p>
          {pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <Inbox size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg">No pending post requests</p>
              <p className="text-gray-400 text-sm">Alumni submissions will appear here for your review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(post => (
                <div key={post.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
                        {post.author_image ? (
                          <img src={img(post.author_image)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          post.author_name?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900">{post.author_name || 'Unknown'}</p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                            <GraduationCap size={10} /> Alumni
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1"><Mail size={11} /> {post.author_email || 'N/A'}</span>
                          <span className="flex items-center gap-1"><Phone size={11} /> {post.author_phone || 'N/A'}</span>
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 shrink-0">
                        <Clock size={11} /> Awaiting Approval
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <h3 className="font-bold text-gray-900">{post.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{post.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(post.created_at)}</span>
                        {post.tags && <span>· {post.tags}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex gap-2">
                    <button onClick={() => handleApprove(post.id)}
                      disabled={actionLoading === post.id}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50">
                      {actionLoading === post.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check size={13} />}
                      Approve & Publish
                    </button>
                    <button onClick={() => handleReject(post.id)}
                      disabled={actionLoading === post.id}
                      className="flex items-center gap-1.5 bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-200 transition disabled:opacity-50">
                      <X size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'published' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Author</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Likes</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.filter(p => p.is_published).map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{post.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                        {post.author_image ? (
                          <img src={img(post.author_image)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          post.author_name?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                      <span className="text-gray-700">{post.author_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {post.author_role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        <ShieldCheck size={11} /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        <GraduationCap size={11} /> Alumni
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{post.like_count || 0}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(post.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(post.id)}
                      className="text-red-500 hover:text-red-700 transition p-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {posts.filter(p => p.is_published).length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No published posts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin_Posts;
