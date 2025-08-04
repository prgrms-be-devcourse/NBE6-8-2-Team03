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
  dueDate: string;
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

  // TodoList 정보와 Todos 데이터 가져오기
  useEffect(() => {
    fetchTodoListData();
  }, [todoListId]);

  // useEffect에서 사용할 함수를 위로 이동
  const fetchTodoListData = async () => {
    if (!todoListId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8080/api/todo/list/${todoListId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.resultCode === '200-OK' || result.resultCode === 'SUCCESS' || response.ok) {
        if (result.data && result.data.length > 0) {
          const firstTodo = result.data[0];
          setTodoListInfo({
            id: firstTodo.todoList,
            name: `TodoList ${firstTodo.todoList}`,
            description: `TodoList ID ${firstTodo.todoList}의 할일 목록`,
            userId: 0,
            teamId: 0,
            createDate: firstTodo.createdAt,
            modifyDate: firstTodo.updatedAt
          });
        }
        
        setTodos(result.data || []);
      } else {
        throw new Error(result.msg || 'Failed to fetch todo list');
      }
    } catch (err) {
      console.error('Failed to fetch todo list:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // 이벤트 핸들러들
  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowCreateForm(false);
  };

  const handleCheckboxChange = async (todoId: number) => {
    try {
      // 실제 API 호출로 완료 상태 토글
      const response = await fetch(`http://localhost:8080/api/todo/${todoId}/toggle`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // 성공 시 로컬 상태 업데이트
        setTodos(prevTodos => 
          prevTodos.map(todo => 
            todo.id === todoId 
              ? { ...todo, completed: !todo.completed }
              : todo
          )
        );
        
        // 선택된 todo도 업데이트
        if (selectedTodo?.id === todoId) {
          setSelectedTodo(prev => prev ? { ...prev, completed: !prev.completed } : null);
        }
        
        console.log(`✅ 할 일 ${todoId} 상태가 변경되었습니다.`);
        
        // 목록 새로고침 (서버 데이터와 동기화)
        await fetchTodoListData();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      alert('할 일 상태 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleEdit = () => {
    if (selectedTodo) {
      console.log(`Edit todo ${selectedTodo.id}`);
    }
  };

  const handleDelete = async () => {
    if (selectedTodo) {
      try {
        // 실제 API 호출로 삭제
        const response = await fetch(`http://localhost:8080/api/todo/${selectedTodo.id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // 성공 시 로컬 상태에서 제거
          setTodos(prevTodos => prevTodos.filter(todo => todo.id !== selectedTodo.id));
          setSelectedTodo(null);
          
          console.log(`✅ 할 일 ${selectedTodo.id}가 삭제되었습니다.`);
          
          // 목록 새로고침 (서버 데이터와 동기화)
          await refreshTodoList();
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to delete todo:', error);
        alert('할 일 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleCreateTodo = () => {
    setShowCreateForm(true);
    setSelectedTodo(null);
    // 현재 날짜를 기본값으로 설정
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
        dueDate: newTodo.dueDate,
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
      console.log('API Response:', result); // 디버깅용
      
      // 다양한 성공 응답 형태 처리
      if (result.resultCode === '200-OK' || result.resultCode === 'SUCCESS' || response.ok) {
        // 서버에서 받은 데이터 사용, 없으면 클라이언트 데이터 사용
        const newTodoItem: Todo = {
          id: result.data?.id || result.id || Date.now(),
          title: result.data?.title || todoData.title,
          description: result.data?.description || todoData.description,
          completed: result.data?.completed || result.data?.isCompleted || false,
          priority: result.data?.priority || todoData.priority,
          startDate: result.data?.startDate || todoData.startDate,
          dueDate: result.data?.dueDate || todoData.dueDate,
          todoList: result.data?.todoList || result.data?.todoListId || parseInt(todoListId),
          createdAt: result.data?.createdAt || todoData.createdAt,
          updatedAt: result.data?.updatedAt || result.data?.modifyedAt || todoData.modifyedAt
        };
        
        // 성공 시 목록에 추가
        setTodos(prev => [...prev, newTodoItem]);
        setShowCreateForm(false);
        setSelectedTodo(newTodoItem);
        
        // 성공 메시지 표시 (선택사항)
        console.log('✅ 할 일이 성공적으로 추가되었습니다!');
        
        // 목록 새로고침 (서버 데이터와 동기화)
        await refreshTodoList();
        
      } else {
        throw new Error(result.message || result.msg || 'Failed to create todo');
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
      
      // 더 구체적인 에러 메시지
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

  // 별도의 데이터 새로고침 함수 (로딩 상태 없이)
  const refreshTodoList = async () => {
    if (!todoListId) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/todo/list/${todoListId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.resultCode === '200-OK' || result.resultCode === 'SUCCESS' || response.ok) {
        if (result.data && result.data.length > 0) {
          const firstTodo = result.data[0];
          setTodoListInfo({
            id: firstTodo.todoList,
            name: `TodoList ${firstTodo.todoList}`,
            description: `TodoList ID ${firstTodo.todoList}의 할일 목록`,
            userId: 0,
            teamId: 0,
            createDate: firstTodo.createdAt,
            modifyDate: firstTodo.updatedAt
          });
        }
        
        setTodos(result.data || []);
      }
    } catch (err) {
      console.error('Failed to refresh todo list:', err);
      // 새로고침 실패는 조용히 처리 (기존 데이터 유지)
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