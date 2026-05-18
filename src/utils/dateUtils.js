function formatDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    weekday: 'short',
  });
}

function formatLongDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    weekday: 'long',
  });
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function buildWeekDays(selectedDateKey) {
  const selectedDate = new Date(`${selectedDateKey}T12:00:00`);
  const start = addDays(selectedDate, -selectedDate.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    return {
      key: toDateKey(date),
      label: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      number: date.getDate(),
    };
  });
}

function buildMonthDays(selectedDateKey) {
  const selectedDate = new Date(`${selectedDateKey}T12:00:00`);
  const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1, 12);
  const start = addDays(firstDay, -firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    return {
      key: toDateKey(date),
      number: date.getDate(),
      muted: date.getMonth() !== selectedDate.getMonth(),
    };
  });
}

function countAppointmentsByDate(appointments, dateKey) {
  return appointments.filter((appointment) => appointment.date === dateKey).length;
}

export {
  buildMonthDays,
  buildWeekDays,
  countAppointmentsByDate,
  formatDate,
  formatLongDate,
};
