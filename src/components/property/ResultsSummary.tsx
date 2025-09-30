"use client";

import React from "react";

export interface ResultsSummaryProps {
  total: number;
  page: number;
  pageSize: number;
}

export default function ResultsSummary(props: ResultsSummaryProps): React.ReactElement {
  const { total, page, pageSize } = props;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  return (
    <div className="text-sm text-gray-600" aria-live="polite">
      Показани {start}–{end} от {total} имота
    </div>
  );
}



