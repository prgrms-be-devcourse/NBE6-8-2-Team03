'use client';

<<<<<<< HEAD
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
=======
import { useEffect, useState } from 'react';
>>>>>>> 084a466 (fe feat:API connetion)

interface Label {
  id: number;
  name: string;
  color: string;
}

interface LabelSelectorModalProps {
  todoId: number;
}

const LabelSelectorModal = ({ todoId }: LabelSelectorModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. 모든 라벨 목록 
        const allLabelsResponse = await fetch('http://localhost:8080/api/labels');
        if (!allLabelsResponse.ok) {
          throw new Error(`모든 라벨 목록 불러오기 실패: ${allLabelsResponse.statusText}`);
        }
        const allLabelsData = await allLabelsResponse.json();
        const fetchedAllLabels = allLabelsData.data?.labels;
        if (Array.isArray(fetchedAllLabels)) {
          setAvailableLabels(fetchedAllLabels);
        } else {
          console.warn("API 응답에 'data.labels' 배열이 없습니다 (모든 라벨):", allLabelsData);
          setAvailableLabels([]);
        }


        // 2. 현재 Todo에 연결된 라벨 목록 불러오기
        const todoLabelsResponse = await fetch(`http://localhost:8080/api/todos/${todoId}/labels`);
        if (!todoLabelsResponse.ok) {
          throw new Error(`Todo에 연결된 라벨 불러오기 실패: ${todoLabelsResponse.statusText}`);
        }
        const todoLabelsData = await todoLabelsResponse.json();

        const fetchedTodoLabelIds = todoLabelsData.data?.labelIds;
        if (Array.isArray(fetchedTodoLabelIds)) {
          setSelectedLabels(fetchedTodoLabelIds);
        } else {
          console.warn(`API 응답에 'data.labelIds' 배열이 없습니다 (todoId: ${todoId}):`, todoLabelsData);
          setSelectedLabels([]);
        }

      } catch (err) {
        console.error('라벨 데이터 불러오기 실패:', err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabels();
  }, [todoId]);

  if (isLoading) {
    return <p className="text-center py-8">라벨 목록을 불러오는 중입니다...</p>;
  }

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
>>>>>>> 084a466 (fe feat:API connetion)
=======
  if (error) {
    return <p className="text-center py-8 text-red-600">오류 발생: {error}</p>;
  }
>>>>>>> 61d01b5 (FE feat : Api connection)

  const handleLabelToggle = (labelId: number) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  //handleSave 함수 수정: PUT 요청 추가
  const handleSave = async () => {
    console.log(`Todo ${todoId}에 선택된 라벨 IDs:`, selectedLabels);

    try {
      const response = await fetch(`http://localhost:8080/api/todos/${todoId}/labels`, {
        method: 'PUT', // PUT 메서드 사용
        headers: {
          'Content-Type': 'application/json',
          // 필요하다면 'Authorization' 헤더 등 추가
        },
        // 백엔드의 TodoLabelRequestDto에 맞춰 labelIds 배열을 전송
        body: JSON.stringify({ todoId: todoId, labelIds: selectedLabels }),
      });

      if (!response.ok) {
        // HTTP 상태 코드가 2xx가 아니면 에러로 간주
        const errorData = await response.json(); // 서버에서 보낸 에러 메시지를 파싱
        throw new Error(`라벨 업데이트 실패: ${errorData.msg || response.statusText}`);
      }

      // 성공 메시지 또는 추가 UI 업데이트 로직
      const responseData = await response.json();
      console.log('라벨이 성공적으로 업데이트되었습니다:', responseData);
      alert('라벨이 성공적으로 업데이트되었습니다!');

    } catch (err) {
      console.error('라벨 업데이트 중 오류 발생:', err);
      alert(`라벨 업데이트 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setIsOpen(false); // 모달 닫기
    }
  };


  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const currentSelectedLabels = availableLabels.filter(label => selectedLabels.includes(label.id));
  const currentUnselectedLabels = availableLabels.filter(label => !selectedLabels.includes(label.id));


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

      {/* 현재 Todo에 선택된 라벨 표시 (모달 외부) */}
      {selectedLabels.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">현재 Todo에 연결된 라벨:</p>
          <div className="flex flex-wrap gap-2">
            {currentSelectedLabels.map((label) => (
                <span
                  key={`display-${label.id}`}
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
                {currentSelectedLabels.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 font-semibold mb-1">선택된 라벨</p>
                    {currentSelectedLabels.map((label) => (
                      <label
                        key={`modal-selected-${label.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={true}
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
                  </>
                )}

                {currentSelectedLabels.length > 0 && currentUnselectedLabels.length > 0 && (
                  <hr className="my-4 border-t border-gray-300" />
                )}

                {currentUnselectedLabels.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 font-semibold mb-1">모든 라벨</p>
                    {currentUnselectedLabels.map((label) => (
                      <label
                        key={`modal-unselected-${label.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={false}
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
                  </>
                )}

                {currentSelectedLabels.length === 0 && currentUnselectedLabels.length === 0 && (
                    <p className="text-center text-gray-500">불러올 라벨이 없습니다.</p>
                )}
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
  const exampleTodoId = 1;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Todo 라벨 관리
        </h1>
        <LabelSelectorModal todoId={exampleTodoId} />
      </div>
    </div>
  );
}