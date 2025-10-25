// Auto-generate 15-min time slots between start_time & end_time

export const generateTimeSlots = (startTime, endTime) => {
  const slots = [];
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);

  while (start < end) {
    const slot = start.toTimeString().split(" ")[0].substring(0, 5);
    slots.push(slot);
    start.setMinutes(start.getMinutes() + 15);
  }

  return slots;
};
