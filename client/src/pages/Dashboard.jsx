import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { format, addDays, subDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight, Plus, CheckCircle, Circle, User as UserIcon, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import TimetableList from '../components/TimetableList';
import TaskProgress from '../components/TaskProgress';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blocks, setBlocks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchBlocks = async (dateObj) => {
    try {
      const dateStr = format(dateObj, 'yyyy-MM-dd');
      const res = await axios.get(`/api/timetable?date=${dateStr}`);
      setBlocks(res.data);
    } catch (err) {
      toast.error('Failed to load timetable');
    }
  };

  useEffect(() => {
    fetchBlocks(currentDate);
  }, [currentDate]);

  const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));

  const toggleComplete = async (id, currentStatus) => {
    try {
      setBlocks(blocks.map(b => b._id === id ? { ...b, completed: !currentStatus } : b));
      await axios.put(`/api/timetable/${id}`, { completed: !currentStatus });
    } catch (err) {
      toast.error('Update failed');
      fetchBlocks(currentDate); // revert
    }
  };
  
  const deleteBlock = async (id) => {
    try {
       setBlocks(blocks.filter(b => b._id !== id));
       await axios.delete(`/api/timetable/${id}`);
       toast.success('Block deleted');
    } catch (err) {
       toast.error('Delete failed');
       fetchBlocks(currentDate);
    }
  }

  const clearCompleted = async () => {
    const completedBlocks = blocks.filter(b => b.completed);
    if (completedBlocks.length === 0) return;
    if (!window.confirm('Are you sure you want to delete all completed tasks?')) return;
    
    try {
       setBlocks(blocks.filter(b => !b.completed));
       await Promise.all(completedBlocks.map(b => axios.delete(`/api/timetable/${b._id}`)));
       toast.success('Cleared completed tasks');
    } catch (err) {
       toast.error('Failed to clear some tasks');
       fetchBlocks(currentDate);
    }
  };

  const completedCount = blocks.filter(b => b.completed).length; 
  const totalCount = blocks.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-10 w-full gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl font-bold text-gray-800 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Timely</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-1 sm:space-x-3 bg-gray-100 rounded-full p-1 border border-gray-200">
            <button onClick={handlePrevDay} className="p-1 sm:p-2 hover:bg-white rounded-full transition-colors"><ChevronLeft size={18}/></button>
            <span className="font-medium text-gray-700 w-24 sm:w-32 text-center text-sm sm:text-base">{format(currentDate, 'MMM dd, yyyy')}</span>
            <button onClick={handleNextDay} className="p-1 sm:p-2 hover:bg-white rounded-full transition-colors"><ChevronRight size={18}/></button>
          </div>
          
          {user?.isAdmin && (
            <Link to="/admin" className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors mr-2 sm:mr-4">
              <Shield size={20} className="sm:mr-2" /> <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          <Link to="/profile" className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors mr-2 sm:mr-4">
            <UserIcon size={20} className="sm:mr-2" /> <span className="hidden sm:inline">Profile</span>
          </Link>
          <button onClick={logout} className="flex items-center text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={20} className="sm:mr-2" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Main Column - Timetable */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Your Schedule</h2>
              <p className="text-gray-500 mt-1">Manage your time blocks for the day</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 w-full sm:w-auto justify-center hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center shadow-md transition-transform hover:-translate-y-0.5"
            >
              <Plus size={18} className="mr-2" /> Add Time Block
            </button>
          </div>

          <TimetableList 
            blocks={blocks} 
            setBlocks={setBlocks} 
            currentDate={currentDate} 
            toggleComplete={toggleComplete}
            deleteBlock={deleteBlock}
          />
        </div>

        {/* Right Column - Task Progress & Summary */}
        <div className="space-y-6">
          <TaskProgress completed={completedCount} total={totalCount} />
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Daily Targets</h3>
                {completedCount > 0 && (
                   <button onClick={clearCompleted} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 bg-red-50 rounded-md hover:bg-red-100 transition-colors">
                     Clear Completed
                   </button>
                )}
             </div>
             {blocks.length === 0 ? (
               <p className="text-gray-400 text-sm italic">No tasks scheduled for today.</p>
             ) : (
               <ul className="space-y-3">
                 {blocks.map(block => (
                    <li key={`target-${block._id}`} className="flex items-start text-sm">
                       <button onClick={() => toggleComplete(block._id, block.completed)} className="mt-0.5 mr-3 flex-shrink-0 text-indigo-500 hover:text-indigo-600">
                          {block.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                       </button>
                       <div className={`${block.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                          <span className="font-medium mr-2">{block.start_time} - {block.end_time}</span>
                          {block.title}
                       </div>
                    </li>
                 ))}
               </ul>
             )}
          </div>
        </div>

      </main>

      {/* Add Modal Placeholder - would ideally be extracted */}
      {showAddModal && (
        <AddBlockModal 
          date={currentDate} 
          onClose={() => setShowAddModal(false)}
          onAdd={() => {
            setShowAddModal(false);
            fetchBlocks(currentDate);
          }}
        />
      )}
    </div>
  );
};

// Quick functional component for Add Modal
const AddBlockModal = ({ date, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    start_time: '09:00', end_time: '10:00', title: '', category: 'Work', priority: 'Medium', notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/timetable', { ...formData, date: format(date, 'yyyy-MM-dd') });
      toast.success('Block added!');
      onAdd();
    } catch (err) {
      toast.error('Failed to add block');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold mb-4">Add Time Block</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                <input type="time" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
             </div>
             <div>
                <label className="block text-sm text-gray-600 mb-1">End Time</label>
                <input type="time" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
             </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Title</label>
            <input type="text" required placeholder="e.g. Morning Workout" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                  <option>Work</option><option>Study</option><option>Personal</option><option>Break</option>
                </select>
             </div>
             <div>
                <label className="block text-sm text-gray-600 mb-1">Priority</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
             </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Notes (Optional)</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border rounded-lg px-3 py-2 resize-none" rows="2"></textarea>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
             <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
             <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Block</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Dashboard;
