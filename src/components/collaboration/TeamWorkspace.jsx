import React, { useState, useEffect } from 'react';

const TeamWorkspace = () => {
  const [activeTab, setActiveTab] = useState('team');
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [comments, setComments] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = () => {
    // Mock team data
    const mockTeamMembers = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh@company.com',
        role: 'admin',
        avatar: '👨‍💼',
        status: 'online',
        joinedAt: '2024-01-15',
        tasksAssigned: 12,
        tasksCompleted: 8
      },
      {
        id: '2',
        name: 'Priya Sharma',
        email: 'priya@company.com',
        role: 'member',
        avatar: '👩‍💻',
        status: 'online',
        joinedAt: '2024-02-20',
        tasksAssigned: 8,
        tasksCompleted: 6
      },
      {
        id: '3',
        name: 'Amit Singh',
        email: 'amit@company.com',
        role: 'member',
        avatar: '👨‍🔧',
        status: 'offline',
        joinedAt: '2024-03-10',
        tasksAssigned: 5,
        tasksCompleted: 3
      }
    ];

    const mockAssignments = [
      {
        id: '1',
        tenderId: 'GEM/2024/B/12345',
        tenderTitle: 'IT Infrastructure Upgrade',
        assignedTo: '2',
        assignedBy: '1',
        task: 'Prepare technical proposal',
        priority: 'high',
        status: 'in-progress',
        dueDate: '2024-08-20',
        createdAt: '2024-08-10',
        progress: 60
      },
      {
        id: '2',
        tenderId: 'GEM/2024/B/12346',
        tenderTitle: 'Medical Equipment Supply',
        assignedTo: '3',
        assignedBy: '1',
        task: 'Financial analysis and costing',
        priority: 'medium',
        status: 'pending',
        dueDate: '2024-08-25',
        createdAt: '2024-08-12',
        progress: 0
      },
      {
        id: '3',
        tenderId: 'GEM/2024/B/12347',
        tenderTitle: 'Construction Project',
        assignedTo: '2',
        assignedBy: '1',
        task: 'Review compliance requirements',
        priority: 'low',
        status: 'completed',
        dueDate: '2024-08-15',
        createdAt: '2024-08-08',
        progress: 100
      }
    ];

    const mockComments = [
      {
        id: '1',
        tenderId: 'GEM/2024/B/12345',
        userId: '2',
        userName: 'Priya Sharma',
        userAvatar: '👩‍💻',
        message: 'I\'ve completed the initial technical assessment. The requirements seem feasible but we need to clarify the deployment timeline.',
        timestamp: '2024-08-10T14:30:00Z',
        replies: [
          {
            id: '1-1',
            userId: '1',
            userName: 'Rajesh Kumar',
            userAvatar: '👨‍💼',
            message: 'Good work! Can you schedule a call with the client to discuss the timeline?',
            timestamp: '2024-08-10T15:00:00Z'
          }
        ]
      },
      {
        id: '2',
        tenderId: 'GEM/2024/B/12346',
        userId: '1',
        userName: 'Rajesh Kumar',
        userAvatar: '👨‍💼',
        message: 'This tender has a tight deadline. Let\'s prioritize this and allocate additional resources if needed.',
        timestamp: '2024-08-12T09:15:00Z',
        replies: []
      }
    ];

    setTeamMembers(mockTeamMembers);
    setAssignments(mockAssignments);
    setComments(mockComments);
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return;

    const newMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: '👤',
      status: 'invited',
      joinedAt: new Date().toISOString().split('T')[0],
      tasksAssigned: 0,
      tasksCompleted: 0
    };

    setTeamMembers(prev => [...prev, newMember]);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('member');
  };

  const updateTaskProgress = (assignmentId, newProgress) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { 
            ...assignment, 
            progress: newProgress,
            status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in-progress' : 'pending'
          }
        : assignment
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Workspace</h2>
            <p className="text-gray-600">Collaborate with your team on tender preparation</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Invite Member
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'team', name: 'Team Members', icon: '👥' },
              { id: 'assignments', name: 'Assignments', icon: '📋' },
              { id: 'discussions', name: 'Discussions', icon: '💬' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Team Members Tab */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{member.avatar}</div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          member.status === 'online' ? 'bg-green-100 text-green-800' : 
                          member.status === 'offline' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            member.status === 'online' ? 'bg-green-400' : 
                            member.status === 'offline' ? 'bg-gray-400' :
                            'bg-yellow-400'
                          }`}></span>
                          {member.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Tasks: {member.tasksCompleted}/{member.tasksAssigned}
                    </div>
                    <div className="text-xs text-gray-500">
                      Joined: {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const assignedMember = teamMembers.find(m => m.id === assignment.assignedTo);
                const assignedByMember = teamMembers.find(m => m.id === assignment.assignedBy);
                
                return (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{assignment.task}</h4>
                        <p className="text-sm text-gray-600">{assignment.tenderTitle}</p>
                        <p className="text-xs text-gray-500">ID: {assignment.tenderId}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{assignedMember?.avatar}</span>
                          <span className="text-sm text-gray-600">Assigned to {assignedMember?.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          by {assignedByMember?.name}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm text-gray-900">{assignment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${assignment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateTaskProgress(assignment.id, Math.min(100, assignment.progress + 25))}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          +25%
                        </button>
                        <button
                          onClick={() => updateTaskProgress(assignment.id, 100)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Discussions Tab */}
          {activeTab === 'discussions' && (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{comment.userAvatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">{comment.userName}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          Tender: {comment.tenderId}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{comment.message}</p>
                      
                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start space-x-3">
                              <div className="text-xl">{reply.userAvatar}</div>
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900">{reply.userName}</span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(reply.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-gray-700">{reply.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <button className="text-blue-600 hover:text-blue-800 text-sm mt-2">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add Comment */}
              <div className="border border-gray-200 rounded-lg p-4">
                <textarea
                  placeholder="Add a comment or discussion..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
                <div className="flex justify-end mt-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMember}
                disabled={!inviteEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamWorkspace;