import React from 'react';

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: number;
  startDate: string;
  dueDate: string | null; // null 타입 추가
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
        return { label: '높음', color: 'bg-red-100 text-red-600' };
      case 2:
        return { label: '중간', color: 'bg-yellow-100 text-yellow-600' };
      case 1:
        return { label: '낮음', color: 'bg-blue-100 text-blue-600' };
      default:
        return { label: '일반', color: 'bg-gray-100 text-gray-600' };
    }
  };

  // 날짜 표시 함수 - dueDate가 null이면 startDate 사용
  const getDisplayDate = (todo: Todo) => {
    const dateToShow = todo.dueDate || todo.startDate;
    const dateObj = new Date(dateToShow);
    const label = todo.dueDate ? '📅' : '🗓️'; // 마감일과 시작일 구분
    return `${label} ${dateObj.toLocaleDateString()}`;
  };

  return (
    <div style={{
      background: 'var(--bg-white)',
      borderRadius: '12px',
      padding: '2.5rem', // 1.5rem -> 2.5rem으로 증가
      boxShadow: '0 4px 12px var(--shadow-md)',
      border: '1px solid var(--border-light)',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }}>
      <h2 style={{
        fontSize: '1.5rem', // 1.25rem -> 1.5rem으로 증가
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '1.5rem', // 1rem -> 1.5rem으로 증가
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem' // 0.5rem -> 0.75rem으로 증가
      }}>
        📝 할 일 목록
      </h2>
      
      {todos.length === 0 ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: '1.5rem', // 1rem -> 1.5rem으로 증가
          color: 'var(--text-light)',
          border: '2px dashed var(--border-medium)',
          borderRadius: '8px',
          padding: '3rem' // 패딩 추가
        }}>
          <div style={{ fontSize: '4rem' }}>📝</div> {/* 3rem -> 4rem으로 증가 */}
          <p style={{ fontSize: '1.3rem' }}>등록된 할 일이 없습니다.</p> {/* 1.1rem -> 1.3rem으로 증가 */}
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem', // 0.75rem -> 1rem으로 증가
          flex: 1,
          overflowY: 'auto',
          paddingRight: '0.75rem' // 0.5rem -> 0.75rem으로 증가
        }}>
          {todos.map((todo) => (
            <div
              key={todo.id}
              style={{
                background: selectedTodo?.id === todo.id ? 'var(--primary-light)' : 'var(--bg-main)',
                borderRadius: '10px', // 8px -> 10px로 증가
                padding: '1.5rem', // 1rem -> 1.5rem으로 증가
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: `5px solid ${
                  todo.priority === 3 ? '#dc2626' : 
                  todo.priority === 2 ? '#eab308' : 
                  '#2563eb'
                }`, // 4px -> 5px로 증가
                border: selectedTodo?.id === todo.id 
                  ? '2px solid var(--primary-color)' 
                  : '1px solid var(--border-light)',
                minHeight: '140px' // 120px -> 140px로 증가
              }}
              onClick={() => onTodoClick(todo)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}> {/* 0.75rem -> 1rem으로 증가 */}
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(e) => {
                    e.stopPropagation();
                    onCheckboxChange(todo.id);
                  }}
                  style={{ 
                    width: '24px', // 20px -> 24px로 증가
                    height: '24px', // 20px -> 24px로 증가
                    marginTop: '0.125rem',
                    accentColor: 'var(--primary-color)'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '1.2rem', // 1rem -> 1.2rem으로 증가
                    color: todo.completed ? 'var(--text-light)' : 'var(--text-primary)',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    marginBottom: '0.75rem', // 0.5rem -> 0.75rem으로 증가
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {todo.title}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1rem', // 0.875rem -> 1rem으로 증가
                    marginBottom: '1rem', // 0.75rem -> 1rem으로 증가
                    lineHeight: '1.5', // 1.4 -> 1.5로 증가
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    height: '3em' // 2.4em -> 3em으로 증가
                  }}>
                    {todo.description}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '0.75rem' // 0.5rem -> 0.75rem으로 증가
                  }}>
                    <span style={{
                      fontSize: '0.85rem', // 0.75rem -> 0.85rem으로 증가
                      padding: '0.375rem 0.75rem', // 0.25rem 0.5rem -> 0.375rem 0.75rem으로 증가
                      borderRadius: '15px', // 12px -> 15px로 증가
                      fontWeight: '600',
                      background: todo.priority === 3 ? '#fef2f2' : 
                                todo.priority === 2 ? '#fefce8' : '#eff6ff',
                      color: todo.priority === 3 ? '#dc2626' : 
                             todo.priority === 2 ? '#eab308' : '#2563eb'
                    }}>
                      {getPriorityLabel(todo.priority).label}
                    </span>
                    <span style={{
                      fontSize: '0.85rem', // 0.75rem -> 0.85rem으로 증가
                      color: 'var(--text-light)',
                      fontWeight: '500'
                    }}>
                      {getDisplayDate(todo)}
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
        marginTop: '1.5rem', // 1rem -> 1.5rem으로 증가
        paddingTop: '1.5rem', // 1rem -> 1.5rem으로 증가
        borderTop: '1px solid var(--border-light)' 
      }}>
        <button
          onClick={onCreateTodo}
          style={{
            width: '100%',
            padding: '1.25rem', // 1rem -> 1.25rem으로 증가
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '10px', // 8px -> 10px로 증가
            fontSize: '1.1rem', // 1rem -> 1.1rem으로 증가
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem' // 0.5rem -> 0.75rem으로 증가
          }}
        >
          ➕ 새 할 일 추가
        </button>
      </div>
    </div>
  );
};

export default TodoListItems;