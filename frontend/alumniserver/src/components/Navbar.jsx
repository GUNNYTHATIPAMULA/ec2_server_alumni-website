import React,{useEffect,useState} from 'react'
import Avator from './Avator'
import { Bell } from 'lucide-react'
import clglogo from '../assets/tkr-logo.webp'
import {useNavigate } from 'react-router-dom'

const Navbar = ({ toggleSidebar }) => {
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
  const navigate = useNavigate();
  return (
    <div className='h-16 bg-blue-900 flex items-center fixed top-0 left-0 w-full z-50 px-4'>

      {/* Left Section */}
      <div className="flex items-center gap-3 w-full">

       
        <button
          onClick={toggleSidebar}
          className="text-white text-2xl md:hidden"
        >
          ☰
        </button>

        {/* Logo */}
        <img className='h-10  object-contain' src={clglogo} alt="College Logo" />

        {/* Title */}
        <div className="hidden sm:block">
          <h1 className='font-semibold text-white text-sm md:text-lg leading-tight'>
            TKR College of Engineering and Technology
          </h1>
          <h4 className='text-white text-xs md:text-sm'>
            Alumni Portal
          </h4>
        </div>
      </div>

      {/* Right Section */}
      <div onClick={() => navigate('/alumnidashboard/notifications')}  className="ml-auto cursor-pointer relative mr-8 flex items-center gap-3 bg-slate-100 px-2 py-2 rounded-full">
        <Bell />
        <span className='text-sm absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
          {notifications.filter(n => !n.is_read).length}
        </span>
      </div>

    </div>
  )
}

export default Navbar