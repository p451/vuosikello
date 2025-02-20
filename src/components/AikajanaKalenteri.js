import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const AikajanaKalenteri = () => {
  const [viewMode, setViewMode] = useState('month');
  const [selectedLayer, setSelectedLayer] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    name: '',
    startDate: '',
    endDate: '',
    type: 'general'
  });

  const defaultHolidays = [
    { id: 1, startDate: '2024-01-01', endDate: '2024-01-01', name: 'Uudenvuodenpäivä', type: 'pyhät' },
    { id: 2, startDate: '2024-01-06', endDate: '2024-01-06', name: 'Loppiainen', type: 'pyhät' },
    { id: 3, startDate: '2024-03-29', endDate: '2024-03-29', name: 'Pitkäperjantai', type: 'pyhät' },
    { id: 4, startDate: '2024-03-31', endDate: '2024-03-31', name: 'Pääsiäispäivä', type: 'pyhät' },
    { id: 5, startDate: '2024-04-01', endDate: '2024-04-01', name: 'Toinen pääsiäispäivä', type: 'pyhät' },
    { id: 6, startDate: '2024-05-01', endDate: '2024-05-01', name: 'Vappu', type: 'pyhät' },
    { id: 7, startDate: '2024-05-09', endDate: '2024-05-09', name: 'Helatorstai', type: 'pyhät' },
    { id: 8, startDate: '2024-06-22', endDate: '2024-06-22', name: 'Juhannuspäivä', type: 'pyhät' },
    { id: 9, startDate: '2024-12-06', endDate: '2024-12-06', name: 'Itsenäisyyspäivä', type: 'pyhät' },
    { id: 10, startDate: '2024-12-25', endDate: '2024-12-25', name: 'Joulupäivä', type: 'pyhät' },
    { id: 11, startDate: '2024-12-26', endDate: '2024-12-26', name: 'Tapaninpäivä', type: 'pyhät' },
    { id: 12, startDate: '2025-01-01', endDate: '2025-01-01', name: 'Uudenvuodenpäivä', type: 'pyhät' },
    { id: 13, startDate: '2025-01-06', endDate: '2025-01-06', name: 'Loppiainen', type: 'pyhät' },
    { id: 14, startDate: '2025-04-18', endDate: '2025-04-18', name: 'Pitkäperjantai', type: 'pyhät' },
    { id: 15, startDate: '2025-04-20', endDate: '2025-04-20', name: 'Pääsiäispäivä', type: 'pyhät' },
    { id: 16, startDate: '2025-04-21', endDate: '2025-04-21', name: 'Toinen pääsiäispäivä', type: 'pyhät' },
    { id: 17, startDate: '2025-05-01', endDate: '2025-05-01', name: 'Vappu', type: 'pyhät' },
    { id: 18, startDate: '2025-05-29', endDate: '2025-05-29', name: 'Helatorstai', type: 'pyhät' },
    { id: 19, startDate: '2025-06-21', endDate: '2025-06-21', name: 'Juhannuspäivä', type: 'pyhät' },
    { id: 20, startDate: '2025-12-06', endDate: '2025-12-06', name: 'Itsenäisyyspäivä', type: 'pyhät' },
    { id: 21, startDate: '2025-12-25', endDate: '2025-12-25', name: 'Joulupäivä', type: 'pyhät' },
    { id: 22, startDate: '2025-12-26', endDate: '2025-12-26', name: 'Tapaninpäivä', type: 'pyhät' }
  ];

  const [events, setEvents] = useState({
    pyhät: [],
    holidays: [],
    bakery: [],
    gym: []
  });

  useEffect(() => {
    fetchEvents();
    initializeHolidays();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;

      const formattedEvents = {
        pyhät: [],
        holidays: [],
        bakery: [],
        gym: []
      };

      data.forEach(event => {
        const category = event.type === 'general' ? 'holidays' : event.type;
        if (formattedEvents[category]) {
          formattedEvents[category].push({
            id: event.id,
            name: event.name,
            startDate: event.start_date,
            endDate: event.end_date,
            type: event.type
          });
        }
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const initializeHolidays = async () => {
    try {
      const { data: existingHolidays } = await supabase
        .from('events')
        .select('*')
        .eq('type', 'pyhät');

      if (!existingHolidays?.length) {
        const { error } = await supabase
          .from('events')
          .insert(defaultHolidays.map(holiday => ({
            name: holiday.name,
            start_date: holiday.startDate,
            end_date: holiday.endDate,
            type: holiday.type
          })));

        if (error) throw error;
        await fetchEvents();
      }
    } catch (error) {
      console.error('Error initializing holidays:', error);
    }
  };

  const deleteEvent = async (eventToDelete) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);

      if (error) throw error;

      const category = eventToDelete.type === 'general' ? 'holidays' : eventToDelete.type;
      setEvents(prev => ({
        ...prev,
        [category]: prev[category].filter(event => event.id !== eventToDelete.id)
      }));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const addEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          name: newEvent.name,
          start_date: newEvent.startDate,
          end_date: newEvent.endDate,
          type: newEvent.type
        }])
        .select();

      if (error) throw error;

      const category = newEvent.type === 'general' ? 'holidays' : newEvent.type;
      setEvents(prev => ({
        ...prev,
        [category]: [...prev[category], {
          id: data[0].id,
          name: data[0].name,
          startDate: data[0].start_date,
          endDate: data[0].end_date,
          type: data[0].type
        }]
      }));

      setShowAddModal(false);
      setNewEvent({ name: '', startDate: '', endDate: '', type: 'general' });
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const updateEvent = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          name: editEvent.name,
          start_date: editEvent.startDate,
          end_date: editEvent.endDate,
          type: editEvent.type
        })
        .eq('id', editEvent.id);

      if (error) throw error;
      await fetchEvents();
      setShowEditModal(false);
      setEditEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleEventClick = (event) => {
    setEditEvent(event);
    setShowEditModal(true);
  };

  const getDaysInMonth = (date) => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Adjust to start from Monday
    return { daysInMonth, firstDayWeekday };
  };

  const getWeekDays = (date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
      week.push(new Date(start.setDate(start.getDate() + (i === 0 ? 0 : 1))));
    }
    return week;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fi-FI', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + direction * 7);
    } else {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'pyhät':
        return 'bg-red-400';
      case 'general':
        return 'bg-purple-200';
      case 'bakery':
        return 'bg-yellow-200';
      case 'gym':
        return 'bg-blue-200';
      default:
        return 'bg-gray-200';
    }
  };

  const getEventTypeName = (type) => {
    switch (type) {
      case 'pyhät':
        return 'Pyhäpäivät';
      case 'general':
        return 'Yleinen';
      case 'bakery':
        return 'Leipomo';
      case 'gym':
        return 'Sali';
      default:
        return type;
    }
  };

  const getViewDateRange = () => {
    switch (viewMode) {
      case 'day':
        return {
          start: new Date(currentDate.setHours(0, 0, 0, 0)),
          end: new Date(currentDate.setHours(23, 59, 59, 999))
        };
      case 'week': {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay() + 1);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return { start, end };
      }
      case 'month': {
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        return { start, end };
      }
    }
  };

  const printAgenda = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
  
    const types = ['pyhät', 'general', 'bakery', 'gym'];
    const { start, end } = getViewDateRange();
    const viewTitle = {
      day: 'päivän',
      week: 'viikon',
      month: 'kuukauden'
    }[viewMode];
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Vuosikello - ${viewTitle} agenda</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .event-type { margin-top: 2em; }
            .event-list { margin-left: 2em; }
            .event-item { 
              padding: 0.5em;
              margin: 0.5em 0;
              border-radius: 4px;
              color: black;
            }
            .pyhät { background-color: #fc8181 !important; }
            .general { background-color: #d6bcfa !important; }
            .bakery { background-color: #faf089 !important; }
            .gym { background-color: #90cdf4 !important; }
            @media print {
              @page { margin: 1cm; }
              .event-item { 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body class="agenda-print">
          <h1>Vuosikello - ${currentDate.toLocaleDateString('fi-FI', { 
            month: 'long',
            year: 'numeric'
          })} ${viewTitle} tapahtumat</h1>
          ${types.map(type => `
            <div class="event-type">
              <h2>${getEventTypeName(type)}</h2>
              <div class="event-list">
                ${Object.values(events)
                  .flat()
                  .filter(event => {
                    const eventStart = parseLocalDate(event.startDate);
                    const eventEnd = parseLocalDate(event.endDate);
                    return event.type === type && 
                           eventStart <= end && 
                           eventEnd >= start;
                  })
                  .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                  .map(event => `
                    <div class="event-item ${type}">
                      <strong>${event.name}</strong><br>
                      ${new Date(event.startDate).toLocaleDateString('fi-FI')} - 
                      ${new Date(event.endDate).toLocaleDateString('fi-FI')}
                    </div>
                  `).join('')}
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const EventItem = ({ event, onClick, scale = 1 }) => (
    <div 
      onClick={onClick}
      className={`event-row p-1 rounded text-sm cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
      style={{ 
        fontSize: `${scale * 0.875}rem`,
        minHeight: `${scale * 1.5}rem`
      }}
    >
      <span className="truncate block">{event.name}</span>
    </div>
  );

  const ColorLegend = () => (
    <div className="color-legend my-4 flex gap-4 justify-center border-t pt-4">
      <div className="legend-item">
        <div className="legend-color w-4 h-4 rounded bg-red-400"></div>
        <span className="ml-2">Pyhäpäivät</span>
      </div>
      <div className="legend-item">
        <div className="legend-color w-4 h-4 rounded bg-purple-200"></div>
        <span className="ml-2">Yleinen</span>
      </div>
      <div className="legend-item">
        <div className="legend-color w-4 h-4 rounded bg-yellow-200"></div>
        <span className="ml-2">Leipomo</span>
      </div>
      <div className="legend-item">
        <div className="legend-color w-4 h-4 rounded bg-blue-200"></div>
        <span className="ml-2">Sali</span>
      </div>
    </div>
  );

  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const renderDayEvents = (events, day, type) => {
    const matchingEvents = events.filter(event => {
      const startDate = parseLocalDate(event.startDate);
      const endDate = parseLocalDate(event.endDate);
      return (type === 'pyhät' ? 
        isSameDay(day, startDate) : 
        isSameDay(day, startDate) || 
        (day >= startDate && day <= endDate)) &&
        (selectedLayer === 'all' || selectedLayer === type);
    });
  
    if (matchingEvents.length === 0) return null;
  
    const scale = Math.max(0.6, 1 - (matchingEvents.length - 1) * 0.2);
  
    return (
      <div className="flex flex-col gap-0.5">
        {matchingEvents.map((event, idx) => (
          <EventItem 
            key={event.id}
            event={event}
            onClick={() => handleEventClick(event)}
            scale={scale}
          />
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (viewMode === 'month') {
      const { daysInMonth, firstDayWeekday } = getDaysInMonth(currentDate);
      const days = [];

      // Add empty cells for days before the first day of month
      for (let i = 0; i < firstDayWeekday; i++) {
        days.push(null);
      }

      // Add actual days
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
      }

      return (
        <div className="grid grid-cols-7 gap-1">
          {['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'].map(day => (
            <div key={day} className="p-2 text-center font-bold bg-gray-100 day-header">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <div key={index} className="p-2 border min-h-32 day-cell">
              {day ? (
                <>
                  <div className="font-bold mb-1">{day.getDate()}</div>
                  <div className="space-y-1 flex flex-col">
                    {/* Holidays - always show */}
                    <div className="event-row min-h-[1.5rem]">
                      {renderDayEvents(events.pyhät, day, 'pyhät')}
                    </div>
                    {/* Other event types */}
                    {['general', 'bakery', 'gym'].map(type => (
                      <div key={type} className="event-row min-h-[1.5rem]">
                        {renderDayEvents(events[type === 'general' ? 'holidays' : type], day, type)}
                      </div>
                    ))}
                  </div>
                </>
              ) : <div className="min-h-[1.5rem]"></div>}
            </div>
          ))}
        </div>
      );
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate);
      
      return (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div key={index} className="border p-4 min-h-[400px]"> {/* Fixed missing closing curly brace */}
              <div className="font-bold text-center mb-6 text-xl">
                {day.toLocaleDateString('fi-FI', { weekday: 'short' })}<br />
                {day.getDate()}.{day.getMonth() + 1}.
              </div>
              <div className="space-y-3">
                {Object.values(events).flat().map((event) => {
                  const startDate = new Date(event.startDate);
                  const endDate = new Date(event.endDate);
                  if (day >= startDate && day <= endDate &&
                      (selectedLayer === 'all' || event.type === selectedLayer)) {
                    return (
                      <EventItem 
                        event={event}
                        onClick={() => handleEventClick(event)}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{formatDate(currentDate)}</h2>
          <div className="space-y-2">
            {Object.values(events).flat().map((event) => {
              const startDate = new Date(event.startDate);
              const endDate = new Date(event.endDate);
              if (currentDate >= startDate && currentDate <= endDate &&
                  (selectedLayer === 'all' || event.type === selectedLayer)) {
                return (
                  <EventItem 
                    event={event}
                    onClick={() => handleEventClick(event)}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            .calendar-container {
              width: 100% !important;
              max-width: none !important;
              padding: 0.5cm !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .calendar-header {
              font-size: 1rem !important;
              margin-bottom: 0.3cm !important;
            }
            .day-cell {
              min-height: auto !important;
              height: calc((29.7cm - 3cm) / 7) !important; /* A4 height minus margins and header/footer */
              padding: 0.2rem !important;
              font-size: 0.6rem !important;
            }
            .day-header {
              font-size: 0.7rem !important;
              padding: 0.1rem !important;
            }
            .event-row {
              min-height: 1rem !important;
              margin-bottom: 0.1rem !important;
              font-size: 0.6rem !important;
              line-height: 1 !important;
              padding: 0.1rem 0.2rem !important;
            }
            .color-legend {
              margin-top: 0.2rem !important;
              padding-top: 0.2rem !important;
              font-size: 0.6rem !important;
              gap: 0.5rem !important;
            }
            .legend-color {
              width: 0.6rem !important;
              height: 0.6rem !important;
            }
            .legend-item {
              gap: 0.2rem !important;
            }
            @page {
              size: portrait;
              margin: 0.5cm;
            }
          }
        `}
      </style>
      <div className="mb-4 space-y-4 no-print">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded ${viewMode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('day')}
          >
            Päivä
          </button>
          <button
            className={`px-4 py-2 rounded ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('week')}
          >
            Viikko
          </button>
          <button
            className={`px-4 py-2 rounded ${viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('month')}
          >
            Kuukausi
          </button>
        </div>
        
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded ${selectedLayer === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedLayer('all')}
          >
            Kaikki
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedLayer === 'bakery' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedLayer('bakery')}
          >
            Leipomo
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedLayer === 'gym' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedLayer('gym')}
          >
            Sali
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedLayer === 'general' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedLayer('general')}
          >
            Yleinen
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded bg-green-500 text-white"
          >
            Tulosta kalenteri
          </button>
          <button
            onClick={printAgenda}
            className="px-4 py-2 rounded bg-green-500 text-white"
          >
            Tulosta agenda
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded bg-blue-500 text-white"
          >
            Lisää tapahtuma
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded bg-gray-200"
          >
            &lt; Edellinen
          </button>
          <span className="font-bold">
            {currentDate.toLocaleDateString('fi-FI', { 
              month: 'long',
              year: 'numeric'
            })}
          </span>
          <button
            onClick={() => navigate(1)}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Seuraava &gt;
          </button>
        </div>
      </div>

      <div className="border rounded-lg shadow-lg bg-white p-4 calendar-container">
        <h2 className="text-center text-2xl font-bold mb-4 calendar-header">
          {currentDate.toLocaleDateString('fi-FI', { month: 'long', year: 'numeric' })}
        </h2>
        {renderContent()}
        <ColorLegend />
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Lisää uusi tapahtuma</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Nimi</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={newEvent.name}
                  onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block mb-1">Alkamispäivä</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={newEvent.startDate}
                  onChange={e => setNewEvent({...newEvent, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block mb-1">Päättymispäivä</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={newEvent.endDate}
                  onChange={e => setNewEvent({...newEvent, endDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block mb-1">Tyyppi</label>
                <select
                  className="w-full border p-2 rounded"
                  value={newEvent.type}
                  onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                >
                  <option value="general">Yleinen</option>
                  <option value="bakery">Leipomo</option>
                  <option value="gym">Sali</option>
                  <option value="pyhät">Pyhäpäivä</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setShowAddModal(false)}
                >
                  Peruuta
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={addEvent}
                >
                  Lisää
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Muokkaa tapahtumaa</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Nimi</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={editEvent.name}
                  onChange={e => setEditEvent({...editEvent, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block mb-1">Alkamispäivä</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={editEvent.startDate}
                  onChange={e => setEditEvent({...editEvent, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block mb-1">Päättymispäivä</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={editEvent.endDate}
                  onChange={e => setEditEvent({...editEvent, endDate: e.target.value})}
                />
              </div>
              {editEvent.type !== 'general' && (
                <div>
                  <label className="block mb-1">Tyyppi</label>
                  <select
                    className="w-full border p-2 rounded"
                    value={editEvent.type}
                    onChange={e => setEditEvent({...editEvent, type: e.target.value})}
                  >
                    <option value="bakery">Leipomo</option>
                    <option value="gym">Sali</option>
                  </select>
                </div>
              )}
              <div className="flex justify-between">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={() => {
                    deleteEvent(editEvent);
                    setShowEditModal(false);
                  }}
                >
                  Poista
                </button>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditEvent(null);
                    }}
                  >
                    Peruuta
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={updateEvent}
                  >
                    Tallenna
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AikajanaKalenteri;