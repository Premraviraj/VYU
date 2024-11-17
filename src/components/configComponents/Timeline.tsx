import React from 'react';

interface TimelineEvent {
  time: string;
  title: string;
  person: string;
  type: 'dental' | 'status' | 'calendar' | 'update' | 'meeting' | 'call';
}

const Timeline: React.FC = () => {
  const events: TimelineEvent[] = [
    {
      time: '8:30 - 9:00',
      title: 'Dental Cleaning and Care',
      person: 'Edward Johanson',
      type: 'dental'
    },
    {
      time: '8:30 - 9:00',
      title: 'Status update to John Doe',
      person: 'John Doe',
      type: 'status'
    },
    {
      time: '8:30 - 9:00',
      title: 'Calendar Updates',
      person: 'Edward Johanson',
      type: 'calendar'
    },
    {
      time: '8:30 - 9:00',
      title: 'Send Detailed Status Update',
      person: 'Mike Taylor',
      type: 'update'
    },
    {
      time: '8:30 - 9:00',
      title: 'Meeting with AR Shakir',
      person: 'AR Shakir',
      type: 'meeting'
    },
    {
      time: '8:30 - 9:00',
      title: 'Call New Leads',
      person: 'Mike, John, Chris',
      type: 'call'
    }
  ];

  return (
    <div className="timeline-container">
      {events.map((event, index) => (
        <div key={index} className="timeline-event">
          <div className="time-column">
            <span className="time">{event.time}</span>
          </div>
          <div className={`event-content ${event.type}`}>
            <h4>{event.title}</h4>
            <span className="person">{event.person}</span>
          </div>
          <button className="event-menu">⋮</button>
        </div>
      ))}
      <button className="add-event">+</button>
    </div>
  );
};

export default Timeline; 