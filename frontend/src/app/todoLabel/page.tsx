'use client';

import { useState } from 'react';
<<<<<<< HEAD
<<<<<<< HEAD
import Labels from './Labels';
=======
import LabelList from './LabelList';
>>>>>>> 763de44 (feat : getLabels)
=======
import Labels from './Labels';
>>>>>>> 61898e4 (fix : end point)

interface Label {
  id: number;
  name: string;
  color: string;
}

const LabelSelectorModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> c3bc2a6 (fe feat : page)
  // 예시 라벨->API 호출로 변경예정.
  const availableLabels: Label[] = [
    { id: 1, name: '긴급', color: '#ef4444' },
    { id: 2, name: '중요', color: '#f59e0b' },
    { id: 3, name: '업무', color: '#3b82f6' },
    { id: 4, name: '개인', color: '#10b981' },
    { id: 5, name: '프로젝트', color: '#8b5cf6' },
    { id: 6, name: '학습', color: '#06b6d4' },
    { id: 7, name: '쇼핑', color: '#ec4899' },
    { id: 8, name: '건강', color: '#84cc16' }
  ];
=======
  // 예시 라벨 데이터
<<<<<<< HEAD
  // const availableLabels: Label[] = [
  //   { id: 1, name: '긴급', color: '#ef4444' },
  //   { id: 2, name: '중요', color: '#f59e0b' },
  //   { id: 3, name: '업무', color: '#3b82f6' },
  //   { id: 4, name: '개인', color: '#10b981' },
  //   { id: 5, name: '프로젝트', color: '#8b5cf6' },
  //   { id: 6, name: '학습', color: '#06b6d4' },
  //   { id: 7, name: '쇼핑', color: '#ec4899' },
  //   { id: 8, name: '건강', color: '#84cc16' }
  // ];
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);

  // API 호출을 useEffect에 넣기
  useEffect(() => {
    fetch('/api/labels')
      .then(res => res.json())
      .then(data => setAvailableLabels(data))
      .catch(err => console.error('라벨 불러오기 실패:', err));
  }, []);
>>>>>>> 763de44 (feat : getLabels)
=======
  const availableLabels: Label[] = [
    { id: 1, name: '긴급', color: '#ef4444' },
    { id: 2, name: '중요', color: '#f59e0b' },
    { id: 3, name: '업무', color: '#3b82f6' },
    { id: 4, name: '개인', color: '#10b981' },
    { id: 5, name: '프로젝트', color: '#8b5cf6' },
    { id: 6, name: '학습', color: '#06b6d4' },
    { id: 7, name: '쇼핑', color: '#ec4899' },
    { id: 8, name: '건강', color: '#84cc16' }
  ];
>>>>>>> 61898e4 (fix : end point)

  const handleLabelToggle = (labelId: number) => {
    setSelectedLabels(prev => 
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleSave = () => {
    console.log('선택된 라벨 IDs:', selectedLabels);
    // 여기서 API 호출이나 부모 컴포넌트로 데이터 전달
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const selectedLabelNames = availableLabels
    .filter(label => selectedLabels.includes(label.id));

  return (
    <div className="p-8 max-w-md mx-auto">
      {/* 모달 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <span className="text-sm">🏷️</span>
        라벨 선택
      </button>

      {/* 선택된 라벨 표시 */}
      {selectedLabels.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">선택된 라벨:</p>
          <div className="flex flex-wrap gap-2">
            {availableLabels
              .filter(label => selectedLabels.includes(label.id))
              .map((label) => (
                <span
                  key={label.id}
                  className="px-2 py-1 text-white text-xs rounded-full"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* 모달 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
          onClick={handleOverlayClick}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">라벨 선택</h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* 모달 콘텐츠 */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                원하는 라벨을 선택하세요 (복수 선택 가능)
              </p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableLabels.map((label) => (
                  <label
                    key={label.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLabels.includes(label.id)}
                      onChange={() => handleLabelToggle(label.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      ></div>
                      <span className="text-sm text-gray-900">{label.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TodoLabelPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Todo 라벨 관리
        </h1>
        <LabelSelectorModal />
      </div>
    </div>
  );
}