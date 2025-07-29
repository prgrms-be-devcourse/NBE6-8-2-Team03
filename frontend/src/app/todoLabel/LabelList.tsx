'use client';

import { useEffect, useState } from 'react';

type Label = {
  id: number;
  name: string;
};

export default function LabelList() {
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    fetch('/api/labels')
      .then((res) => res.json())
      .then((data) => setLabels(data))
      .catch((err) => console.error('라벨 불러오기 실패:', err));
  }, []);

  return (
    <ul>
      {labels.map((label) => (
        <li key={label.id}>{label.name}</li>
      ))}
    </ul>
  );
}
