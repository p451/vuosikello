import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

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

  const [events, setEvents] = useState({
    holidays: [
      { id: 1, startDate: '2025-01-01', endDate: '2025-01-01', name: 'Uudenvuodenpäivä', type: 'general' },
      { id: 2, startDate: '2025-01-06', endDate: '2025-01-06', name: 'Loppiainen', type: 'general' },
      { id: 3, startDate: '2025-04-07', endDate: '2025-04-07', name: 'Pitkäperjantai', type: 'general' },
      { id: 4, startDate: '2025-05-01', endDate: '2025-05-01', name: 'Vappu', type: 'general' }
    ],
    bakery: [
      { id: 5, startDate: '2025-03-01', endDate: '2025-03-07', name: 'Laskiaispullasesonki', type: 'bakery' },
      { id: 6, startDate: '2025-04-01', endDate: '2025-04-10', name: 'Pääsiäisleivonnaisten valmistus', type: 'bakery' },
      { id: 7, startDate: '2025-12-01', endDate: '2025-12-24', name: 'Joulusesonki', type: 'bakery' }
    ],
    gym: [
      { id: 8, startDate: '2025-01-01', endDate: '2025-01-31', name: 'Uudenvuoden kampanja', type: 'gym' },
      { id: 9, startDate: '2025-05-01', endDate: '2025-06-30', name: 'Kesäkuntoon-kampanja', type: 'gym' },
      { id: 10, startDate: '2025-09-01', endDate: '2025-09-30', name: 'Syyskausi alkaa', type: 'gym' }
    ]
  });

  const deleteEvent = (eventToDelete) => {
    setEvents(prevEvents => {
      const newEvents = { ...prevEvents };
      Object.keys(newEvents).forEach(key => {
        newEvents[key] = newEvents[key].filter(event => event.id !== eventToDelete.id);
      });
      return newEvents;
    });
  };

  const addEvent = () => {
    const newId = Math.max(...Object.values(events).flat().map(e => e.id)) + 1;
    const eventWithId = { ...newEvent, id: newId };
    
    setEvents(prevEvents => ({
      ...prevEvents,
      [newEvent.type === 'general' ? 'holidays' : newEvent.type]: [
        ...prevEvents[newEvent.type === 'general' ? 'holidays' : newEvent.type],
        eventWithId
      ]
    }));
    
    setShowAddModal(false);
    setNewEvent({ name: '', startDate: '', endDate: '', type: 'general' });
  };

  const updateEvent = () => {
    setEvents(prevEvents => {
      const newEvents = { ...prevEvents };
      const category = editEvent.type === 'general' ? 'holidays' : editEvent.type;
      newEvents[category] = newEvents[category].map(event =>
        event.id === editEvent.id ? editEvent : event
      );
      return newEvents;
    });
    setShowEditModal(false);
    setEditEvent(null);
  };

  const handleEventClick = (event) => {
    setEditEvent(event);
    setShowEditModal(true);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
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

  const renderContent = () => {
    if (viewMode === 'month') {
      const daysInMonth = getDaysInMonth(currentDate);
      const days = Array.from({ length: daysInMonth }, (_, i) => 
        new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
      );

      return (
        <div className="grid grid-cols-7 gap-1">
          {['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'].map(day => (
            <div key={day} className="p-2 text-center font-bold bg-gray-100">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <div key={index} className="p-2 border min-h-32">
              <div className="font-bold">{day.getDate()}</div>
              <div className="text-xs space-y-1">
                {Object.values(events).flat().map((event) => {
                  const startDate = new Date(event.startDate);
                  const endDate = new Date(event.endDate);
                  if (day >= startDate && day <= endDate &&
                      (selectedLayer === 'all' || event.type === selectedLayer)) {
                    return (
                      <div 
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`p-1 rounded flex justify-between items-center cursor-pointer hover:opacity-80 ${
                          event.type === 'general' ? 'bg-red-100' :
                          event.type === 'bakery' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}
                      >
                        <span>{event.name}</span>
                        {event.type !== 'general' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event);
                            }}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      );
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate);
      
      return (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div key={index} className="border p-4 min-h-[400px]">
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
                      <div 
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`p-2 rounded text-sm cursor-pointer hover:opacity-80 ${
                          event.type === 'general' ? 'bg-red-100' :
                          event.type === 'bakery' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{event.name}</span>
                          {event.type !== 'general' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(event);
                              }}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
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
                  <div 
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className={`p-4 rounded cursor-pointer hover:opacity-80 ${
                      event.type === 'general' ? 'bg-red-100' :
                      event.type === 'bakery' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">{event.name}</div>
                        <div className="text-sm text-gray-600">
                          {event.type === 'general' ? 'Yleinen' :
                           event.type === 'bakery' ? 'Leipomo' : 'Sali'}
                        </div>
                      </div>
                      {event.type !== 'general' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEvent(event);
                          }}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
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
            .print-only {
              margin: 0;
              padding: 0;
            }
            .calendar-container {
              width: 100% !important;
              max-width: none !important;
            }
            .day-cell {
              min-height: 300px !important;
              padding: 1.5rem !important;
            }
            @page {
              size: landscape;
              margin: 1cm;
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
            Tulosta
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

      <div className="border rounded-lg shadow-lg bg-white p-4 print-only calendar-container">
        {renderContent()}
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
                <div>
                  {editEvent.type !== 'general' && (
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded"
                      onClick={() => {
                        deleteEvent(editEvent);
                        setShowEditModal(false);
                      }}
                    >
                      Poista
                    </button>
                  )}
                </div>
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