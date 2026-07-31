import React, { useState, useEffect } from "react";
import {
  Pencil,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  Loader2,
  Save,
  X,
  Plus,
  Trash2,
  Calendar,
  BookOpen,
  Award,
} from "lucide-react";
import { api, API_BASE_URL } from "../../services/api";
import { useNavigate } from "react-router-dom";

const img = (url) => url ? (url.startsWith("http") ? url : `${API_BASE_URL}${url}`) : null;

const Alumni_Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [form, setForm] = useState({});
  const [connections, setConnections] = useState([]);
  const [createForm, setCreateForm] = useState({
    full_name: "",
    roll_number: "",
    branch: "",
    degree: "",
    batch_start_year: "",
    batch_end_year: "",
    occupation: "",
    company_name: "",
    current_location: "",
    address: "",
    linkedin_url: "",
    github_url: "",
    bio: "",
  });
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [newEdu, setNewEdu] = useState({
    degree: "",
    institution: "",
    field_of_study: "",
    start_year: "",
    end_year: "",
  });
  const [newExp, setNewExp] = useState({
    company_name: "",
    role: "",
    start_year: "",
    end_year: "",
    description: "",
  });
  const [showEduForm, setShowEduForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load all data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileRes = await api.get("/alumni/profile");
      const profileData = profileRes.data;
      setProfile(profileData);
      setForm({
        full_name: profileData.full_name || "",
        bio: profileData.bio || "",
        occupation: profileData.occupation || "",
        company_name: profileData.company_name || "",
        current_location: profileData.current_location || "",
        address: profileData.address || "",
        linkedin_url: profileData.linkedin_url || "",
        github_url: profileData.github_url || "",
        profile_image: profileData.profile_image || "",
      });
    } catch (profileErr) {
      if (profileErr.response?.status === 404) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setError("Failed to load profile. Please check your connection and try again.");
      console.error("Error loading profile:", profileErr);
      setLoading(false);
      return;
    }

    try {
      const [skillsRes, educationRes, experienceRes, connectionsRes] = await Promise.all([
        api.get("/alumni/skills").catch(() => ({ data: [] })),
        api.get("/alumni/education").catch(() => ({ data: [] })),
        api.get("/alumni/experience").catch(() => ({ data: [] })),
        api.get("/connections").catch(() => ({ data: [] })),
      ]);
      setSkills(skillsRes.data);
      setEducation(educationRes.data);
      setExperiences(experienceRes.data);
      setConnections(connectionsRes.data);
    } catch (err) {
      console.error("Error loading sub-resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update profile
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/alumni/profile", form);
      setProfile(res.data);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Create profile
  const handleCreate = async () => {
    setSaving(true);
    try {
      const payload = {
        ...createForm,
        batch_start_year: parseInt(createForm.batch_start_year),
        batch_end_year: parseInt(createForm.batch_end_year),
      };
      const res = await api.put("/alumni/profile", payload);
      setProfile(res.data);
      setForm({
        full_name: res.data.full_name || "",
        bio: res.data.bio || "",
        occupation: res.data.occupation || "",
        company_name: res.data.company_name || "",
        current_location: res.data.current_location || "",
        address: res.data.address || "",
        linkedin_url: res.data.linkedin_url || "",
        github_url: res.data.github_url || "",
        profile_image: res.data.profile_image || "",
      });
      setCreating(false);
    } catch (error) {
      console.error("Error creating profile:", error);
      alert(error.response?.data?.detail || "Failed to create profile");
    } finally {
      setSaving(false);
    }
  };

  // Upload profile image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload/profile-image', formData);
      setForm(prev => ({ ...prev, profile_image: res.data.url }));
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  // Add skill
  const addSkill = async () => {
    if (!newSkill.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.post("/alumni/add-skill", { skill_name: newSkill.trim() });
      setSkills([...skills, res.data]);
      setNewSkill("");
    } catch (error) {
      console.error("Error adding skill:", error);
      alert("Failed to add skill");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete skill
  const deleteSkill = async (id) => {
    setActionLoading(id);
    try {
      await api.delete(`/alumni/skills/${id}`);
      setSkills(skills.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting skill:", error);
      alert("Failed to delete skill");
    } finally {
      setActionLoading(false);
    }
  };

  // Add education
  const addEducation = async () => {
    if (!newEdu.degree || !newEdu.institution || !newEdu.start_year) return;
    setActionLoading(true);
    try {
      const res = await api.post("/alumni/add-education", {
        ...newEdu,
        start_year: parseInt(newEdu.start_year),
        end_year: newEdu.end_year ? parseInt(newEdu.end_year) : null,
      });
      setEducation([...education, res.data]);
      setNewEdu({
        degree: "",
        institution: "",
        field_of_study: "",
        start_year: "",
        end_year: "",
      });
      setShowEduForm(false);
    } catch (error) {
      console.error("Error adding education:", error);
      alert("Failed to add education");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete education
  const deleteEducation = async (id) => {
    setActionLoading(id);
    try {
      await api.delete(`/alumni/education/${id}`);
      setEducation(education.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting education:", error);
      alert("Failed to delete education");
    } finally {
      setActionLoading(false);
    }
  };

  // Add experience
  const addExperience = async () => {
    if (!newExp.company_name || !newExp.role || !newExp.start_year) return;
    setActionLoading(true);
    try {
      const res = await api.post("/alumni/add-experience", {
        ...newExp,
        start_year: parseInt(newExp.start_year),
        end_year: newExp.end_year ? parseInt(newExp.end_year) : null,
      });
      setExperiences([...experiences, res.data]);
      setNewExp({
        company_name: "",
        role: "",
        start_year: "",
        end_year: "",
        description: "",
      });
      setShowExpForm(false);
    } catch (error) {
      console.error("Error adding experience:", error);
      alert("Failed to add experience");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete experience
  const deleteExperience = async (id) => {
    setActionLoading(id);
    try {
      await api.delete(`/alumni/experience/${id}`);
      setExperiences(experiences.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting experience:", error);
      alert("Failed to delete experience");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-3 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-lg">Something went wrong</p>
          <p className="text-gray-400 text-sm mt-2 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-lg">Profile not found</p>
            <p className="text-gray-400 text-sm mt-1">Fill in your details to create your alumni profile.</p>
          </div>
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Create Profile
            </button>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Full Name *" value={createForm.full_name} onChange={(e) => setCreateForm({...createForm, full_name: e.target.value})} className="col-span-2 px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Roll Number *" value={createForm.roll_number} onChange={(e) => setCreateForm({...createForm, roll_number: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Branch *" value={createForm.branch} onChange={(e) => setCreateForm({...createForm, branch: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Degree *" value={createForm.degree} onChange={(e) => setCreateForm({...createForm, degree: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Start Year *" type="number" value={createForm.batch_start_year} onChange={(e) => setCreateForm({...createForm, batch_start_year: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="End Year *" type="number" value={createForm.batch_end_year} onChange={(e) => setCreateForm({...createForm, batch_end_year: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Occupation" value={createForm.occupation} onChange={(e) => setCreateForm({...createForm, occupation: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Company" value={createForm.company_name} onChange={(e) => setCreateForm({...createForm, company_name: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <input placeholder="Current Location" value={createForm.current_location} onChange={(e) => setCreateForm({...createForm, current_location: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Address" value={createForm.address} onChange={(e) => setCreateForm({...createForm, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="LinkedIn URL" value={createForm.linkedin_url} onChange={(e) => setCreateForm({...createForm, linkedin_url: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="GitHub URL" value={createForm.github_url} onChange={(e) => setCreateForm({...createForm, github_url: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <textarea placeholder="Bio" value={createForm.bio} onChange={(e) => setCreateForm({...createForm, bio: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="flex gap-2">
                <button onClick={handleCreate} disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                  {saving ? "Creating..." : "Create Profile"}
                </button>
                <button onClick={() => setCreating(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden">
                {profile.profile_image ? (
                  <img src={profile.profile_image.startsWith('http') ? profile.profile_image : `${import.meta.env.VITE_BASE_API_URL}${profile.profile_image}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.full_name?.charAt(0) || "A"
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {profile.full_name}
                  <span className="text-gray-400 text-sm ml-2">
                    ’{profile.batch_end_year?.toString().slice(-2)}
                  </span>
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {profile.occupation || "Alumni"}
                  {profile.company_name && ` at ${profile.company_name}`}
                </p>
                {profile.current_location && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin size={12} /> {profile.current_location}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
              >
                {editing ? <X size={16} /> : <Pencil size={16} />}
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>

          {/* Edit Form */}
          {editing && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden">
                    {form.profile_image ? (
                      <img src={form.profile_image.startsWith('http') ? form.profile_image : `${import.meta.env.VITE_BASE_API_URL}${form.profile_image}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile.full_name?.charAt(0) || "A"
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 bg-gray-100 border rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition">
                    {imageUploading ? 'Uploading...' : 'Change Photo'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Occupation"
                  value={form.occupation}
                  onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={form.current_location}
                  onChange={(e) => setForm({ ...form, current_location: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={form.linkedin_url}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  placeholder="GitHub URL"
                  value={form.github_url}
                  onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="md:col-span-2">
                  <textarea
                    placeholder="Bio"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          )}
           <div className="flex items-center justify-between m-4 mb-0">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Connections {connections.length}
            </h2>
            <button
              onClick={() => navigate("/alumnidashboard/spotlights")}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all
            </button>
          </div>
        </div>
        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Personal Information
              </h2>
              <div className="space-y-3">
                <InfoItem label="Roll Number" value={profile.roll_number} icon={BookOpen} />
                <InfoItem label="Department" value={profile.branch} icon={GraduationCap} />
                <InfoItem label="Degree" value={profile.degree} icon={Award} />
                <InfoItem
                  label="Batch"
                  value={`${profile.batch_start_year} - ${profile.batch_end_year}`}
                  icon={Calendar}
                />
                <InfoItem label="Address" value={profile.address} icon={MapPin} />
                {profile.linkedin_url && (
                  <InfoItem label="LinkedIn" value="View Profile" isLink link={profile.linkedin_url} />
                )}
                {profile.github_url && (
                  <InfoItem label="GitHub" value="View Profile"  isLink link={profile.github_url} />
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <GraduationCap size={18} className="text-blue-600" />
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="border-l-2 border-blue-300 pl-3 relative">
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{edu.degree}</p>
                        <p className="text-xs text-gray-600">{edu.institution}</p>
                        {edu.field_of_study && (
                          <p className="text-xs text-gray-500">{edu.field_of_study}</p>
                        )}
                        <p className="text-xs text-blue-600 mt-1">
                          {edu.start_year} - {edu.end_year || "Present"}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteEducation(edu.id)}
                        className="text-gray-300 hover:text-red-500 transition"
                      >
                        {actionLoading === edu.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
                {education.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">No education added</p>
                )}
                {!showEduForm ? (
                  <button
                    onClick={() => setShowEduForm(true)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    <Plus size={14} /> Add Education
                  </button>
                ) : (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                    <input
                      placeholder="Degree *"
                      value={newEdu.degree}
                      onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                    <input
                      placeholder="Institution *"
                      value={newEdu.institution}
                      onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                    <input
                      placeholder="Field of study"
                      value={newEdu.field_of_study}
                      onChange={(e) => setNewEdu({ ...newEdu, field_of_study: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        placeholder="Start year"
                        type="number"
                        value={newEdu.start_year}
                        onChange={(e) => setNewEdu({ ...newEdu, start_year: e.target.value })}
                        className="w-1/2 px-2 py-1.5 border rounded text-sm"
                      />
                      <input
                        placeholder="End year"
                        type="number"
                        value={newEdu.end_year}
                        onChange={(e) => setNewEdu({ ...newEdu, end_year: e.target.value })}
                        className="w-1/2 px-2 py-1.5 border rounded text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addEducation}
                        className="flex-1 bg-blue-600 text-white py-1.5 rounded text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowEduForm(false)}
                        className="px-3 py-1.5 border rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Work Experience */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600" />
                Work Experience
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-amber-300 pl-3 relative">
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{exp.role}</p>
                        <p className="text-xs text-gray-600">{exp.company_name}</p>
                        <p className="text-xs text-amber-600 mt-1">
                          {exp.start_year} - {exp.end_year || "Present"}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-gray-500 mt-1">{exp.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteExperience(exp.id)}
                        className="text-gray-300 hover:text-red-500 transition"
                      >
                        {actionLoading === exp.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
                {experiences.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">No experience added</p>
                )}
                {!showExpForm ? (
                  <button
                    onClick={() => setShowExpForm(true)}
                    className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-800 mt-2"
                  >
                    <Plus size={14} /> Add Experience
                  </button>
                ) : (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                    <input
                      placeholder="Company *"
                      value={newExp.company_name}
                      onChange={(e) => setNewExp({ ...newExp, company_name: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                    <input
                      placeholder="Role *"
                      value={newExp.role}
                      onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        placeholder="Start year"
                        type="number"
                        value={newExp.start_year}
                        onChange={(e) => setNewExp({ ...newExp, start_year: e.target.value })}
                        className="w-1/2 px-2 py-1.5 border rounded text-sm"
                      />
                      <input
                        placeholder="End year"
                        type="number"
                        value={newExp.end_year}
                        onChange={(e) => setNewExp({ ...newExp, end_year: e.target.value })}
                        className="w-1/2 px-2 py-1.5 border rounded text-sm"
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={newExp.description}
                      onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                      rows={2}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addExperience}
                        className="flex-1 bg-amber-500 text-white py-1.5 rounded text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowExpForm(false)}
                        className="px-3 py-1.5 border rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award size={18} className="text-blue-600" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full group"
                  >
                    {skill.skill_name}
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="text-blue-300 hover:text-red-500 transition"
                    >
                      {actionLoading === skill.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <X size={12} />}
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <p className="text-sm text-gray-400 w-full text-center py-2">No skills added</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                />
                <button
                  onClick={addSkill}
                  disabled={!newSkill.trim()}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoItem = ({ label, value, icon: Icon, isLink, link }) => (
  <div className="flex items-start gap-2">
    {Icon && <Icon size={14} className="text-gray-400 mt-0.5" />}
    <div className="flex-1">
      <p className="text-xs text-gray-400">{label}</p>
      {isLink && link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
          {value}
        </a>
      ) : (
        <p className="text-sm text-gray-700">{value || "Not provided"}</p>
      )}
    </div>
  </div>
);

export default Alumni_Profile;