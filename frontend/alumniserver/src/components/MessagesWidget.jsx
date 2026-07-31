import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, API_BASE_URL } from '../services/api'
import {
  MessageCircle, X, ArrowLeft, Send, Phone, Video,
  MoreVertical, Check, CheckCheck, Search
} from 'lucide-react'

const img = (url) => url ? (url.includes('/uploads/') && !url.startsWith(API_BASE_URL) ? `${API_BASE_URL}/uploads/${url.split('/uploads/')[1]}` : url) : null

const sampleMessages = (name) => [
  {
    id: 1, from: 'them', text: `Hey! Good to connect with you here.`,
    time: '10:24 AM',
  },
  {
    id: 2, from: 'me', text: `Hi ${name?.split(' ')[0] || 'there'}! Great to see you on the alumni network.`,
    time: '10:26 AM',
  },
  {
    id: 3, from: 'them', text: 'Absolutely. Are you attending the upcoming alumni meet?',
    time: '10:27 AM',
  },
  {
    id: 4, from: 'me', text: "Yes, I've registered. Looking forward to catching up with everyone!",
    time: '10:29 AM',
  },
]

const MessagesWidget = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [connections, setConnections] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    api.get('/connections').catch(() => ({ data: [] }))
      .then((res) => setConnections(res.data || []))
  }, [])

  useEffect(() => {
    if (chatOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatOpen])

  const openChat = (conn) => {
    setActiveChat(conn)
    setMessages(sampleMessages(conn.full_name))
    setChatOpen(true)
  }

  const closeChat = () => {
    setChatOpen(false)
    setActiveChat(null)
    setMessages([])
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const now = new Date()
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: 'me',
        text: input.trim(),
        time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      },
    ])
    setInput('')
  }

  const filtered = connections.filter((c) =>
    c.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(!open); setChatOpen(false) }}
        className="fixed bottom-6 right-10 z-[1000] flex items-center gap-2 px-5 py-3 rounded-full bg-blue-900 text-white shadow-2xl shadow-black/30 hover:bg-blue-800 transition-all hover:scale-105"
      >
        <MessageCircle size={20} />
        <span className="text-sm font-medium">Messages</span>
        {connections.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-[11px] font-bold text-gray-900 flex items-center justify-center">
            {connections.length}
          </span> 
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-10 z-[1000] w-80 sm:w-96 max-h-[28rem] bg-white rounded-2xl shadow-2xl shadow-black/30 border border-gray-100 overflow-hidden flex flex-col">
          {/* Panel header */}
          <div className="bg-blue-900 text-white px-4 py-3 flex items-center gap-2 shrink-0">
            {chatOpen ? (
              <>
               <div className="flex items-center justify-between w-full">
                 <div className=" flex items-center gap-2">
                  <button onClick={closeChat} className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition">
                  <ArrowLeft size={16} /> 
                </button>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-bold overflow-hidden">
                      {activeChat.profile_image ? (
                        <img src={img(activeChat.profile_image)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        activeChat.full_name?.charAt(0) || '?'
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-blue-900" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold leading-tight">{activeChat.full_name}</p>
                    <p className="text-[10px] text-blue-200 leading-tight">Online</p>
                  </div>
                </div>
                 </div>
                  <div className="flex items-center gap-2 text-blue-200">
               
                  <MoreVertical size={14} className="cursor-pointer hover:text-white" />
                </div>
               </div>

              
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} />
                  <span className="text-sm font-semibold">Messages</span>
                </div>
                <button onClick={() => setOpen(false)} className="text-blue-200 hover:text-white transition">
                  <X size={18} />
                </button>
              </>
            )}
          </div>

          {!chatOpen ? (
            <>
              {/* Search */}
              <div className="p-3 border-b border-gray-100 shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search connections..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Connections list */}
              <div className="overflow-y-auto flex-1">
                {filtered.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">{search ? 'No matches found' : 'No connections yet'}</p>
                    {!search && (
                      <button
                        onClick={() => { setOpen(false); navigate('/alumnidashboard/alumnidirectory') }}
                        className="mt-3 text-xs text-blue-600 hover:underline"
                      >
                        Explore alumni directory
                      </button>
                    )}
                  </div>
                ) : (
                  filtered.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => openChat(c)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                    >
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                          {c.profile_image ? (
                            <img src={img(c.profile_image)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            c.full_name?.charAt(0) || '?'
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{c.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {c.occupation || 'Alumni'}{c.company_name ? ` · ${c.company_name}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] text-gray-400">12:04</span>
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">2</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Chat session */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                <div className="flex justify-center">
                  <span className="text-[10px] text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">Today</span>
                </div>
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      m.from === 'me'
                        ? 'bg-blue-900 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                    }`}>
                      <p className="whitespace-pre-line leading-snug">{m.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[10px] ${m.from === 'me' ? 'text-blue-200' : 'text-gray-400'}`}>{m.time}</span>
                        {m.from === 'me' && <CheckCheck size={12} className="text-blue-300" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button type="submit" disabled={!input.trim()}
                  className="h-9 w-9 rounded-full bg-blue-900 text-white flex items-center justify-center hover:bg-blue-800 transition disabled:opacity-40 shrink-0">
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default MessagesWidget
