"use client";

import React from "react";

type Props = {
  onChange: (date: Date | null) => void;
};

export default function DatePicker({ onChange }: Props) {
  function toInputValue(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const today = new Date();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.valueAsDate;
    onChange(date);
  };

  return (
    <input
      type="date"
      className="rounded border px-3 py-2 text-sm"
      defaultValue={toInputValue(today)}
      max={toInputValue(today)}
      onChange={handleDateChange}
      placeholder="Select a date"
      title="Select a date"
    />
  );
}