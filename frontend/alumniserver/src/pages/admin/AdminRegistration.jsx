import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const AdminRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '', username: '', phoneNumber: '',
    email: '', emailOtp: '',
    password: '', confirmPassword: '',
    designation: '', department: '',
  });

  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSendEmailOtp = async () => {
    if (!formData.email) { alert('Please enter email address first'); return; }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { alert('Please enter a valid email address'); return; }
    setEmailOtpLoading(true);
    try {
      await api.post('/auth/send-email-otp', { email: formData.email });
      setIsEmailOtpSent(true);
      alert('OTP sent to your email. Please check your inbox.');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setEmailOtpLoading(true);
    try {
      await api.post('/auth/verify-email-otp', {
        email: formData.email, otp: formData.emailOtp
      });
      setIsEmailVerified(true);
      alert('Email verified successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleEditEmail = () => {
    setIsEmailOtpSent(false);
    setIsEmailVerified(false);
    setFormData(prev => ({ ...prev, emailOtp: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match'); return;
    }
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters'); return;
    }
    if (!isEmailVerified) {
      alert('Please verify your email first'); return;
    }

    setLoading(true);
    try {
      const registerData = {
        full_name: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
        designation: formData.designation || null,
        department: formData.department || null,
      };

      await api.post('/auth/register-admin', registerData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Error registering:', error);
      if (error.response) {
        alert(error.response.data?.detail || 'Registration failed');
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'Computer Science Engineering', 'Information Technology',
    'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering',
  ];

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="mb-5">
              <div className="flex justify-center items-center">
                <h2 className="text-2xl font-bold text-amber-600 border-b border-gray-200 pb-3 mb-5">Admin Registration</h2>
              </div>
              <div className="flex justify-end">
                <h2 onClick={() => navigate("/")} className="text-blue-900 font-bold hover:underline cursor-pointer">Back to home</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name"
                    className="w-full px-4 py-2 border placeholder:text-black border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username"
                    className="w-full px-4 py-2 border placeholder:text-black border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                      placeholder="Create a password"
                      className="w-full px-4 py-2 border placeholder:text-black border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-500">
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-2 border border-gray-300 placeholder:text-black rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-gray-500">
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                    placeholder="Enter 10-digit mobile number" maxLength="10"
                    className="w-full px-4 py-2 border border-gray-300 placeholder:text-black rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <div className="flex gap-3">
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com"
                      className="flex-1 px-4 py-2 border border-gray-300 placeholder:text-black rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      required disabled={isEmailVerified} />
                    {!isEmailVerified ? (
                      <button type="button" onClick={isEmailOtpSent ? handleVerifyEmailOtp : handleSendEmailOtp}
                        disabled={isEmailOtpSent ? emailOtpLoading : (!formData.email || emailOtpLoading)}
                        className={`px-3 py-2 rounded-sm font-medium whitespace-nowrap ${isEmailOtpSent || !formData.email || emailOtpLoading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}>
                        {emailOtpLoading ? 'Sending...' : (isEmailOtpSent ? 'Verify OTP' : 'Send OTP')}
                      </button>
                    ) : (
                      <div className="px-3 py-2 bg-green-100 text-green-700 rounded-sm font-medium">✓ Verified</div>
                    )}
                  </div>
                  {isEmailOtpSent && !isEmailVerified && (
                    <div className="mt-2 flex items-center gap-2">
                      <input type="text" name="emailOtp" value={formData.emailOtp} onChange={handleChange} placeholder="Enter OTP" maxLength="6"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-green-500 outline-none font-mono text-center tracking-wider" />
                      <button type="button" onClick={handleEditEmail} className="text-sm text-gray-500 hover:underline">Edit</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g., Admin, HOD"
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select name="department" value={formData.department} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="">Select Department</option>
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-400 text-black font-semibold py-3 px-6 rounded-md transition duration-200 transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Submitting...' : 'Register as Admin'}
            </button>
            <div className="mt-6 text-center">
              <p className="text-md font-bold text-blue-900">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate("/login")} className="text-blue-900 font-bold hover:underline">Login Now</button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegistration;
