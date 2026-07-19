import React, { use } from 'react';
import FutureCalendar from '../components/FutureCalendar';
import { useNavigate } from 'react-router-dom';
import graduationImg from '../assets/graduation.jpg';
import culturalImg from '../assets/cultural.jpg';
import graduation2Img from '../assets/graduation2.jpg';
const Dashboard = () => {
  // Sample data for alumni list
  const navigate = useNavigate();
  const user = false ? { name: 'Aarmik Jenkins' } : null; // Simulated logged-in user
  const alumniList = [
    { name: 'Harmik Jens', batch: '2023', department: 'Computer Science' },
    { name: 'Solan Kzan', batch: '2023', department: 'Mechanical Engineering' },
    { name: 'Raduat Manager', batch: '2024', department: 'Business Administration' },
    { name: 'Harmik Jens', batch: '2023', department: 'Computer Science' },
    { name: 'Solan Kzan', batch: '2023', department: 'Mechanical Engineering' },
    { name: 'Raduat Manager', batch: '2024', department: 'Business Administration' },
  ];

  // Sample data for events
  const events = [
    { date: 'March 20', title: 'Tech Meetup 2025', time: '6:00 PM' },
    { date: 'March 25', title: 'Annual Alumni Gala', time: '7:30 PM' },
    { date: 'April 5', title: 'Career Fair', time: '10:00 AM' },
  ];

  // Sample data for jobs
  const jobs = [
    { title: 'Product Manager', company: 'Google', type: 'Full-time' },
    { title: 'Senior Developer', company: 'Stripe', type: 'Remote' },
    { title: 'UX Designer', company: 'Microsoft', type: 'Hybrid' },
  ];

  // Sample data for spotlights
  const spotlights = [
    { name: 'Aarmik Jenkins', achievement: 'Promoted to Senior Architect at Amazon', year: '2018' },
    { name: 'Solan Kzan', achievement: 'Started new AI research lab', year: '2023' },
    { name: 'Raduat Manager', achievement: 'Published bestselling book on leadership', year: '2024' },
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br md:p-5 from-gray-50 to-gray-100">
      {/* Main container */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column (Featured Gallery + All Alumni) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-blue-900 text-white rounded-lg shadow-sm p-6 border border-gray-100">
              {user ? (
                <h1 className="text-3xl font-bold ">Welcome back,</h1>
              ) : (
                <h1 className="text-3xl font-bold text-white">Welcome to the <span className='text-amber-400'>Alumni Website</span></h1>
              )}
              <p className="text-blue-200 mt-2">Stay connected with your alma mater and fellow alumni.</p>
            </div>

            {/* Featured Gallery Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Featured Gallery</h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[{ name: 'Graduation Day', img: graduationImg }, { name: 'Cultural Fest', img: culturalImg }, { name: 'Debaudation Dary', img: graduation2Img }].map((item, idx) => (
                    <div key={idx} className="group cursor-pointer">
                      <div className="rounded-xl h-42 overflow-hidden group-hover:shadow-md transition-shadow">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <p className="mt-2 text-center text-gray-700 font-medium">{item.name}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center">
                    View all
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* All Alumni Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-800">All Alumni</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <svg className="w-4 h-4 absolute left-3 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {alumniList.map((alumnus, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                        {alumnus.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{alumnus.name}</p>
                        <p className="text-sm text-gray-500">Batch {alumnus.batch} • {alumnus.department}</p>
                      </div>
                    </div>
                    <button className="text-black bg-amber-400 p-2 rounded-sm hover:text-white cursor-pointer text-sm font-medium">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column (Events + Auth + Quick Access) */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-5 text-black">
                <h3 className="text-xl font-bold mb-2">Join the Community</h3>
                <p className=" text-sm mb-4">Access exclusive alumni resources and networking events.</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-blue-900 text-indigo-600 text-white px-4 py-2 rounded-sm font-medium text-sm hover:bg-blue-800 transition-colors">
                    Login
                  </button>
                 
                </div>
              </div>
            </div>
            {/* Upcoming Events with Calendar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="">
                {/* Calendar grid */}

                <FutureCalendar />
                {/* Events list */}
                <div className="space-y-3 mt-4">
                  {events.map((event, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                      </div>
                      <button className="text-indigo-600 text-sm font-medium">View Details</button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-right">
                  <button className="text-indigo-600 text-sm font-medium">View all events →</button>
                </div>
              </div>
            </div>
            {/* Register or Login Card */}

            {/* Quick Access Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Quick access</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold">AJ</div>
                    <div>
                      <p className="font-medium text-gray-800">Aarmik Jenkins</p>
                      <p className="text-sm text-green-600">Congrats, Sarah!</p>
                    </div>
                  </div>
                  <button className="text-indigo-600 text-sm font-medium">View Profile</button>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-semibold">SK</div>
                    <div>
                      <p className="font-medium text-gray-800">Solan Kzan</p>
                      <p className="text-sm text-blue-600">Mentorship Request</p>
                    </div>
                  </div>
                  <button className="text-indigo-600 text-sm font-medium">View Profile</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section: Latest Jobs + Alumni Spotlights (2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* Latest Jobs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Latest Jobs</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {jobs.map((job, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-medium text-gray-800">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.company} • {job.type}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-indigo-600 text-sm font-medium border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                      Apply
                    </button>
                    <button className="text-gray-500 bg-amber-300 text-sm font-medium hover:text-indigo-600 transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <button className="text-indigo-600 text-sm font-medium">Browse all jobs →</button>
            </div>
          </div>

          {/* Alumni Spotlights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Alumni Spotlights</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {spotlights.map((spotlight, idx) => (
                <div key={idx} className="p-4 flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold flex-shrink-0">
                    {spotlight.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{spotlight.name} <span className="text-xs text-gray-400">' {spotlight.year}</span></p>
                    <p className="text-sm text-gray-600 mt-0.5">{spotlight.achievement}</p>
                    <button className="text-indigo-600 text-xs font-medium mt-1 inline-flex items-center">
                      Read more
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <button className="text-indigo-600 text-sm font-medium">View all spotlights →</button>
            </div>
          </div>
        </div>

        {/* Footer note for responsive design */}
        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-6">
          <p>© 2025 Alumni Network • Stay connected with your alma mater</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
