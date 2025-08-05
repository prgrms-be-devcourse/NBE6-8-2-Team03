'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TodoListTemplate from '../../_components/TodoList/TodoListTemplate';
import TodoListInfoComponent from './components/TodoListInfo';
import TodoListItems from './components/TodoListItems';
import TodoCreateForm from './components/TodoCreateForm';
import TodoDetailView from './components/TodoDetailView';
import TodoEmptyState from './components/TodoEmptyState';

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: number;
  startDate: string;
  dueDate: string | null; // null 타입 명시적 추가
  todoList: number;
  createdAt: string;
  updatedAt: string;
}

interface TodoListInfo {
  id: number;
  name: string;
  description: string;
  userId: number;
  teamId: number;
  createDate: string;
  modifyDate: string;
}

// API 응답 타입 (캘린더 페이지와 동일)
interface ApiResponse<T> {
  resultCode: string;
  msg: string;
  data: T;
}

interface TodoListResponseDto {
  id: number;
  name: string;
  description: string;
  userId: number;
  teamId: number;
  createDate: string;
  modifyDate: string;
}

export default function TodoListPage() {
  const params = useParams();
  const todoListId = params.id as string;
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoListInfo, setTodoListInfo] = useState<TodoListInfo | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  
  // 새 TODO 폼 상태
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 2,
    startDate: '',
    dueDate: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // TodoList 정보 가져오기 (캘린더 페이지 방식 적용)
  const fetchTodoListInfo = async () => {
    if (!todoListId) return;
    
    try {
      console.log('=== TodoList 정보 조회 API 시작 ===');
      console.log('TodoList ID:', todoListId);

      const response = await fetch(`http://localhost:8080/api/todo-lists/${todoListId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('TodoList API 응답 상태:', response.status);

      if (!response.ok) {
        console.warn(`TodoList info API failed with status: ${response.status}`);
        // TodoList 정보를 가져오지 못해도 계속 진행 (기본값 사용)
        return;
      }

      const result: ApiResponse<TodoListResponseDto> = await response.json();
      console.log('✅ TodoList API 성공:', result);
      
      // 캘린더 페이지와 동일한 방식으로 응답 처리
      if (result.data) {
        const todoListData: TodoListInfo = {
          id: result.data.id || parseInt(todoListId),
          name: result.data.name || `TodoList ${todoListId}`,
          description: result.data.description || `TodoList ${todoListId}의 할일 목록`,
          userId: result.data.userId || 0,
          teamId: result.data.teamId || 0,
          createDate: result.data.createDate || new Date().toISOString(),
          modifyDate: result.data.modifyDate || new Date().toISOString()
        };
        
        console.log('변환된 TodoList 정보:', todoListData);
        setTodoListInfo(todoListData);
      } else {
        console.warn('TodoList API 응답에 data가 없음');
      }
    } catch (err) {
      console.warn('Failed to fetch todolist info:', err);
      // TodoList 정보 실패는 조용히 처리 (기본값 사용)
    }
  };

  // Todo 목록 가져오기
  const fetchTodos = async () => {
    if (!todoListId) return;
    
    try {
      console.log('=== Todo 목록 조회 API 시작 ===');
      
      const response = await fetch(`http://localhost:8080/api/todo/list/${todoListId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Todo API 응답 상태:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Todo API 성공:', result);
      
      if (result.resultCode === '200-OK' || result.resultCode === 'SUCCESS' || response.ok) {
        // dueDate null 처리를 위한 데이터 변환
        const processedTodos = (result.data || []).map((todo: any) => ({
          ...todo,
          dueDate: todo.dueDate || null // 빈 문자열이나 undefined를 null로 변환
        }));
        
        setTodos(processedTodos);
        console.log('변환된 Todos:', processedTodos);
        
        // TodoList 정보가 없는 경우에만 첫 번째 todo에서 생성
        if (!todoListInfo && processedTodos.length > 0) {
          const firstTodo = processedTodos[0];
          setTodoListInfo({
            id: firstTodo.todoList,
            name: `TodoList ${firstTodo.todoList}`,  // 기본값
            description: `TodoList ID ${firstTodo.todoList}의 할일 목록`,  // 기본값
            userId: 0,
            teamId: 0,
            createDate: firstTodo.createdAt,
            modifyDate: firstTodo.updatedAt
          });
        }
      } else {
        throw new Error(result.msg || 'Failed to fetch todo list');
      }
    } catch (err) {
      console.error('Failed to fetch todos:', err);
      throw err;
    }
  };

  // TodoList 정보와 Todos 데이터 가져오기
  const fetchTodoListData = async () => {
    if (!todoListId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('=== 데이터 로드 시작 ===');
      // TodoList 정보와 Todo 목록을 병렬로 가져오기 (캘린더 페이지 방식)
      await Promise.all([
        fetchTodoListInfo(), // 실패해도 계속 진행
        fetchTodos()          // 이것만 필수
      ]);
      console.log('=== 데이터 로드 완료 ===');
    } catch (err) {
      console.error('Failed to fetch todo list data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodoListData();
  }, [todoListId]);

  // 새로고침용 함수 (로딩 상태 없이)
  const refreshTodoList = async () => {
    if (!todoListId) return;
    
    try {
      await Promise.all([
        fetchTodoListInfo(),
        fetchTodos()
      ]);
    } catch (err) {
      console.error('Failed to refresh todo list:', err);
      // 새로고침 실패는 조용히 처리 (기존 데이터 유지)
    }
  };

  // 이벤트 핸들러들
  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowCreateForm(false);
  };

  const handleCheckboxChange = async (todoId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/todo/${todoId}/complete`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.resultCode === 'S-1' || result.resultCode === 'SUCCESS' || response.ok) {
        const updatedTodo = result.data;
        
        setTodos(prevTodos => 
          prevTodos.map(todo => 
            todo.id === todoId 
              ? { 
                  ...todo, 
                  completed: updatedTodo?.completed !== undefined ? updatedTodo.completed : !todo.completed,
                  updatedAt: updatedTodo?.updatedAt || new Date().toISOString()
                }
              : todo
          )
        );
        
        if (selectedTodo?.id === todoId) {
          setSelectedTodo(prev => prev ? { 
            ...prev, 
            completed: updatedTodo?.completed !== undefined ? updatedTodo.completed : !prev.completed,
            updatedAt: updatedTodo?.updatedAt || new Date().toISOString()
          } : null);
        }
        
        console.log(`✅ 할 일 ${todoId} 상태가 변경되었습니다.`);
      } else {
        throw new Error(result.msg || result.message || 'Failed to toggle todo status');
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      
      let errorMessage = '할 일 상태 변경에 실패했습니다.';
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = '해당 할 일을 찾을 수 없습니다.';
        } else if (error.message.includes('403')) {
          errorMessage = '할 일을 수정할 권한이 없습니다.';
        } else if (error.message.includes('500')) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleEdit = () => {
    if (selectedTodo) {
      console.log(`Edit todo ${selectedTodo.id}`);
    }
  };

  const handleDelete = async () => {
    if (selectedTodo) {
      if (!confirm(`"${selectedTodo.title}" 할 일을 삭제하시겠습니까?`)) {
        return;
      }

      try {
        let csrfToken = null;
        try {
          const metaCsrf = document.querySelector('meta[name="_csrf"]');
          const metaCsrfHeader = document.querySelector('meta[name="_csrf_header"]');
          if (metaCsrf && metaCsrfHeader) {
            csrfToken = {
              token: metaCsrf.getAttribute('content'),
              header: metaCsrfHeader.getAttribute('content')
            };
          }
        } catch (e) {
          console.log('CSRF token not found in meta tags');
        }

        const headers = {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        };

        if (csrfToken) {
          headers[csrfToken.header] = csrfToken.token;
        }

        const response = await fetch(`http://localhost:8080/api/todo/${selectedTodo.id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: headers
        });

        if (response.status === 401) {
          console.error('401 Unauthorized - 인증 문제 발생');
          alert('인증에 실패했습니다. CSRF 토큰이나 세션 문제일 수 있습니다.');
          return;
        }

        if (!response.ok) {
          let errorText = '';
          try {
            const errorBody = await response.text();
            errorText = errorBody;
            console.log('Error response body:', errorBody);
          } catch (e) {
            console.log('Could not read error response body');
          }
          
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const result = await response.json();

        if (result.resultCode === 'S-1' || result.resultCode === 'SUCCESS' || response.ok) {
          setTodos(prevTodos => prevTodos.filter(todo => todo.id !== selectedTodo.id));
          setSelectedTodo(null);
          
          console.log(`✅ 할 일 "${selectedTodo.title}"가 삭제되었습니다.`);
          
          await refreshTodoList();
        } else {
          throw new Error(result.msg || result.message || 'Failed to delete todo');
        }
      } catch (error) {
        console.error('Failed to delete todo:', error);
        
        let errorMessage = '할 일 삭제에 실패했습니다.';
        if (error instanceof Error) {
          if (error.message.includes('401')) {
            errorMessage = '삭제 권한이 없습니다. CSRF 토큰이나 인증 설정을 확인해주세요.';
          } else if (error.message.includes('404')) {
            errorMessage = '해당 할 일을 찾을 수 없습니다.';
          } else if (error.message.includes('403')) {
            errorMessage = '할 일을 삭제할 권한이 없습니다.';
          } else if (error.message.includes('400')) {
            errorMessage = '삭제 요청이 올바르지 않습니다.';
          } else if (error.message.includes('500')) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          } else if (error.message.includes('Failed to fetch')) {
            errorMessage = '네트워크 연결을 확인해주세요.';
          }
        }
        
        alert(errorMessage + '\n\n개발자 도구의 Console과 Network 탭을 확인해보세요.');
        
        try {
          await refreshTodoList();
        } catch (refreshError) {
          console.error('Failed to refresh after error:', refreshError);
        }
      }
    }
  };

  const handleCreateTodo = () => {
    setShowCreateForm(true);
    setSelectedTodo(null);
    const now = new Date();
    const today = now.toISOString().slice(0, 16);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    
    setNewTodo({
      title: '',
      description: '',
      priority: 2,
      startDate: today,
      dueDate: tomorrow
    });
    setFormErrors({});
  };

  const handleFormChange = (field: string, value: string | number) => {
    setNewTodo(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!newTodo.title.trim()) {
      errors.title = '제목은 필수입니다.';
    }
    
    if (!newTodo.startDate) {
      errors.startDate = '시작일은 필수입니다.';
    }
    
    if (!newTodo.dueDate) {
      errors.dueDate = '마감일은 필수입니다.';
    }
    
    if (newTodo.startDate && newTodo.dueDate && new Date(newTodo.startDate) > new Date(newTodo.dueDate)) {
      errors.dueDate = '마감일은 시작일보다 늦어야 합니다.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitTodo = async () => {
    if (!validateForm()) return;
    
    try {
      const todoData = {
        title: newTodo.title.trim(),
        description: newTodo.description.trim(),
        priority: newTodo.priority,
        isCompleted: false,
        todoListId: parseInt(todoListId),
        startDate: newTodo.startDate,
        dueDate: newTodo.dueDate || null, // 빈 문자열을 null로 변환
        createdAt: new Date().toISOString(),
        modifyedAt: new Date().toISOString()
      };

      const response = await fetch('http://localhost:8080/api/todo', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todoData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.resultCode === '200-OK' || result.resultCode === 'SUCCESS' || response.ok) {
        const newTodoItem: Todo = {
          id: result.data?.id || result.id || Date.now(),
          title: result.data?.title || todoData.title,
          description: result.data?.description || todoData.description,
          completed: result.data?.completed || result.data?.isCompleted || false,
          priority: result.data?.priority || todoData.priority,
          startDate: result.data?.startDate || todoData.startDate,
          dueDate: result.data?.dueDate || todoData.dueDate, // null 유지
          todoList: result.data?.todoList || result.data?.todoListId || parseInt(todoListId),
          createdAt: result.data?.createdAt || todoData.createdAt,
          updatedAt: result.data?.updatedAt || result.data?.modifyedAt || todoData.modifyedAt
        };
        
        setTodos(prev => [...prev, newTodoItem]);
        setShowCreateForm(false);
        setSelectedTodo(newTodoItem);
        
        console.log('✅ 할 일이 성공적으로 추가되었습니다!');
        
        await refreshTodoList();
        
      } else {
        throw new Error(result.message || result.msg || 'Failed to create todo');
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
      
      let errorMessage = '할 일 생성에 실패했습니다.';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
        } else if (error.message.includes('400')) {
          errorMessage = '입력 데이터에 문제가 있습니다. 다시 확인해주세요.';
        } else if (error.message.includes('401')) {
          errorMessage = '로그인이 필요합니다.';
        } else if (error.message.includes('500')) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewTodo({
      title: '',
      description: '',
      priority: 2,
      startDate: '',
      dueDate: ''
    });
    setFormErrors({});
  };

  // 로딩 및 에러 상태
  if (loading) {
    return (
      <TodoListTemplate>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 200px)',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--border-light)',
            borderTop: '4px solid var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            TodoList를 불러오는 중...
          </p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </TodoListTemplate>
    );
  }

  if (error) {
    return (
      <TodoListTemplate>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 200px)',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            오류가 발생했습니다
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', textAlign: 'center' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            다시 시도
          </button>
        </div>
      </TodoListTemplate>
    );
  }

  return (
    <TodoListTemplate>
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        height: 'calc(100vh - 120px)',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        gap: '2rem'
      }}>
        {/* 왼쪽: 투두리스트 + 투두목록 */}
        <div style={{ 
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <TodoListInfoComponent 
            todoListInfo={todoListInfo}
            todoListId={todoListId}
            todos={todos}
          />
          <TodoListItems 
            todos={todos}
            selectedTodo={selectedTodo}
            onTodoClick={handleTodoClick}
            onCheckboxChange={handleCheckboxChange}
            onCreateTodo={handleCreateTodo}
          />
        </div>

        {/* 오른쪽: 선택된 Todo 상세 정보 또는 새 TODO 생성 폼 */}
        <div style={{ 
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {showCreateForm ? (
            <TodoCreateForm 
              newTodo={newTodo}
              formErrors={formErrors}
              onFormChange={handleFormChange}
              onSubmit={handleSubmitTodo}
              onCancel={handleCancelCreate}
            />
          ) : selectedTodo ? (
            <TodoDetailView 
              todo={selectedTodo}
              onCheckboxChange={handleCheckboxChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <TodoEmptyState />
          )}
        </div>
      </div>
    </TodoListTemplate>
  );
}