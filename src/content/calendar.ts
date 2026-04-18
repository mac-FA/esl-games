export type CalendarPrep = 'in' | 'on' | 'at';

export type CalendarItem = {
  id: string;
  text: string;
  prep: CalendarPrep;
  note?: string;
};

// 66 items: ~22 each. A1/A2 level, Japan-friendly contexts.
export const ITEMS: CalendarItem[] = [
  // ---------------- IN (months, years, seasons, parts of day, long periods) ----------------
  { id: 'in01', text: 'January', prep: 'in', note: 'Months → in' },
  { id: 'in02', text: 'March', prep: 'in', note: 'Months → in' },
  { id: 'in03', text: 'April', prep: 'in', note: 'Months → in' },
  { id: 'in04', text: 'July', prep: 'in', note: 'Months → in' },
  { id: 'in05', text: 'September', prep: 'in', note: 'Months → in' },
  { id: 'in06', text: 'December', prep: 'in', note: 'Months → in' },
  { id: 'in07', text: '1998', prep: 'in', note: 'Years → in' },
  { id: 'in08', text: '2024', prep: 'in', note: 'Years → in' },
  { id: 'in09', text: 'the 1990s', prep: 'in', note: 'Decades → in' },
  { id: 'in10', text: 'the morning', prep: 'in', note: 'Parts of the day → in' },
  { id: 'in11', text: 'the afternoon', prep: 'in', note: 'Parts of the day → in' },
  { id: 'in12', text: 'the evening', prep: 'in', note: 'Parts of the day → in' },
  { id: 'in13', text: 'spring', prep: 'in', note: 'Seasons → in' },
  { id: 'in14', text: 'summer', prep: 'in', note: 'Seasons → in' },
  { id: 'in15', text: 'autumn', prep: 'in', note: 'Seasons → in' },
  { id: 'in16', text: 'winter', prep: 'in', note: 'Seasons → in' },
  { id: 'in17', text: 'two weeks', prep: 'in', note: 'In + length of time (future)' },
  { id: 'in18', text: 'five minutes', prep: 'in', note: 'In + length of time (future)' },
  { id: 'in19', text: 'an hour', prep: 'in', note: 'In + length of time (future)' },
  { id: 'in20', text: 'October', prep: 'in', note: 'Months → in' },
  { id: 'in21', text: 'the 21st century', prep: 'in', note: 'Centuries → in' },
  { id: 'in22', text: 'May', prep: 'in', note: 'Months → in' },

  // ---------------- ON (days, dates, named days) ----------------
  { id: 'on01', text: 'Monday', prep: 'on', note: 'Days of the week → on' },
  { id: 'on02', text: 'Tuesday', prep: 'on', note: 'Days of the week → on' },
  { id: 'on03', text: 'Wednesday', prep: 'on', note: 'Days of the week → on' },
  { id: 'on04', text: 'Thursday', prep: 'on', note: 'Days of the week → on' },
  { id: 'on05', text: 'Friday', prep: 'on', note: 'Days of the week → on' },
  { id: 'on06', text: 'Saturday', prep: 'on', note: 'Days of the week → on' },
  { id: 'on07', text: 'Sunday', prep: 'on', note: 'Days of the week → on' },
  { id: 'on08', text: 'Monday morning', prep: 'on', note: 'Specific day + part = on' },
  { id: 'on09', text: 'Saturday night', prep: 'on', note: 'Specific day + part = on' },
  { id: 'on10', text: 'Friday afternoon', prep: 'on', note: 'Specific day + part = on' },
  { id: 'on11', text: 'my birthday', prep: 'on', note: 'Named days → on' },
  { id: 'on12', text: 'New Year\u2019s Day', prep: 'on', note: 'Named days → on' },
  { id: 'on13', text: 'Christmas Day', prep: 'on', note: 'Named days → on' },
  { id: 'on14', text: 'Valentine\u2019s Day', prep: 'on', note: 'Named days → on' },
  { id: 'on15', text: 'March 3rd', prep: 'on', note: 'Dates → on' },
  { id: 'on16', text: 'July 15th', prep: 'on', note: 'Dates → on' },
  { id: 'on17', text: 'December 25th', prep: 'on', note: 'Dates → on' },
  { id: 'on18', text: 'October 1st', prep: 'on', note: 'Dates → on' },
  { id: 'on19', text: 'our wedding day', prep: 'on', note: 'Named days → on' },
  { id: 'on20', text: 'the first day of school', prep: 'on', note: 'Specific single day → on' },
  { id: 'on21', text: 'Tuesday evening', prep: 'on', note: 'Specific day + part = on' },
  { id: 'on22', text: 'Mother\u2019s Day', prep: 'on', note: 'Named days → on' },

  // ---------------- AT (clock times, mealtimes, special points) ----------------
  { id: 'at01', text: '7 a.m.', prep: 'at', note: 'Clock times → at' },
  { id: 'at02', text: '8 o\u2019clock', prep: 'at', note: 'Clock times → at' },
  { id: 'at03', text: '12:30', prep: 'at', note: 'Clock times → at' },
  { id: 'at04', text: '3 p.m.', prep: 'at', note: 'Clock times → at' },
  { id: 'at05', text: 'half past six', prep: 'at', note: 'Clock times → at' },
  { id: 'at06', text: 'quarter to five', prep: 'at', note: 'Clock times → at' },
  { id: 'at07', text: '9:45', prep: 'at', note: 'Clock times → at' },
  { id: 'at08', text: 'noon', prep: 'at', note: 'Points of day → at' },
  { id: 'at09', text: 'midnight', prep: 'at', note: 'Points of day → at' },
  { id: 'at10', text: 'night', prep: 'at', note: '\u201Cat night\u201D (fixed phrase)' },
  { id: 'at11', text: 'sunrise', prep: 'at', note: 'Points of day → at' },
  { id: 'at12', text: 'sunset', prep: 'at', note: 'Points of day → at' },
  { id: 'at13', text: 'breakfast', prep: 'at', note: 'Mealtimes → at' },
  { id: 'at14', text: 'lunch', prep: 'at', note: 'Mealtimes → at' },
  { id: 'at15', text: 'dinner', prep: 'at', note: 'Mealtimes → at' },
  { id: 'at16', text: 'lunchtime', prep: 'at', note: 'Mealtimes → at' },
  { id: 'at17', text: 'bedtime', prep: 'at', note: '\u201Cat bedtime\u201D (fixed phrase)' },
  { id: 'at18', text: 'the weekend', prep: 'at', note: '\u201Cat the weekend\u201D (UK usage)' },
  { id: 'at19', text: 'the moment', prep: 'at', note: '\u201Cat the moment\u201D = right now' },
  { id: 'at20', text: 'the same time', prep: 'at', note: '\u201Cat the same time\u201D (fixed phrase)' },
  { id: 'at21', text: '6:15', prep: 'at', note: 'Clock times → at' },
  { id: 'at22', text: 'half past ten', prep: 'at', note: 'Clock times → at' },
];
