import React from 'react';

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

interface TodoDetailViewProps {
  todo: Todo;
  onCheckboxChange: (todoId: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}


const TodoDetailView: React.FC<TodoDetailViewProps> = ({
  todo,
  onCheckboxChange,
  onEdit,
  onDelete
}) => {
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3:
        return { label: '높음', color: '#dc2626' };
      case 2:
        return { label: '중간', color: '#eab308' };
      case 1:
        return { label: '낮음', color: '#2563eb' };
      default:
        return { label: '일반', color: '#6b7280' };
    }
  };

  const priorityInfo = getPriorityLabel(todo.priority);

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
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onCheckboxChange(todo.id)}
            style={{ 
              width: '28px', 
              height: '28px', 
              marginTop: '0.25rem',
              accentColor: 'var(--primary-color)',
              transform: 'scale(1.3)'
            }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: todo.completed ? 'var(--text-light)' : 'var(--text-primary)',
              textDecoration: todo.completed ? 'line-through' : 'none',
              lineHeight: '1.3',
              wordBreak: 'break-word'
            }}>
              {todo.title}
            </h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginLeft: '1rem' }}>
          <button
            onClick={onEdit}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ✏️ 수정
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: '0.75rem 1.25rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🗑️ 삭제
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem',
        flex: 1,
        overflowY: 'auto'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem'
          }}>
            📝 설명
          </label>
          <p style={{
            color: 'var(--text-primary)',
            lineHeight: '1.6',
            fontSize: '1rem',
            background: 'var(--bg-main)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            wordBreak: 'break-word',
            minHeight: '60px',
            margin: 0
          }}>
            {todo.description || '설명이 없습니다.'}
          </p>
        </div>

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
              🎯 우선순위
            </label>
            <span style={{
              display: 'inline-block',
              fontSize: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontWeight: '600',
              background: todo.priority === 3 ? '#fef2f2' : 
                        todo.priority === 2 ? '#fefce8' : '#eff6ff',
              color: priorityInfo.color
            }}>
              {priorityInfo.label}
            </span>
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem'
            }}>
              📊 상태
            </label>
            <span style={{
              display: 'inline-block',
              fontSize: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontWeight: '600',
              background: todo.completed ? '#f0fdf4' : '#fefce8',
              color: todo.completed ? '#16a34a' : '#eab308'
            }}>
              {todo.completed ? '✅ 완료' : '⏳ 진행중'}
            </span>
          </div>
        </div>

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
              🚀 시작일
            </label>
            <div style={{ 
              color: 'var(--text-primary)', 
              fontSize: '1rem',
              background: 'var(--bg-main)',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-light)'
            }}>
              {todo.startDate ? new Date(todo.startDate).toLocaleDateString('ko-KR') : '설정되지 않음'}
            </div>
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem'
            }}>
              📅 마감일
            </label>
            <div style={{ 
              color: 'var(--text-primary)', 
              fontSize: '1rem',
              background: 'var(--bg-main)',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-light)'
            }}>
              {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('ko-KR') : '설정되지 않음'}
            </div>
          </div>
        </div>

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
              📝 생성일
            </label>
            <div style={{ 
              color: 'var(--text-primary)', 
              fontSize: '0.9rem',
              background: 'var(--bg-main)',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-light)'
            }}>
              {todo.createdAt ? new Date(todo.createdAt).toLocaleDateString('ko-KR') : '알 수 없음'}
            </div>
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem'
            }}>
              🔄 수정일
            </label>
            <div style={{ 
              color: 'var(--text-primary)', 
              fontSize: '0.9rem',
              background: 'var(--bg-main)',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-light)'
            }}>
              {todo.updatedAt ? new Date(todo.updatedAt).toLocaleDateString('ko-KR') : '알 수 없음'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoDetailView;