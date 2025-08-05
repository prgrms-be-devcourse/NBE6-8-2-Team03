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
        return { label: '높음', color: 'bg-red-100 text-red-600' };
      case 2:
        return { label: '중간', color: 'bg-yellow-100 text-yellow-600' };
      case 1:
        return { label: '낮음', color: 'bg-blue-100 text-blue-600' };
      default:
        return { label: '일반', color: 'bg-gray-100 text-gray-600' };
    }
  };

  return (
    <div style={{
      background: 'var(--bg-white)',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 12px var(--shadow-md)',
      border: '1px solid var(--border-light)',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
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
          gap: '1rem',
          color: 'var(--text-light)',
          border: '2px dashed var(--border-medium)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '3rem' }}>📝</div>
          <p style={{ fontSize: '1.1rem' }}>등록된 할 일이 없습니다.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '0.5rem'
        }}>
          {todos.map((todo) => (
            <div
              key={todo.id}
              style={{
                background: selectedTodo?.id === todo.id ? 'var(--primary-light)' : 'var(--bg-main)',
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: `4px solid ${
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(e) => {
                    e.stopPropagation();
                    onCheckboxChange(todo.id);
                  }}
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    marginTop: '0.125rem',
                    accentColor: 'var(--primary-color)'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '1rem',
                    color: todo.completed ? 'var(--text-light)' : 'var(--text-primary)',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    marginBottom: '0.5rem',
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {todo.title}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    marginBottom: '0.75rem',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    height: '2.4em'
                  }}>
                    {todo.description}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontWeight: '600',
                      background: todo.priority === 3 ? '#fef2f2' : 
                                todo.priority === 2 ? '#fefce8' : '#eff6ff',
                      color: todo.priority === 3 ? '#dc2626' : 
                             todo.priority === 2 ? '#eab308' : '#2563eb'
                    }}>
                      {getPriorityLabel(todo.priority).label}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-light)',
                      fontWeight: '500'
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
      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
        <button
          onClick={onCreateTodo}
          style={{
            width: '100%',
            padding: '1rem',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          ➕ 새 할 일 추가
        </button>
      </div>
    </div>
  );
};

export default TodoListItems;