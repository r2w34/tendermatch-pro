import React, { useState, useEffect } from 'react';

const BidCalendar = ({ tenders }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    generateCalendarEvents();
  }, [tenders, currentDate]);

  const generateCalendarEvents = () => {
    if (!tenders) return;

    const events = [];
    const today = new Date();

    tenders.forEach(tender => {
      const deadline = new Date(tender.deadline);
      const publishDate = new Date(tender.publishedDate);
      
      // Add deadline events
      events.push({
        id: `deadline-${tender.id}`,
        title: `Deadline: ${tender.title}`,
        date: deadline,
        type: 'deadline',
        priority: getDaysUntilDeadline(deadline) <= 7 ? 'high' : 
                 getDaysUntilDeadline(deadline) <= 14 ? 'medium' : 'low',
        tender: tender,
        color: getDaysUntilDeadline(deadline) <= 7 ? 'bg-red-500' : 
               getDaysUntilDeadline(deadline) <= 14 ? 'bg-yellow-500' : 'bg-blue-500'
      });

      // Add reminder events (3 days before deadline)
      const reminderDate = new Date(deadline);
      reminderDate.setDate(reminderDate.getDate() - 3);
      
      if (reminderDate > today) {
        events.push({
          id: `reminder-${tender.id}`,
          title: `Reminder: ${tender.title}`,
          date: reminderDate,
          type: 'reminder',
          priority: 'medium',
          tender: tender,
          color: 'bg-orange-500'
        });
      }

      // Add milestone events (mock data)
      if (tender.status === 'Active') {
        const milestones = [
          { name: 'Document Review', days: -5 },
          { name: 'Technical Proposal', days: -10 },
          { name: 'Financial Proposal', days: -7 },
          { name: 'Final Review', days: -2 }
        ];

        milestones.forEach(milestone => {
          const milestoneDate = new Date(deadline);
          milestoneDate.setDate(milestoneDate.getDate() + milestone.days);
          
          if (milestoneDate > today) {
            events.push({
              id: `milestone-${tender.id}-${milestone.name}`,
              title: `${milestone.name}: ${tender.title}`,
              date: milestoneDate,
              type: 'milestone',
              priority: 'low',
              tender: tender,
              color: 'bg-green-500'
            });
          }
        });
      }
    });

    setCalendarEvents(events.sort((a, b) => a.date - b.date));
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const diffTime = deadline - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date) => {
    return calendarEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'bg-blue-100 border-blue-400' : ''}`}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1 mt-1">
            {events.slice(0, 2).map(event => (
              <div
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                  setShowEventModal(true);
                }}
                className={`text-xs p-1 rounded text-white truncate cursor-pointer ${event.color}`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-gray-500">
                +{events.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="h-10 border border-gray-200 bg-gray-50 flex items-center justify-center font-medium text-gray-700">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderUpcomingEvents = () => {
    const upcomingEvents = calendarEvents
      .filter(event => event.date >= new Date())
      .slice(0, 10);

    return (
      <div className="space-y-3">
        {upcomingEvents.map(event => (
          <div
            key={event.id}
            onClick={() => {
              setSelectedEvent(event);
              setShowEventModal(true);
            }}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
          >
            <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <span>{event.date.toLocaleDateString()}</span>
                <span>•</span>
                <span className="capitalize">{event.type}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full ${
                  event.priority === 'high' ? 'bg-red-100 text-red-800' :
                  event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {event.priority}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {getDaysUntilDeadline(event.date)} days
            </div>
          </div>
        ))}
      </div>
    );
  };

  const exportToGoogleCalendar = (event) => {
    const startDate = event.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(event.date.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(`Tender: ${event.tender.title}\nID: ${event.tender.id}\nBudget: ₹${event.tender.budget?.toLocaleString()}`)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bid Calendar</h2>
            <p className="text-gray-600">Track deadlines, milestones, and reminders</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm rounded-md ${
                  viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded-md ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {renderMonthView()}
          </div>

          {/* Legend */}
          <div className="p-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Urgent Deadline</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">Upcoming Deadline</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Future Deadline</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-600">Reminder</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Milestone</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          {renderUpcomingEvents()}
        </div>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Date:</span>
                  <p className="text-lg text-gray-900">{selectedEvent.date.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <p className="text-lg text-gray-900 capitalize">{selectedEvent.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Priority:</span>
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                    selectedEvent.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedEvent.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedEvent.priority}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Days Until:</span>
                  <p className="text-lg text-gray-900">{getDaysUntilDeadline(selectedEvent.date)} days</p>
                </div>
              </div>

              {/* Tender Details */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Tender Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tender ID:</span>
                    <span className="text-sm text-gray-900">{selectedEvent.tender.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Title:</span>
                    <span className="text-sm text-gray-900">{selectedEvent.tender.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Budget:</span>
                    <span className="text-sm text-gray-900">₹{selectedEvent.tender.budget?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Department:</span>
                    <span className="text-sm text-gray-900">{selectedEvent.tender.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm text-gray-900">{selectedEvent.tender.location?.city}, {selectedEvent.tender.location?.state}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => exportToGoogleCalendar(selectedEvent)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800"
                >
                  Add to Google Calendar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Set Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidCalendar;