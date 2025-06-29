import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { LogOut } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const locations = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

const helpCategories = [
  { id: 'driving', label: 'Driving' },
  { id: 'cooking', label: 'Cooking' },
  { id: 'housekeeping', label: 'Housekeeping' },
  { id: 'gardening', label: 'Gardening' },
  { id: 'companionship', label: 'Companionship' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'medical', label: 'Medical' },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'users', 'helps'
  const [userSubTab, setUserSubTab] = useState('Volunteer'); // 'Volunteer', 'Citizen', 'Banned'
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [users, setUsers] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [helps, setHelps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannedSearch, setBannedSearch] = useState('');
  const [bannedCategory, setBannedCategory] = useState('All');
  const [userSearch, setUserSearch] = useState('');
  const [helpLocationFilter, setHelpLocationFilter] = useState('All');
  const [helpSkillFilter, setHelpSkillFilter] = useState('All');
  const [helpDateFilter, setHelpDateFilter] = useState('');
  const { user, signout } = useAuthStore();
  const navigate = useNavigate();

  // Redirect non-admins to their respective home pages
  if (user?.category !== "Admin") {
    if (user?.category === "Volunteer") {
      navigate("/volunteer-home");
    } else if (user?.category === "Citizen") {
      navigate("/citizen-home");
    } else {
      navigate("/");
    }
    return null;
  }

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const sessionToken = sessionStorage.getItem('sessionToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    };
  };

  const fetchPendingVolunteers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/volunteers/pending', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setPendingVolunteers(data.volunteers);
      } else {
        toast.error(data.message || 'Failed to fetch pending volunteers');
      }
    } catch (error) {
      toast.error('An error occurred while fetching pending volunteers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async (role) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?role=${role}`, { 
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message || `Failed to fetch ${role}s`);
      }
    } catch (error) {
      toast.error(`An error occurred while fetching ${role}s.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllHelps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/helps', { 
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setHelps(data.helps);
      } else {
        toast.error(data.message || 'Failed to fetch help requests');
      }
    } catch (error) {
      toast.error('An error occurred while fetching help requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBannedUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/banned?category=${bannedCategory}`, { 
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setBannedUsers(data.users);
      } else {
        toast.error(data.message || 'Failed to fetch banned users');
      }
    } catch (error) {
      toast.error('An error occurred while fetching banned users.');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, list, setList) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, { 
        method: 'PATCH', 
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User banned.');
        setList(list.filter(u => u._id !== userId));
      } else {
        toast.error(data.message || 'Failed to ban user');
      }
    } catch (error) {
      toast.error('An error occurred while banning the user.');
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to unban this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/unban`, { 
        method: 'PATCH', 
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User unbanned.');
        setBannedUsers(bannedUsers.filter(u => u._id !== userId));
      } else {
        toast.error(data.message || 'Failed to unban user');
      }
    } catch (error) {
      toast.error('An error occurred while unbanning the user.');
    }
  };

  const handleApprove = async (volunteerId) => {
    if (!window.confirm('Are you sure you want to approve this volunteer?')) return;
    try {
      const res = await fetch(`/api/admin/volunteers/${volunteerId}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Volunteer approved!');
        setPendingVolunteers(prev => prev.filter(v => v._id !== volunteerId));
      } else {
        toast.error(data.message || 'Failed to approve volunteer');
      }
    } catch (error) {
      toast.error('An error occurred while approving the volunteer.');
    }
  };

  const handleReject = async (volunteerId) => {
    if (!window.confirm('Are you sure you want to reject this volunteer? This is permanent.')) return;
    try {
      const res = await fetch(`/api/admin/volunteers/${volunteerId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Volunteer rejected.');
        setPendingVolunteers(prev => prev.filter(v => v._id !== volunteerId));
      } else {
        toast.error(data.message || 'Failed to reject volunteer');
      }
    } catch (error) {
      toast.error('An error occurred while rejecting the volunteer.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This is permanent.')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { 
        method: 'DELETE', 
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User deleted successfully!');
        setUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the user.');
    }
  };

  const handleCompleteHelp = async (helpId) => {
    if (!window.confirm('Are you sure you want to mark this help request as complete?')) return;
    try {
      const res = await fetch(`/api/admin/helps/${helpId}/complete`, { 
        method: 'PATCH', 
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Help request marked as complete!');
        setHelps(prev => prev.filter(h => h._id !== helpId));
      } else {
        toast.error(data.message || 'Failed to complete help request');
      }
    } catch (error) {
      toast.error('An error occurred while completing the help request.');
    }
  };

  const handleCancelHelp = async (helpId) => {
    if (!window.confirm('Are you sure you want to cancel this help request?')) return;
    try {
      const res = await fetch(`/api/admin/helps/${helpId}/cancel`, { 
        method: 'PATCH', 
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Help request cancelled.');
        setHelps(prev => prev.filter(h => h._id !== helpId));
      } else {
        toast.error(data.message || 'Failed to cancel help request');
      }
    } catch (error) {
      toast.error('An error occurred while cancelling the help request.');
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingVolunteers();
    } else if (activeTab === 'users') {
      if (userSubTab === 'Banned') {
        fetchBannedUsers();
      } else {
        fetchAllUsers(userSubTab);
      }
    } else if (activeTab === 'helps') {
      fetchAllHelps();
    }
  }, [activeTab, userSubTab, bannedCategory]);

  useEffect(() => {
    setUserSearch('');
  }, [userSubTab]);

  // Filter logic for active users
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filter logic for banned users
  const filteredBannedUsers = bannedUsers.filter(user =>
    user.name.toLowerCase().includes(bannedSearch.toLowerCase())
  );

  const filteredHelps = helps.filter(help => {
    const locationMatch = helpLocationFilter === 'All' || help.location === helpLocationFilter;
    const skillMatch = helpSkillFilter === 'All' || help.helptitle === helpSkillFilter;
    const dateMatch = !helpDateFilter || help.helpdate === helpDateFilter;
    return locationMatch && skillMatch && dateMatch;
  });

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button
          onClick={signout}
          className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow"
        >
          <LogOut size={18} className="mr-2" /> Sign Out
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <button onClick={() => setActiveTab('pending')} className={`py-2 px-4 rounded ${activeTab === 'pending' ? 'bg-blue-600' : 'bg-gray-700'} mr-4`}>
          Pending Volunteers
        </button>
        <button onClick={() => setActiveTab('users')} className={`py-2 px-4 rounded ${activeTab === 'users' ? 'bg-blue-600' : 'bg-gray-700'} mr-4`}>
          Manage Users
        </button>
        <button onClick={() => setActiveTab('helps')} className={`py-2 px-4 rounded ${activeTab === 'helps' ? 'bg-blue-600' : 'bg-gray-700'}`}>
          Manage Help Requests
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Pending Volunteer Approvals</h2>
          {pendingVolunteers.length === 0 ? (
            <p>No pending approvals.</p>
          ) : (
            <ul>
              {pendingVolunteers.map(volunteer => (
                <li key={volunteer._id} className="flex items-center justify-between p-4 border-b border-gray-700">
                  <div>
                    <p className="font-bold">{volunteer.name}</p>
                    <p className="text-sm text-gray-400">Email: {volunteer.email}</p>
                    <p className="text-sm text-gray-400">Contact No: {volunteer.contactno}</p>
                  </div>
                  <div>
                    <button 
                      onClick={() => handleApprove(volunteer._id)}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2">
                      Approve
                    </button>
                    <button
                      onClick={() => handleBanUser(volunteer._id, pendingVolunteers, setPendingVolunteers)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-2">
                      Ban
                    </button>
                    <button 
                      onClick={() => handleReject(volunteer._id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {activeTab === 'users' && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
          {/* User Role Tabs */}
          <div className="mb-4">
            <button onClick={() => setUserSubTab('Volunteer')} className={`py-2 px-4 rounded ${userSubTab === 'Volunteer' ? 'bg-blue-500' : 'bg-gray-600'} mr-2`}>
              Volunteers
            </button>
            <button onClick={() => setUserSubTab('Citizen')} className={`py-2 px-4 rounded ${userSubTab === 'Citizen' ? 'bg-blue-500' : 'bg-gray-600'} mr-2`}>
              Citizens
            </button>
            <button onClick={() => setUserSubTab('Banned')} className={`py-2 px-4 rounded ${userSubTab === 'Banned' ? 'bg-blue-500' : 'bg-gray-600'}`}>
              Banned Users
            </button>
          </div>
          {loading ? <p>Loading...</p> : (
            <>
              {userSubTab !== 'Banned' && (
                <>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder={`Search ${userSubTab}s by name...`}
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="bg-gray-700 p-2 rounded w-full"
                    />
                  </div>
                  <ul>
                    {filteredUsers.map(user => (
                      <li key={user._id} className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div>
                          <p className="font-bold">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                        <div>
                          <button onClick={() => handleBanUser(user._id, users, setUsers)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-2">
                            Ban
                          </button>
                          <button onClick={() => handleDeleteUser(user._id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {userSubTab === 'Banned' && (
                <div>
                  <div className="flex space-x-4 mb-4">
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={bannedSearch}
                      onChange={(e) => setBannedSearch(e.target.value)}
                      className="bg-gray-700 p-2 rounded w-full"
                    />
                    <select value={bannedCategory} onChange={(e) => setBannedCategory(e.target.value)} className="bg-gray-700 p-2 rounded">
                      <option value="All">All Categories</option>
                      <option value="Volunteer">Volunteers</option>
                      <option value="Citizen">Citizens</option>
                    </select>
                  </div>
                  <ul>
                    {filteredBannedUsers.map(user => (
                      <li key={user._id} className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div>
                          <p className="font-bold">{user.name} ({user.category})</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                        <button onClick={() => handleUnbanUser(user._id)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                          Unban
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {activeTab === 'helps' && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Manage Help Requests</h2>
          <div className="flex space-x-4 mb-4">
            <select value={helpLocationFilter} onChange={(e) => setHelpLocationFilter(e.target.value)} className="bg-gray-700 p-2 rounded w-full">
              <option value="All">All Locations</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <select value={helpSkillFilter} onChange={(e) => setHelpSkillFilter(e.target.value)} className="bg-gray-700 p-2 rounded w-full">
              <option value="All">All Skills</option>
              {helpCategories.map(cat => <option key={cat.id} value={cat.label}>{cat.label}</option>)}
            </select>
            <input
              type="date"
              value={helpDateFilter}
              onChange={e => setHelpDateFilter(e.target.value)}
              className="bg-gray-700 p-2 rounded w-full text-white"
              placeholder="Date Needed"
            />
          </div>
          {loading ? <p>Loading...</p> : (
            <ul>
              {filteredHelps.map(help => {
                const isAccepted = help.volunteerDetails?.isAccepted;
                const status = isAccepted ? 'In Progress' : 'Pending';
                const statusColor = isAccepted ? 'text-green-400' : 'text-yellow-400';

                return (
                  <li key={help._id} className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{help.helptitle}</p>
                        <p className="text-sm text-gray-400">Requester: {help.name}</p>
                        {help.helpdate && (
                          <p className="text-xs text-blue-300 mt-1">Date Needed: {help.helpdate}</p>
                        )}
                        {help.helptime && (
                          <p className="text-xs text-blue-300 mt-1">Time Needed: {help.helptime}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`font-semibold ${statusColor}`}>{status}</span>
                        <div className="mt-2">
                          <button onClick={() => handleCompleteHelp(help._id)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2">
                            Complete
                          </button>
                          <button onClick={() => handleCancelHelp(help._id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-300">{help.helpdescription}</p>
                    {isAccepted && (
                      <p className="mt-2 text-xs text-gray-500">
                        Accepted by: {help.volunteerDetails.name} ({help.volunteerDetails.contactno})
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 