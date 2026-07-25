import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, API_BASE_URL } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '', username: '', phoneNumber: '', otp: '',
    email: '', emailOtp: '',
    batchStartingYear: '', batchEndingYear: '',
    password: '', confirmPassword: '',
    occupation: '', company: '', rollNumber: '', department: '', degree: '',
    termsAccepted: false
  });

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/upload/profile-image', form);
      setProfileImageUrl(res.data.url);
      setProfileImage(file);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phoneNumber) { alert('Please enter phone number first'); return; }
    if (!formData.phoneNumber.match(/^[0-9]{10}$/)) { alert('Please enter a valid 10-digit phone number'); return; }
    setPhoneOtpLoading(true);
    try {
      await api.post('/auth/send-phone-otp', { phone_number: formData.phoneNumber, email: formData.email || undefined });
      setIsOtpSent(true);
      alert('OTP sent to phone. Use 123456 as OTP.');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setPhoneOtpLoading(true);
    try {
      await api.post('/auth/verify-phone-otp', {
        phone_number: formData.phoneNumber, otp: formData.otp
      });
      setIsPhoneVerified(true);
      alert('Phone verified successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!formData.email) { alert('Please enter email address first'); return; }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { alert('Please enter a valid email address'); return; }
    setEmailOtpLoading(true);
    try {
      await api.post('/auth/send-email-otp', { email: formData.email, phone_number: formData.phoneNumber || undefined });
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

  const handleEditPhone = () => {
    setIsOtpSent(false); setIsPhoneVerified(false);
    setFormData(prev => ({ ...prev, otp: '' }));
  };

  const handleEditEmail = () => {
    setIsEmailOtpSent(false); setIsEmailVerified(false);
    setFormData(prev => ({ ...prev, emailOtp: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match'); return;
    }
    if (formData.password && formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters'); return;
    }
    if (!formData.termsAccepted) {
      alert('Please accept the terms and conditions'); return;
    }

    setLoading(true);
    try {
      const registerData = {
        full_name: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
        roll_number: formData.rollNumber,
        branch: formData.department,
        degree: formData.degree,
        batch_start_year: parseInt(formData.batchStartingYear),
        batch_end_year: parseInt(formData.batchEndingYear),
        occupation: formData.occupation || null,
        company_name: formData.company || null,
        profile_image: profileImageUrl || null
      };

      await api.post('/auth/register-alumni', registerData);
      alert('Registration submitted successfully! Please login.');
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
  const degrees = ['B.Tech', 'M.Tech', 'MBA'];

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="mb-5">
              <div className="flex justify-center items-center">
                <h2 className="text-2xl font-bold text-amber-600 border-b border-gray-200 pb-3 mb-5">Alumni Form</h2>
              </div>
              <div>
                <div className="flex justify-end">
                  <h2 onClick={() => navigate("/")} className="text-blue-900 font-bold hover:underline cursor-pointer">Back to home</h2>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
                <div className="flex gap-2">
                  <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange}
                    placeholder="Enter your roll number"
                    className="mb-5 px-4 py-2 border border-gray-300 placeholder:text-black rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition" required />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer px-4 py-2 bg-gray-100 border border-gray-300 rounded-sm text-sm text-gray-700 hover:bg-gray-200 transition">
                      Choose Image
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </label>
                    {imageUploading && <span className="text-sm text-gray-500">Uploading...</span>}
                    {profileImageUrl && (
                      <img src={profileImageUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border" />
                    )}
                  </div>
                </div>
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
                <div className="mb-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <div className="flex gap-3">
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                      placeholder="Enter 10-digit mobile number" maxLength="10"
                      className="flex-1 px-4 py-2 border border-gray-300 placeholder:text-black rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      required disabled={isPhoneVerified} />
                    {!isPhoneVerified ? (
                      <button type="button" onClick={isOtpSent ? handleVerifyOtp : handleSendOtp}
                        disabled={isOtpSent ? phoneOtpLoading : (!formData.phoneNumber || formData.phoneNumber.length !== 10 || phoneOtpLoading)}
                        className={`px-3 py-2 rounded-sm font-medium whitespace-nowrap ${isOtpSent || !formData.phoneNumber || formData.phoneNumber.length !== 10 || phoneOtpLoading
                          ? 'bg-blue-500 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}>
                        {phoneOtpLoading ? 'Sending...' : (isOtpSent ? 'Verify OTP' : 'Send OTP')}
                      </button>
                    ) : (
                      <div className="px-3 py-2 bg-green-100 text-green-700 rounded-sm font-medium">✓ Verified</div>
                    )}
                  </div>
                  {isOtpSent && !isPhoneVerified && (
                    <div className="mt-2 flex items-center gap-2">
                      <input type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="Enter OTP (123456)" maxLength="6"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-green-500 outline-none font-mono text-center tracking-wider" />
                      <button type="button" onClick={handleEditPhone} className="text-sm text-gray-500 hover:underline">Edit</button>
                    </div>
                  )}
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
                          ? 'bg-blue-500 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Starting Year *</label>
                  <input type="number" name="batchStartingYear" value={formData.batchStartingYear} onChange={handleChange} placeholder="e.g., 2020"
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Ending Year *</label>
                  <input type="number" name="batchEndingYear" value={formData.batchEndingYear} onChange={handleChange} placeholder="e.g., 2024"
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <select name="department" value={formData.department} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" required>
                    <option value="">Select Department</option>
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Degree *</label>
                  <select name="degree" value={formData.degree} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" required>
                    <option value="">Select Degree</option>
                    {degrees.map(degree => <option key={degree} value={degree}>{degree}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                  <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="e.g., Google"
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" required />
                <span className="text-sm text-black">
                  I agree to the <a href="#" className="text-black hover:underline">Terms and Conditions</a> and <a href="#" className="text-black hover:underline">Privacy Policy</a>
                </span>
              </label>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-400 text-black font-semibold py-3 px-6 rounded-md transition duration-200 transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Submitting...' : 'Submit Registration'}
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

export default Register;
