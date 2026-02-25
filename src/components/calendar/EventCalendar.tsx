import React, { useState } from 'react';
import { useEvents } from '../../hooks/useEvents';
import { formatDateForInput } from '../../utils/dateUtils';
import '../calendar/EventCalendar.css';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  eventCount: number;
}

interface EventCalendarProps {
  onDateSelect?: (date: Date) => void;
  onNavigate?: (date: Date) => void;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({
  onDateSelect,
  onNavigate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Map<string, number>>(new Map());

  // Fetch events for the current month
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const { data } = useEvents({
    startDate: formatDateForInput(monthStart),
    endDate: formatDateForInput(monthEnd),
    limit: 1000,
  });

  React.useEffect(() => {
    if (data?.data) {
      const eventMap = new Map<string, number>();
      data.data.forEach((event) => {
        const dateKey = new Date(event.date).toISOString().split('T')[0];
        eventMap.set(dateKey, (eventMap.get(dateKey) || 0) + 1);
      });
      setEvents(eventMap);
    }
  }, [data]);

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    setCurrentMonth(newDate);
    onNavigate?.(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    setCurrentMonth(newDate);
    onNavigate?.(newDate);
  };

  const handleDateClick = (date: Date) => {
    onDateSelect?.(date);
  };

  const getDaysInCalendar = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get starting day of week (0 = Sunday)
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];
    const today = new Date();

    // Add previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, 1 - i - 1);
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        eventCount: 0,
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday,
        eventCount: events.get(dateKey) || 0,
      });
    }

    // Add next month's days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        eventCount: 0,
      });
    }

    return days;
  };

  const days = getDaysInCalendar();
  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="event-calendar">
      <div className="calendar-header">
        <button
          className="calendar-nav-btn"
          onClick={handlePreviousMonth}
          aria-label="Previous month"
        >
          ←
        </button>

        <h2 className="calendar-month">{monthName}</h2>

        <button
          className="calendar-nav-btn"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="calendar-weekdays">
        <div className="weekday">Sun</div>
        <div className="weekday">Mon</div>
        <div className="weekday">Tue</div>
        <div className="weekday">Wed</div>
        <div className="weekday">Thu</div>
        <div className="weekday">Fri</div>
        <div className="weekday">Sat</div>
      </div>

      <div className="calendar-days">
        {days.map((day) => (
          <button
            key={day.date.toISOString()}
            className={`calendar-day ${
              day.isCurrentMonth ? 'current-month' : 'other-month'
            } ${day.isToday ? 'today' : ''} ${
              day.eventCount > 0 ? 'has-events' : ''
            }`}
            onClick={() => handleDateClick(day.date)}
            aria-label={`${day.day} ${
              day.eventCount > 0
                ? `(${day.eventCount} event${day.eventCount > 1 ? 's' : ''})`
                : ''
            }`}
          >
            <span className="day-number">{day.day}</span>
            {day.eventCount > 0 && (
              <span className="event-indicator">{day.eventCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <div className="legend-color has-events"></div>
          <span>Has Events</span>
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
