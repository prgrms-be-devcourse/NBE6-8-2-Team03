'use client'; // 클라이언트 컴포넌트임을 명시

import { useEffect, useState } from 'react'; // React 훅 임포트

// --- 인터페이스 정의 ---
// 라벨(Label) 객체의 타입을 정의합니다.
interface Label {
  id: number; // 라벨 고유 ID
  name: string; // 라벨 이름
  color: string; // 라벨 색상 (예: #RRGGBB 형식)
}

// LabelSelectorModal 컴포넌트가 받을 props의 타입을 정의합니다.
interface LabelSelectorModalProps {
  todoId: number; // 현재 라벨을 선택할 Todo의 ID
}

// LabelSelectorModal 컴포넌트
// 특정 Todo의 라벨을 선택하고 관리하는 모달 컴포넌트입니다.
const LabelSelectorModal = ({ todoId }: LabelSelectorModalProps) => {
  // 모달의 열림/닫힘 상태를 관리합니다.
  const [isOpen, setIsOpen] = useState(false);
  // 현재 Todo에 선택된 라벨들의 ID 목록을 관리합니다.
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  // 서버로부터 불러온 모든 사용 가능한 라벨 목록을 관리합니다.
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  // 데이터 로딩 상태를 관리합니다. (데이터를 불러오는 중인지 여부)
  const [isLoading, setIsLoading] = useState(true);
  // API 호출 중 발생한 오류 메시지를 관리합니다.
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트가 마운트되거나 `todoId`가 변경될 때 라벨 데이터를 불러옵니다.
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setIsLoading(true); // 로딩 상태 시작
        setError(null); // 이전 오류 메시지 초기화

        // 1. 모든 라벨 목록 불러오기 API 호출
        const allLabelsResponse = await fetch('http://localhost:8080/api/labels');
        // 응답이 성공적이지 않으면 오류 발생
        if (!allLabelsResponse.ok) {
          throw new Error(`모든 라벨 목록 불러오기 실패: ${allLabelsResponse.statusText}`);
        }
        const allLabelsData = await allLabelsResponse.json();
        // API 응답에서 'data.labels' 배열을 추출합니다.
        const fetchedAllLabels = allLabelsData.data?.labels;
        // 배열인지 확인 후 `availableLabels` 상태 업데이트
        if (Array.isArray(fetchedAllLabels)) {
          setAvailableLabels(fetchedAllLabels);
        } else {
          console.warn("API 응답에 'data.labels' 배열이 없습니다 (모든 라벨):", allLabelsData);
          setAvailableLabels([]); // 유효하지 않은 응답 시 빈 배열로 초기화
        }

        // 2. 현재 Todo에 연결된 라벨 목록 불러오기 API 호출
        const todoLabelsResponse = await fetch(`http://localhost:8080/api/todos/${todoId}/labels`);
        // 응답이 성공적이지 않으면 오류 발생
        if (!todoLabelsResponse.ok) {
          throw new Error(`Todo에 연결된 라벨 불러오기 실패: ${todoLabelsResponse.statusText}`);
        }
        const todoLabelsData = await todoLabelsResponse.json();
        // API 응답에서 'data.labelIds' 배열을 추출합니다.
        const fetchedTodoLabelIds = todoLabelsData.data?.labelIds;
        // 배열인지 확인 후 `selectedLabels` 상태 업데이트
        if (Array.isArray(fetchedTodoLabelIds)) {
          setSelectedLabels(fetchedTodoLabelIds);
        } else {
          console.warn(`API 응답에 'data.labelIds' 배열이 없습니다 (todoId: ${todoId}):`, todoLabelsData);
          setSelectedLabels([]); // 유효하지 않은 응답 시 빈 배열로 초기화
        }
      } catch (err) {
        console.error('라벨 데이터 불러오기 실패:', err);
        setError((err as Error).message); // 오류 메시지 상태에 저장
      } finally {
        setIsLoading(false); // 로딩 상태 종료
      }
    };

    fetchLabels(); // 라벨 데이터 불러오기 함수 호출
  }, [todoId]); // `todoId`가 변경될 때마다 이 이펙트가 다시 실행됩니다.

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return <p className="text-center py-8">라벨 목록을 불러오는 중입니다...</p>;
  }

  // 오류 발생 시 표시할 UI
  if (error) {
    return <p className="text-center py-8 text-red-600">오류 발생: {error}</p>;
  }

  // 라벨 선택/해제 토글 핸들러
  const handleLabelToggle = (labelId: number) => {
    setSelectedLabels(prev =>
      prev.includes(labelId) // 이미 선택된 라벨이면
        ? prev.filter(id => id !== labelId) // 목록에서 제거
        : [...prev, labelId] // 아니면 목록에 추가
    );
  };

  // handleSave 함수: 선택된 라벨들을 서버에 업데이트하는 PUT 요청
  const handleSave = async () => {
    console.log(`Todo ${todoId}에 선택된 라벨 IDs:`, selectedLabels); // 콘솔에 선택된 라벨 ID 출력

    try {
      const response = await fetch(`http://localhost:8080/api/todos/${todoId}/labels`, {
        method: 'PUT', // PUT HTTP 메서드 사용
        headers: {
          'Content-Type': 'application/json', // JSON 형식으로 데이터 전송을 알림
          // 필요하다면 'Authorization' 헤더 등 인증 토큰을 추가할 수 있습니다.
        },
        // 요청 본문 (body)에 Todo ID와 선택된 라벨 ID 배열을 JSON 문자열로 전송
        // 백엔드의 TodoLabelRequestDto 모델에 맞춰야 합니다.
        body: JSON.stringify({ todoId: todoId, labelIds: selectedLabels }),
      });

      // HTTP 상태 코드가 2xx 범위가 아니면 (예: 4xx, 5xx) 오류로 간주
      if (!response.ok) {
        const errorData = await response.json(); // 서버에서 보낸 에러 메시지 파싱
        // 서버 메시지가 있다면 사용하고, 없다면 HTTP 상태 텍스트 사용
        throw new Error(`라벨 업데이트 실패: ${errorData.msg || response.statusText}`);
      }

      // 성공적인 응답 처리
      const responseData = await response.json();
      console.log('라벨이 성공적으로 업데이트되었습니다:', responseData);
      alert('라벨이 성공적으로 업데이트되었습니다!'); // 사용자에게 성공 알림
    } catch (err) {
      // 오류 발생 시 콘솔에 에러 출력 및 사용자에게 알림
      console.error('라벨 업데이트 중 오류 발생:', err);
      alert(`라벨 업데이트 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setIsOpen(false); // 작업 완료 후 모달 닫기 (성공/실패 무관)
    }
  };

  // '취소' 버튼 클릭 핸들러
  const handleCancel = () => {
    setIsOpen(false); // 모달 닫기
  };

  // 모달 오버레이 배경 클릭 핸들러
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 클릭된 요소가 오버레이 자체인지 확인 (모달 내용 클릭 시 닫히지 않게)
    if (e.target === e.currentTarget) {
      setIsOpen(false); // 모달 닫기
    }
  };

  // UI 렌더링을 위해 선택된 라벨과 선택되지 않은 라벨을 분리
  const currentSelectedLabels = availableLabels.filter(label => selectedLabels.includes(label.id));
  const currentUnselectedLabels = availableLabels.filter(label => !selectedLabels.includes(label.id));

  // --- 컴포넌트 렌더링 ---
  return (
    <div className="p-8 max-w-md mx-auto">
      {/* 모달을 여는 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(true)} // 클릭 시 `isOpen` 상태를 true로 변경하여 모달 열기
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <span className="text-sm">🏷️</span> {/* 라벨 아이콘 */}
        라벨 선택
      </button>

      {/* 현재 Todo에 선택된 라벨들을 모달 외부에서 표시 (selectedLabels가 있을 때만) */}
      {selectedLabels.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">현재 Todo에 연결된 라벨:</p>
          <div className="flex flex-wrap gap-2">
            {currentSelectedLabels.map((label) => (
              <span
                key={`display-${label.id}`} // 고유 키
                className="px-2 py-1 text-white text-xs rounded-full"
                style={{ backgroundColor: label.color }} // 라벨 색상 적용
              >
                {label.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 모달 오버레이 (isOpen 상태가 true일 때만 렌더링) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
          onClick={handleOverlayClick} // 오버레이 클릭 시 모달 닫기
        >
          {/* 모달 내용 컨테이너 */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">라벨 선택</h2>
              {/* 닫기 버튼 */}
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* 모달 콘텐츠 영역 */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                원하는 라벨을 선택하세요 (복수 선택 가능)
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {/* 선택된 라벨이 있을 경우 표시 */}
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
                          checked={true} // 선택된 상태이므로 항상 true
                          onChange={() => handleLabelToggle(label.id)} // 체크박스 변경 시 토글
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: label.color }} // 라벨 색상 표시
                          ></div>
                          <span className="text-sm text-gray-900">{label.name}</span>
                        </div>
                      </label>
                    ))}
                  </>
                )}

                {/* 선택된 라벨과 선택되지 않은 라벨 사이에 구분선 추가 */}
                {currentSelectedLabels.length > 0 && currentUnselectedLabels.length > 0 && (
                  <hr className="my-4 border-t border-gray-300" />
                )}

                {/* 선택되지 않은 라벨 (모든 라벨 중 현재 선택되지 않은 것)이 있을 경우 표시 */}
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
                          checked={false} // 선택되지 않은 상태이므로 항상 false
                          onChange={() => handleLabelToggle(label.id)} // 체크박스 변경 시 토글
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: label.color }} // 라벨 색상 표시
                          ></div>
                          <span className="text-sm text-gray-900">{label.name}</span>
                        </div>
                      </label>
                    ))}
                  </>
                )}

                {/* 불러올 라벨이 전혀 없을 경우 메시지 */}
                {currentSelectedLabels.length === 0 && currentUnselectedLabels.length === 0 && (
                    <p className="text-center text-gray-500">불러올 라벨이 없습니다.</p>
                )}
              </div>
            </div>

            {/* 모달 푸터 (액션 버튼) */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
              {/* 취소 버튼 */}
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              {/* 적용 (저장) 버튼 */}
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

// --- TodoLabelPage 컴포넌트 ---
// 이 컴포넌트는 LabelSelectorModal을 사용하는 예시 페이지입니다.
// 현재 `todoId`를 `1`로 고정하여 사용하고 있습니다.
export default function TodoLabelPage() {
  // 예시 Todo ID를 1로 하드코딩했습니다.
  // 실제 애플리케이션에서는 이 ID가 동적으로 결정되어야 합니다 (예: URL 파라미터, 부모 컴포넌트에서 전달 등).
  const exampleTodoId = 1;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Todo 라벨 관리
        </h1>
        {/* LabelSelectorModal 컴포넌트를 렌더링하고 `exampleTodoId`를 `todoId` prop으로 전달합니다. */}
        <LabelSelectorModal todoId={exampleTodoId} />
      </div>
    </div>
  );
}