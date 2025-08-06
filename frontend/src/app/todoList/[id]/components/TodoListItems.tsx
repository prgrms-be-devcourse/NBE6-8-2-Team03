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

interface TodoListItemsProps {
  todos: Todo[];
  selectedTodo: Todo | null;
  onTodoClick: (todo: Todo) => void;
  onCheckboxChange: (todoId: number) => void;
  onCreateTodo: () => void;
}

const TodoListItems: React.FC<TodoListItemsProps> = ({
  todos,
  selectedTodo,
  onTodoClick,
  onCheckboxChange,
  onCreateTodo
}) => {
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3:
        return { label: '높음', color: '#dc2626', bg: '#fef2f2' };
      case 2:
        return { label: '중간', color: '#eab308', bg: '#fefce8' };
      case 1:
        return { label: '낮음', color: '#2563eb', bg: '#eff6ff' };
      default:
        return { label: '일반', color: '#6b7280', bg: '#f8fafc' };
    }
  };

  return (
    <div style={{
      background: 'var(--bg-white)',
      borderRadius: '12px',
      padding: '2.5rem',
      boxShadow: '0 4px 12px var(--shadow-md)',
      border: '1px solid var(--border-light)',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        📝 할 일 목록
      </h2>
      
      {!todos || todos.length === 0 ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: '1.5rem',
          color: 'var(--text-light)',
          border: '2px dashed var(--border-medium)',
          borderRadius: '8px',
          padding: '3rem'
        }}>
          <div style={{ fontSize: '4rem' }}>📝</div>
          <p style={{ fontSize: '1.3rem' }}>등록된 할 일이 없습니다.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.5rem',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '0.75rem'
        }}>
          {todos && todos.map((todo) => (
            <div
              key={todo.id}
              style={{
                background: selectedTodo?.id === todo.id ? 'var(--primary-light)' : 'var(--bg-main)',
                borderRadius: '10px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: `5px solid ${
                  todo.priority === 3 ? '#dc2626' : 
                  todo.priority === 2 ? '#eab308' : 
                  '#2563eb'
                }`,
                border: selectedTodo?.id === todo.id 
                  ? '2px solid var(--primary-color)' 
                  : '1px solid var(--border-light)',
                minHeight: '120px'
              }}
              onClick={() => onTodoClick(todo)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(e) => {
                    e.stopPropagation();
                    onCheckboxChange(todo.id);
                  }}
                  style={{ 
                    width: '24px',
                    height: '24px',
                    marginTop: '0.125rem',
                    accentColor: 'var(--primary-color)'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '1.2rem',
                    color: todo.completed ? 'var(--text-light)' : 'var(--text-primary)',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    marginBottom: '0.75rem',
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {todo.title}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    height: '1.3em'
                  }}>
                    {todo.description || '설명이 없습니다.'}
                  </p>
                  {/* 우선순위와 날짜를 별도 컨테이너로 분리하여 항상 표시되도록 */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    minHeight: '28px',
                    marginTop: 'auto'
                  }}>
                    <span style={{
                      fontSize: '0.85rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '15px',
                      fontWeight: '600',
                      background: getPriorityLabel(todo.priority).bg,
                      color: getPriorityLabel(todo.priority).color,
                      border: `1px solid ${getPriorityLabel(todo.priority).color}20`,
                      whiteSpace: 'nowrap',
                      minWidth: '50px',
                      textAlign: 'center',
                      flexShrink: 0
                    }}>
                      {getPriorityLabel(todo.priority).label}
                    </span>
                    <span style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-light)',
                      fontWeight: '500',
                      flexShrink: 0
                    }}>
                      📅 {new Date(todo.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* TODO 추가 버튼 */}
      <div style={{ 
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-light)' 
      }}>
        <button
          onClick={onCreateTodo}
          style={{
            width: '100%',
            padding: '1.25rem',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}
        >
          ➕ 새 할 일 추가
        </button>
      </div>
    </div>
  );
};

export default TodoListItems;