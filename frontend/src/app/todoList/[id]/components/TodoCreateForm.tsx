import React from 'react';

interface NewTodo {
  title: string;
  description: string;
  priority: number;
  startDate: string;
  dueDate: string;
}

interface TodoCreateFormProps {
  newTodo: NewTodo;
  formErrors: {[key: string]: string};
  onFormChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const TodoCreateForm: React.FC<TodoCreateFormProps> = ({
  newTodo,
  formErrors,
  onFormChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div style={{
      background: 'var(--bg-white)',
      borderRadius: '12px',
      padding: '3rem', // 2rem -> 3rem으로 증가
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
        marginBottom: '2.5rem', // 2rem -> 2.5rem으로 증가
        paddingBottom: '1.5rem', // 1rem -> 1.5rem으로 증가
        borderBottom: '2px solid var(--border-light)'
      }}>
        <h2 style={{
          fontSize: '1.75rem', // 1.5rem -> 1.75rem으로 증가
          fontWeight: '700',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem' // 0.5rem -> 0.75rem으로 증가
        }}>
          ➕ 새 할 일 추가
        </h2>
        <button
          onClick={onCancel}
          style={{
            padding: '0.75rem', // 0.5rem -> 0.75rem으로 증가
            background: 'transparent',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px', // 6px -> 8px로 증가
            cursor: 'pointer',
            fontSize: '1.4rem' // 1.2rem -> 1.4rem으로 증가
          }}
        >
          ✕
        </button>
      </div>

      {/* 폼 내용 */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem', // 1.5rem -> 2rem으로 증가
        flex: 1,
        overflowY: 'auto'
      }}>
        {/* 제목 */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem' // 0.5rem -> 0.75rem으로 증가
          }}>
            📝 제목 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            value={newTodo.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            placeholder="할 일의 제목을 입력하세요"
            style={{
              width: '100%',
              padding: '1rem', // 0.75rem -> 1rem으로 증가
              border: formErrors.title ? '2px solid #dc2626' : '1px solid var(--border-light)',
              borderRadius: '10px', // 8px -> 10px로 증가
              fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
              boxSizing: 'border-box'
            }}
          />
          {formErrors.title && (
            <p style={{ color: '#dc2626', fontSize: '1rem', marginTop: '0.5rem' }}> {/* 0.875rem -> 1rem, 0.25rem -> 0.5rem */}
              {formErrors.title}
            </p>
          )}
        </div>

        {/* 설명 */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem' // 0.5rem -> 0.75rem으로 증가
          }}>
            📄 설명
          </label>
          <textarea
            value={newTodo.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            placeholder="할 일에 대한 자세한 설명을 입력하세요 (선택사항)"
            rows={5} // 4 -> 5로 증가
            style={{
              width: '100%',
              padding: '1rem', // 0.75rem -> 1rem으로 증가
              border: '1px solid var(--border-light)',
              borderRadius: '10px', // 8px -> 10px로 증가
              fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
              boxSizing: 'border-box',
              resize: 'vertical',
              minHeight: '120px' // 100px -> 120px로 증가
            }}
          />
        </div>

        {/* 우선순위 */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem' // 0.5rem -> 0.75rem으로 증가
          }}>
            🎯 우선순위
          </label>
          <select
            value={newTodo.priority}
            onChange={(e) => onFormChange('priority', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '1rem', // 0.75rem -> 1rem으로 증가
              border: '1px solid var(--border-light)',
              borderRadius: '10px', // 8px -> 10px로 증가
              fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
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
          gap: '2rem' // 1.5rem -> 2rem으로 증가
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem' // 0.5rem -> 0.75rem으로 증가
            }}>
              🚀 시작일 <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={newTodo.startDate}
              onChange={(e) => onFormChange('startDate', e.target.value)}
              style={{
                width: '100%',
                padding: '1rem', // 0.75rem -> 1rem으로 증가
                border: formErrors.startDate ? '2px solid #dc2626' : '1px solid var(--border-light)',
                borderRadius: '10px', // 8px -> 10px로 증가
                fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
                boxSizing: 'border-box'
              }}
            />
            {formErrors.startDate && (
              <p style={{ color: '#dc2626', fontSize: '1rem', marginTop: '0.5rem' }}> {/* 0.875rem -> 1rem, 0.25rem -> 0.5rem */}
                {formErrors.startDate}
              </p>
            )}
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem' // 0.5rem -> 0.75rem으로 증가
            }}>
              📅 마감일 <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={newTodo.dueDate}
              onChange={(e) => onFormChange('dueDate', e.target.value)}
              style={{
                width: '100%',
                padding: '1rem', // 0.75rem -> 1rem으로 증가
                border: formErrors.dueDate ? '2px solid #dc2626' : '1px solid var(--border-light)',
                borderRadius: '10px', // 8px -> 10px로 증가
                fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
                boxSizing: 'border-box'
              }}
            />
            {formErrors.dueDate && (
              <p style={{ color: '#dc2626', fontSize: '1rem', marginTop: '0.5rem' }}> {/* 0.875rem -> 1rem, 0.25rem -> 0.5rem */}
                {formErrors.dueDate}
              </p>
            )}
          </div>
        </div>

        {/* 제출 버튼들 */}
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', // 1rem -> 1.5rem으로 증가
          marginTop: '1.5rem', // 1rem -> 1.5rem으로 증가
          paddingTop: '1.5rem', // 1rem -> 1.5rem으로 증가
          borderTop: '1px solid var(--border-light)'
        }}>
          <button
            onClick={onSubmit}
            style={{
              flex: 1,
              padding: '1.25rem', // 1rem -> 1.25rem으로 증가
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '10px', // 8px -> 10px로 증가
              fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ✅ 할 일 추가
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '1.25rem', // 1rem -> 1.25rem으로 증가
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '10px', // 8px -> 10px로 증가
              fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
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

export default TodoCreateForm;