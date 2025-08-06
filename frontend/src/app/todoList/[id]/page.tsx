'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TodoListTemplate from '../../_components/TodoList/TodoListTemplate';
import TodoListInfoComponent from './components/TodoListInfo';
import TodoListItems from './components/TodoListItems';
import TodoCreateForm from './components/TodoCreateForm';
import TodoDetailView from './components/TodoDetailView';
import TodoEmptyState from './components/TodoEmptyState';
import TodoEditForm from './components/TodoEditForm';

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: number;
  startDate: string;
  dueDate?: string | null;
  todoList: number;
  createdAt: string;
  updatedAt: string;
  labels?: Label[]; // 🔥 추가
}

interface Label {
  id: number;
  name: string;
  color: string;
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
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  
  // 새 TODO 폼 상태
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 2,
    startDate: '',
    dueDate: ''
  });
  // 수정 TODO 폼 상태 추가
  const [editTodo, setEditTodo] = useState({
    title: '',
    description: '',
    priority: 2,
    startDate: '',
    dueDate: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // TodoList 정보와 Todos 데이터 가져오기
  const fetchTodoListData = async () => {
    if (!todoListId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. TodoList 정보 먼저 불러오기
      const todoListResponse = await fetch(`http://localhost:8080/api/todo-lists/${todoListId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let todoListData = null;
      if (todoListResponse.ok) {
        const todoListResult = await todoListResponse.json();
        if (todoListResult.data) {
          todoListData = {
            id: todoListResult.data.id || parseInt(todoListId),
            name: todoListResult.data.name || `TodoList ${todoListId}`,
            description: todoListResult.data.description || `TodoList ${todoListId}의 할일 목록`,
            userId: todoListResult.data.userId || 0,
            teamId: todoListResult.data.teamId || 0,
            createDate: todoListResult.data.createDate || new Date().toISOString(),
            modifyDate: todoListResult.data.modifyDate || new Date().toISOString()
          };
          setTodoListInfo(todoListData);
        }
      }

      // 2. Todo 목록 불러오기
      const todosResponse = await fetch(`http://localhost:8080/api/todo/list/${todoListId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!todosResponse.ok) {
        throw new Error(`HTTP error! status: ${todosResponse.status}`);
      }

      const todosResult = await todosResponse.json();
      
      if (todosResult.resultCode === '200-OK' || todosResult.resultCode === 'SUCCESS' || todosResponse.ok) {
        // TodoList 정보가 이전에 실패했다면 첫 번째 Todo에서 가져오기
        if (!todoListData && todosResult.data && todosResult.data.length > 0) {
          const firstTodo = todosResult.data[0];
          setTodoListInfo({
            id: result.data.id,
            name: result.data.name,
            description: result.data.description,
            userId: result.data.userId,
            teamId: result.data.teamId,
            createDate: result.data.createDate,
            modifyDate: result.data.modifyDate
          });
        }
        
        // 3. 각 Todo에 대해 라벨 정보 추가로 불러오기
        const todosWithLabels = await Promise.all(
          (todosResult.data || []).map(async (todo: Todo) => {
            try {
              const labelResponse = await fetch(`http://localhost:8080/api/todos/${todo.id}/labels`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                  'Accept': 'application/json',
                },
              });
              
              if (labelResponse.ok) {
                const labelResult = await labelResponse.json();
                const labels = labelResult.data?.labels || [];
                return { ...todo, labels };
              } else {
                return { ...todo, labels: [] };
              }
            } catch (error) {
              console.error(`Todo ${todo.id} 라벨 불러오기 실패:`, error);
              return { ...todo, labels: [] };
            }
          })
        );
        
        setTodos(todosWithLabels);
      } else {
        throw new Error(todosResult.msg || 'Failed to fetch todo list');
      }
    } catch (err) {
      console.error('Failed to fetch todo list:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      // 에러 발생 시에도 빈 배열로 설정
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodoListData();
  }, [todoListId]);

  // 이벤트 핸들러들
  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowCreateForm(false);
    setShowEditForm(false);
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
      } else {
        throw new Error(result.msg || result.message || 'Failed to toggle todo status');
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      alert('할 일 상태 변경에 실패했습니다.');
    }
  };

  const handleEdit = () => {
    if (selectedTodo) {
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setEditTodo({
        title: selectedTodo.title,
        description: selectedTodo.description,
        priority: selectedTodo.priority,
        startDate: formatDateForInput(selectedTodo.startDate),
        dueDate: formatDateForInput(selectedTodo.dueDate)
      });
      setShowEditForm(true);
      setShowCreateForm(false);
      setFormErrors({});
    }
  };

  const handleDelete = async () => {
    if (selectedTodo) {
      if (!confirm(`"${selectedTodo.title}" 할 일을 삭제하시겠습니까?`)) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/todo/${selectedTodo.id}`, {
          method: 'DELETE',
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
          setTodos(prevTodos => prevTodos.filter(todo => todo.id !== selectedTodo.id));
          setSelectedTodo(null);
          await refreshTodoList();
        } else {
          throw new Error(result.msg || result.message || 'Failed to delete todo');
        }
      } catch (error) {
        console.error('Failed to delete todo:', error);
        alert('할 일 삭제에 실패했습니다.');
      }
    }
  };

  const handleCreateTodo = () => {
    setShowCreateForm(true);
    setShowEditForm(false);
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
    if (showEditForm) {
      setEditTodo(prev => ({ ...prev, [field]: value }));
    } else {
      setNewTodo(prev => ({ ...prev, [field]: value }));
    }
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    const currentTodo = showEditForm ? editTodo : newTodo;
    
    if (!currentTodo.title.trim()) {
      errors.title = '제목은 필수입니다.';
    }
    
    if (!currentTodo.startDate) {
      errors.startDate = '시작일은 필수입니다.';
    }
    
    if (!currentTodo.dueDate) {
      errors.dueDate = '마감일은 필수입니다.';
    }
    
    if (currentTodo.startDate && currentTodo.dueDate && new Date(currentTodo.startDate) > new Date(currentTodo.dueDate)) {
      errors.dueDate = '마감일은 시작일보다 늦어야 합니다.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // TodoCreateForm props 타입 수정
  const handleSubmitTodo = async (selectedLabels?: number[]) => {
    if (!validateForm()) return;
    
    const currentTodo = showEditForm ? editTodo : newTodo;
    
    try {
      const todoData = {
        title: currentTodo.title.trim(),
        description: currentTodo.description.trim(),
        priority: currentTodo.priority,
        isCompleted: selectedTodo?.completed || false,
        todoListId: parseInt(todoListId),
        startDate: currentTodo.startDate,
        dueDate: currentTodo.dueDate || null,
        createdAt: selectedTodo?.createdAt || new Date().toISOString(),
        modifyedAt: new Date().toISOString()
      };

      const isEdit = showEditForm && selectedTodo;
      const url = isEdit 
        ? `http://localhost:8080/api/todo/${selectedTodo.id}` 
        : 'http://localhost:8080/api/todo';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
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
        let createdTodoId: number;
        
        if (isEdit) {
          const updatedTodo: Todo = {
            ...selectedTodo,
            title: result.data?.title || todoData.title,
            description: result.data?.description || todoData.description,
            priority: result.data?.priority || todoData.priority,
            startDate: result.data?.startDate || todoData.startDate,
            dueDate: result.data?.dueDate || todoData.dueDate,
            updatedAt: result.data?.updatedAt || todoData.modifyedAt
          };
          
          setTodos(prev => prev.map(todo => 
            todo.id === selectedTodo.id ? updatedTodo : todo
          ));
          setSelectedTodo(updatedTodo);
          setShowEditForm(false);
          createdTodoId = selectedTodo.id;
        } else {
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
          
          setTodos(prev => [...prev, newTodoItem]);
          setShowCreateForm(false);
          setSelectedTodo(newTodoItem);
          createdTodoId = newTodoItem.id;
        }

        // 라벨이 선택되었다면 라벨 연결 API 호출
        if (selectedLabels && selectedLabels.length > 0) {
          try {
            const labelResponse = await fetch(`http://localhost:8080/api/todos/${createdTodoId}/labels`, {
              method: isEdit ? 'PUT' : 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                todoId: createdTodoId,
                labelIds: selectedLabels
              })
            });

            if (!labelResponse.ok) {
              console.error('라벨 연결 실패:', labelResponse.status);
              alert(`할 일 ${isEdit ? '수정' : '생성'}은 완료되었지만 라벨 연결에 실패했습니다.`);
            } else {
              const labelResult = await labelResponse.json();
              console.log('라벨 연결 성공:', labelResult);
              
              // 🔥 수정: 연결된 라벨 정보를 Todo 객체에 추가
              if (labelResult.data?.labels) {
                if (isEdit && selectedTodo) {
                  setSelectedTodo(prev => prev ? { 
                    ...prev, 
                    labels: labelResult.data.labels 
                  } : null);
                } else {
                  setTodos(prev => prev.map(todo => 
                    todo.id === createdTodoId 
                      ? { ...todo, labels: labelResult.data.labels }
                      : todo
                  ));
                  
                  // selectedTodo도 업데이트
                  if (selectedTodo?.id === createdTodoId) {
                    setSelectedTodo(prev => prev ? {
                      ...prev,
                      labels: labelResult.data.labels
                    } : null);
                  }
                }
              }
            }
          } catch (labelError) {
            console.error('라벨 연결 중 오류:', labelError);
            alert(`할 일 ${isEdit ? '수정' : '생성'}은 완료되었지만 라벨 연결에 실패했습니다.`);
          }
        }
        
        await refreshTodoList();
      } else {
        throw new Error(result.message || result.msg || `Failed to ${isEdit ? 'update' : 'create'} todo`);
      }
    } catch (error) {
      console.error(`Failed to ${showEditForm ? 'update' : 'create'} todo:`, error);
      
      const action = showEditForm ? '수정' : '생성';
      let errorMessage = `할 일 ${action}에 실패했습니다.`;
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

  // 새로고침용 함수 (로딩 상태 없이)
  const refreshTodoList = async () => {
    if (!todoListId) return;
    
    try {
      // 1. TodoList 정보 새로고침
      const todoListResponse = await fetch(`http://localhost:8080/api/todo-lists/${todoListId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let todoListData = null;
      if (todoListResponse.ok) {
        const todoListResult = await todoListResponse.json();
        if (todoListResult.data) {
          todoListData = {
            id: todoListResult.data.id || parseInt(todoListId),
            name: todoListResult.data.name || `TodoList ${todoListId}`,
            description: todoListResult.data.description || `TodoList ${todoListId}의 할일 목록`,
            userId: todoListResult.data.userId || 0,
            teamId: todoListResult.data.teamId || 0,
            createDate: todoListResult.data.createDate || new Date().toISOString(),
            modifyDate: todoListResult.data.modifyDate || new Date().toISOString()
          };
          setTodoListInfo(todoListData);
        }
      }

      // 2. Todo 목록 새로고침
      const todosResponse = await fetch(`http://localhost:8080/api/todo/list/${todoListId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!todosResponse.ok) {
        throw new Error(`HTTP error! status: ${todosResponse.status}`);
      }

      const todosResult = await todosResponse.json();
      
      if (todosResult.resultCode === '200-OK' || todosResult.resultCode === 'SUCCESS' || todosResponse.ok) {
        // TodoList 정보가 이전에 실패했다면 첫 번째 Todo에서 가져오기
        if (!todoListData && todosResult.data && todosResult.data.length > 0) {
          const firstTodo = todosResult.data[0];
          setTodoListInfo({
            id: result.data.id,
            name: result.data.name,
            description: result.data.description,
            userId: result.data.userId,
            teamId: result.data.teamId,
            createDate: result.data.createDate,
            modifyDate: result.data.modifyDate
          });
        }
        
        // 3. 각 Todo에 대해 라벨 정보도 함께 불러오기
        const todosWithLabels = await Promise.all(
          (todosResult.data || []).map(async (todo: Todo) => {
            try {
              const labelResponse = await fetch(`http://localhost:8080/api/todos/${todo.id}/labels`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                  'Accept': 'application/json',
                },
              });
              
              if (labelResponse.ok) {
                const labelResult = await labelResponse.json();
                const labels = labelResult.data?.labels || [];
                return { ...todo, labels };
              } else {
                return { ...todo, labels: [] };
              }
            } catch (error) {
              console.error(`Todo ${todo.id} 라벨 불러오기 실패:`, error);
              return { ...todo, labels: [] };
            }
          })
        );
        
        setTodos(todosWithLabels);
      }
    } catch (err) {
      console.error('Failed to refresh todo list:', err);
      // 에러 발생 시에도 기존 상태 유지 (빈 배열이든 기존 배열이든)
    }
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
    <TodoListTemplate contentClassName="todo-list-content">
      <style jsx global>{`
        .todo-list-content {
          padding: 1rem !important;
          display: flex !important;
          align-items: stretch !important;
          justify-content: flex-start !important;
          text-align: left !important;
          max-width: none !important;
          width: 100% !important;
        }
        .todo-list-content .welcome-message {
          width: 100% !important;
          max-width: none !important;
          display: flex !important;
          flex-direction: column !important;
        }
      `}</style>
      
      <div style={{ 
        width: '70%',
        maxWidth: '1500px',
        minWidth: '800px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        textAlign: 'left',
        height: '100%',
        overflowX: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          height: 'calc(100vh - 120px)',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          gap: '2rem',
          minWidth: '1100px' // 1000px -> 1100px로 증가
        }}>
          <div style={{ 
            width: '40%',
            minWidth: '400px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            flexShrink: 0
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

          <div style={{ 
            width: '40%',
            minWidth: '450px', // 350px -> 450px로 증가 (약 100px 더 넓게)
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}>
            {showCreateForm ? (
                <TodoCreateForm 
                  newTodo={newTodo}
                  formErrors={formErrors}
                  onFormChange={handleFormChange}
                  onSubmit={handleSubmitTodo} // 이제 selectedLabels를 받을 수 있음
                  onCancel={handleCancelCreate}
                />
              ) : showEditForm && selectedTodo ? (
                <TodoEditForm 
                  todo={selectedTodo}
                  editTodo={editTodo}
                  formErrors={formErrors}
                  onFormChange={handleFormChange}
                  onSubmit={handleSubmitTodo} // 이제 selectedLabels를 받을 수 있음
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
      </div>
    </TodoListTemplate>
  );
}