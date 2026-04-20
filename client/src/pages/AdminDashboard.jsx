import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Shield, ChevronLeft, Grid, List as ListIcon, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTimetables, setUserTimetables] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTimetables, setLoadingTimetables] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users. Are you an admin?');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    try {
      setLoadingTimetables(true);
      const res = await axios.get(`/api/admin/users/${user._id}/timetables`);
      setUserTimetables(res.data);
    } catch (err) {
      toast.error('Failed to load user timetables');
    } finally {
      setLoadingTimetables(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-10 w-full">
        <div className="flex items-center text-indigo-600">
          <Shield size={24} className="mr-2" />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <Link to="/" className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium">
          <ChevronLeft size={18} className="mr-1" /> Back to App
        </Link>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Users List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-8rem)]">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
            <h2 className="font-semibold text-gray-800 flex items-center">
              <User size={18} className="mr-2 text-indigo-500" /> All Users ({users.length})
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {loadingUsers ? (
              <p className="text-center text-gray-500 text-sm mt-8">Loading users...</p>
            ) : (
              <ul className="space-y-1">
                {users.map(u => (
                  <li key={u._id}>
                    <button 
                      onClick={() => handleSelectUser(u)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center justify-between group ${selectedUser?._id === u._id ? 'bg-indigo-50 border border-indigo-100 ring-1 ring-indigo-500/20' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                      <div>
                        <div className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {u.name} {u.isAdmin && <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full ml-2">Admin</span>}
                        </div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                      <ChevronRight size={16} className={`text-gray-400 ${selectedUser?._id === u._id ? 'text-indigo-500' : 'group-hover:text-indigo-400'}`} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column - User Timetable View */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-8rem)]">
          {selectedUser ? (
            <>
              <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 rounded-t-2xl">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{selectedUser.name}'s Timetables</h2>
                  <p className="text-sm text-gray-500">Joined {format(new Date(selectedUser.createdAt), 'MMM dd, yyyy')} • {userTimetables.length} blocks total</p>
                </div>
              </div>
              
              <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-gray-50/30">
                {loadingTimetables ? (
                  <p className="text-center text-gray-500 text-sm mt-8">Loading timetables...</p>
                ) : userTimetables.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
                      <ListIcon size={32} />
                    </div>
                    <p className="text-gray-500">This user hasn't created any time blocks yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Grouping by date */}
                    {Object.entries(
                      userTimetables.reduce((acc, curr) => {
                        (acc[curr.date] = acc[curr.date] || []).push(curr);
                        return acc;
                      }, {})
                    ).map(([date, blocks]) => (
                      <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-indigo-50/50 px-4 py-2 border-b border-indigo-100/50">
                          <h3 className="font-semibold text-indigo-900 text-sm">{format(new Date(date), 'EEEE, MMMM dd, yyyy')}</h3>
                        </div>
                        <ul className="divide-y divide-gray-50">
                          {blocks.map(block => (
                            <li key={block._id} className="p-3 md:p-4 hover:bg-gray-50 flex items-start sm:items-center justify-between group transition-colors">
                              <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                                <div className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">
                                  {block.start_time} - {block.end_time}
                                </div>
                                <div>
                                  <div className={`font-medium ${block.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                    {block.title}
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                      {block.category}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      block.priority === 'High' ? 'bg-red-100 text-red-700' :
                                      block.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      {block.priority}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                                ID: {block._id.slice(-6)}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center">
                <Grid size={40} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Select a User</h3>
                <p className="text-gray-500 text-sm mt-1">Choose a user from the left pane to view their timetable data.</p>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

// Re-using ChevronRight inline to avoid an extra import that might be missing
const ChevronRight = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default AdminDashboard;
