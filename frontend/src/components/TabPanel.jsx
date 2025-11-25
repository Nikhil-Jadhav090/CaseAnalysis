import React from 'react';

export default function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className={value === index ? 'block' : 'hidden'}
    >
      {value === index && <div className="py-4">{children}</div>}
    </div>
  );
}