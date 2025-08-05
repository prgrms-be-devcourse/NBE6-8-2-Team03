import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: number;
  startDate: string;
  dueDate: string;
  todoList: number;
  createdAt: string;
  updatedAt: string;
}

interface EditTodo {
  title: string;
  description: string;
  priority: number;
  startDate: string;
  dueDate: string;
}

interface TodoEditFormProps {
  todo: Todo;
  editTodo: EditTodo;
  formErrors: {[key: string]: string};
  onFormChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const TodoEditForm: React.FC<TodoEditFormProps> = ({
  todo,
  editTodo,
  formErrors,
  onFormChange,
  onSubmit,
  onCancel
}) => {
  // 날짜 포맷 함수 (datetime-local 형식)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // YYYY-MM-DDTHH:mm 형식으로 변환
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const handleChange = (field: string, value: string | number) => {
    onFormChange(field, value);
  };

  return (
    <div style={{
      background: 'var(--bg-white)',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 12px var(--shadow-md)',
      border: '1px solid var(--border-light)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 폼 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--border-light)'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ✏️ 할 일 수정
        </h2>
        <button
          onClick={onCancel}
          style={{
            padding: '0.5rem',
            background: 'transparent',
            border: '1px solid var(--border-medium)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1.2rem'
          }}
        >
          ✕
        </button>
      </div>

      {/* 폼 내용 */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem',
        flex: 1,
        overflowY: 'auto'
      }}>
        {/* ID 표시 (읽기 전용) */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem'
          }}>
            🔢 할 일 ID
          </label>
          <div style={{
            padding: '0.75rem',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            fontSize: '1rem',
            color: 'var(--text-secondary)'
          }}>
            #{todo.id}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem'
          }}>
            📝 제목 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            value={editTodo.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="할 일의 제목을 입력하세요"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: formErrors.title ? '2px solid #dc2626' : '1px solid var(--border-light)',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
          {formErrors.title && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {formErrors.title}
            </p>
          )}
        </div>

        {/* 설명 */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem'
          }}>
            📄 설명
          </label>
          <textarea
            value={editTodo.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="할 일에 대한 자세한 설명을 입력하세요 (선택사항)"
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              resize: 'vertical',
              minHeight: '100px'
            }}
          />
        </div>

        {/* 우선순위 */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem'
          }}>
            🎯 우선순위
          </label>
          <select
            value={editTodo.priority}
            onChange={(e) => handleChange('priority', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              background: 'white'
            }}
          >
            <option value={3}>높음</option>
            <option value={2}>중간</option>
            <option value={1}>낮음</option>
          </select>
        </div>

        {/* 시작일 & 마감일 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1.5rem' 
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem'
            }}>
              🚀 시작일 <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={formatDateForInput(editTodo.startDate)}
              onChange={(e) => handleChange('startDate', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: formErrors.startDate ? '2px solid #dc2626' : '1px solid var(--border-light)',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            {formErrors.startDate && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {formErrors.startDate}
              </p>
            )}
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem'
            }}>
              📅 마감일 <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={formatDateForInput(editTodo.dueDate)}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: formErrors.dueDate ? '2px solid #dc2626' : '1px solid var(--border-light)',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            {formErrors.dueDate && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {formErrors.dueDate}
              </p>
            )}
          </div>
        </div>

        {/* 완료 상태 */}
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={todo.completed}
              readOnly
              style={{ 
                width: '20px', 
                height: '20px',
                accentColor: 'var(--primary-color)'
              }}
            />
            📊 완료 상태: {todo.completed ? '✅ 완료됨' : '⏳ 진행중'}
          </label>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-light)',
            marginTop: '0.5rem',
            marginLeft: '2rem'
          }}>
            완료 상태는 할 일 목록에서 체크박스로 변경할 수 있습니다.
          </p>
        </div>

        {/* 생성일/수정일 정보 */}
        <div style={{ 
          background: 'var(--bg-main)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <div>
              <strong>📝 생성일:</strong><br />
              {todo.createdAt ? new Date(todo.createdAt).toLocaleString('ko-KR') : '알 수 없음'}
            </div>
            <div>
              <strong>🔄 최종 수정일:</strong><br />
              {todo.updatedAt ? new Date(todo.updatedAt).toLocaleString('ko-KR') : '알 수 없음'}
            </div>
          </div>
        </div>

        {/* 제출 버튼들 */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-light)'
        }}>
          <button
            onClick={onSubmit}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ✅ 수정 완료
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '1rem',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ❌ 취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoEditForm;