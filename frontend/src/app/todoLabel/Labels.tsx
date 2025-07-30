'use client';

import React, { useEffect, useState } from 'react';

interface Label {
  id: number;
  name: string;
  color: string;
  createDate: string | null;
  modifyDate: string | null;
}

export default function Labels() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/labels')
      .then((res) => {
        if (!res.ok) {
          throw new Error('라벨 불러오기 실패');
        }
        return res.json();
      })
      .then((data) => {
        setLabels(data.data.labels);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      {labels.map((label) => (
        <div
          key={label.id}
          className="flex items-center p-2 rounded shadow"
          style={{ backgroundColor: getColor(label.color) }}
        >
          <span className="text-white font-semibold">{label.name}</span>
        </div>
      ))}
    </div>
  );
}

// 백엔드에서 색상을 "빨강", "파랑" 등 한글로 줄 경우 변환 함수 필요
function getColor(colorName: string): string {
  const colorMap: { [key: string]: string } = {
    빨강: '#ef4444',
    파랑: '#3b82f6',
    초록: '#10b981',
    노랑: '#facc15',
    보라: '#8b5cf6',
    회색: '#6b7280',
  };
  return colorMap[colorName] || '#9ca3af'; // 기본 회색
}