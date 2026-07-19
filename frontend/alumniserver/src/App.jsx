import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layout/MainLayout"
import Loginpage from "./pages/Loginpage"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import AlumniLayout from "./layout/AlumniLayout"
import AdminLayout from "./layout/AdminLayout"
import StudentLayout from "./layout/StudentLayout"
import Alumni_Dashboard from "./pages/alumni/Alumni_Dashboard"
import All_Alumni from "./pages/alumni/All_Alumni"
import Alumni_Profile from "./pages/alumni/Alumni_Profile"
import Job_Page from "./pages/alumni/Job_Page"
import MentorshipHub from "./pages/alumni/MentorshipHub"
import Events_alumni from "./pages/alumni/Events_alumni"
import Settings from "./pages/alumni/Settings"
import Alumni_connection from "./pages/alumni/Alumni_connection"
import Contributions from "./pages/alumni/Contributions"
import Notifications from "./pages/alumni/Notifications"
import Posts from "./pages/alumni/Posts"
import Admin_Dashboard from "./pages/admin/Admin_Dashboard"
import Admin_AllAlumni from "./pages/admin/Admin_AllAlumni"
import Admin_Events from "./pages/admin/Admin_Events"
import Admin_PendingAlumni from "./pages/admin/Admin_PendingAlumni"
import Admin_Jobs from "./pages/admin/Admin_Jobs"
import Admin_Mentorship from "./pages/admin/Admin_Mentorship"
import Admin_Posts from "./pages/admin/Admin_Posts"
import Student_Dashboard from "./pages/student/Student_Dashboard"
import Student_Events from "./pages/student/Student_Events"
import Student_Profile from "./pages/student/Student_Profile"
import { AuthProvider } from "./context/AuthContext"
import Alumni_List from "./components/Alumni_List"
import AdminRegistration from "./pages/admin/AdminRegistration"
import ProtectedRoutes from "./components/ProtectedRoutes"
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Loginpage />} />
            <Route path="adminregister" element={<AdminRegistration />} />
          </Route>
          {/* PROTECTED ALUMNI */}
          <Route
            path="/alumnidashboard/*"
            element={
              <ProtectedRoutes>
                <AlumniLayout />
              </ProtectedRoutes>
            }
          >
            <Route index element={<Alumni_Dashboard />} />
            <Route path="alumnidirectory" element={<All_Alumni />} />
            <Route path="profile" element={<Alumni_Profile />} />
            <Route path="jobs" element={<Job_Page />} />
            <Route path="mentorship" element={<MentorshipHub />} />
            <Route path="events" element={<Events_alumni />} />
            <Route path="settings" element={<Settings />} />
            <Route path="spotlights" element={<Alumni_connection />} />
            <Route path="resources" element={<Job_Page />} />
            <Route path="contribute" element={<Contributions />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="posts" element={<Alumni_List />} />
          </Route>
          {/* PROTECTED ADMIN */}
          <Route
            path="/admindashboard/*"
            element={
              <ProtectedRoutes>
                <AdminLayout />
              </ProtectedRoutes>
            }
          >
            <Route index element={<Admin_Dashboard />} />
            <Route path="alumni" element={<Admin_AllAlumni />} />
            <Route path="jobs" element={<Admin_Jobs />} />
            <Route path="mentorship" element={<Admin_Mentorship />} />
            <Route path="posts" element={<Admin_Posts />} />
            <Route path="events" element={<Admin_Events />} />
            <Route path="pending" element={<Admin_PendingAlumni />} />
          </Route>
          {/* PROTECTED STUDENT */}
          <Route
            path="/studentdashboard/*"
            element={
              <ProtectedRoutes>
                <StudentLayout />
              </ProtectedRoutes>
            }
          >
            <Route index element={<Student_Dashboard />} />
            <Route path="events" element={<Student_Events />} />
            <Route path="profile" element={<Student_Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App