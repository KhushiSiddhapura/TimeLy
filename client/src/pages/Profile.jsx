import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, AlertTriangle, Trash2, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload = { name };
      if (password) {
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setIsUpdating(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setIsUpdating(false);
          return;
        }
        payload.password = password;
      }
      
      const res = await axios.put('/api/auth/profile', payload);
      setUser(res.data);
      toast.success('Profile updated successfully');
      setPassword(''); // clear password fields after successful update
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete('/api/auth/profile');
      toast.success('Account completely deleted');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-4 flex items-center sticky top-0 z-10 w-full">
        <Link to="/" className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors mr-4">
          <ArrowLeft size={20} className="mr-1" /> Back to Dashboard
        </Link>
        <h1 className="text-xl font-bold text-gray-800">Profile Settings</h1>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Update Profile Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Account Details</h2>
            <p className="text-sm text-gray-500 mt-1">Update your personal information and password here.</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none truncate"
                  value={user?.email || ''}
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none truncate"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none truncate"
                    placeholder="Leave blank to keep current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength="6"
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none truncate"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!!password}
                      minLength="6"
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Save size={18} className="mr-2" /> 
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 rounded-2xl shadow-sm border border-red-200 overflow-hidden">
          <div className="p-6 border-b border-red-200/60 bg-red-100/50">
            <h2 className="text-lg font-semibold text-red-800 flex items-center">
              <AlertTriangle className="mr-2" size={20} /> Danger Zone
            </h2>
            <p className="text-sm text-red-600 mt-1">Irreversible and destructive actions.</p>
          </div>
          
          <div className="p-6">
            <h3 className="text-md font-medium text-gray-900 mb-1">Delete Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              Once you delete your account, there is no going back. All of your timetable blocks, settings, and personal data will be completely wiped from our servers. Please be certain.
            </p>
            
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-white border border-red-300 text-red-600 hover:bg-red-600 hover:text-white font-medium py-2 px-5 rounded-lg shadow-sm transition-colors flex items-center"
              >
                <Trash2 size={18} className="mr-2" /> Delete Account
              </button>
            ) : (
              <div className="bg-white p-4 rounded-xl border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm font-medium text-gray-800">Are you absolutely sure?</p>
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Yes, delete it
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Profile;
