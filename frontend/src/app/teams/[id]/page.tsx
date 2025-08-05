'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle, Circle, Calendar, User, Crown, Settings, Eye, Search, X, Filter, SortAsc, Star, Clock, Users, Target, CheckSquare } from 'lucide-react';
import TodoListTemplate from '../../_components/TodoList/TodoListTemplate';

// 백엔드 API 응답 구조에 맞는 인터페이스
interface TeamMemberResponseDto {
  id: number;
  userId: number;
  userEmail: string;
  userNickname: string;
  teamId: number;
  role: 'LEADER' | 'MEMBER';
  joinedAt: string;
  createDate: string;
  modifyDate: string;
}

interface TeamResponseDto {
  id: number;
  teamName: string;
  description: string;
  createDate: string;
  modifyDate: string;
  members: TeamMemberResponseDto[];
}

// 할일 목록 인터페이스
interface TodoList {
  id: number;
  name: string;
  description: string;
  userId: number;
  teamId: number;
  createDate: string;
  modifyDate: string;
  todos?: Todo[];
}

// 할일 인터페이스
interface Todo {
  id: number;
  title: string;
  description: string;
  priority: number;
  completed: boolean;
  todoListId: number;
  createdAt: string;
  updatedAt: string;
  assignedMemberId?: number | null;
  dueDate?: string | null;
}

// API 응답 타입
interface ApiResponse<T> {
  resultCode: string;
  msg: string;
  data: T;
}

const TeamDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
<<<<<<< HEAD
  const teamId = parseInt(params.id as string);
=======
  const teamId = Number(params.id);

  const [team, setTeam] = useState<TeamResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todos, setTodos] = useState<any[]>([]);

  // 모달 상태
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showTodoListModal, setShowTodoListModal] = useState(false);

  // 할일 목록 상태
  const [todoLists, setTodoLists] = useState<any[]>([]);
  const [selectedTodoList, setSelectedTodoList] = useState<any>(null);

  // 폼 상태
  const [editForm, setEditForm] = useState({
    teamName: '',
    description: ''
  });

  const [memberForm, setMemberForm] = useState({
    email: '',
    role: 'MEMBER' as 'LEADER' | 'MEMBER'
  });

  const [todoForm, setTodoForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedMemberId: ''
  });

  // 로딩 상태
  const [actionLoading, setActionLoading] = useState({
    editTeam: false,
    inviteMember: false,
    addTodo: false
  });
>>>>>>> 9b69a65 (backup(fe): 팀 투두 서비스 철폐)

  // 임시 Toast 함수
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  // 상태 관리
  const [team, setTeam] = useState<TeamResponseDto | null>(null);
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [selectedTodoList, setSelectedTodoList] = useState<TodoList | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 모달 상태
  const [showTodoListModal, setShowTodoListModal] = useState<boolean>(false);
  const [showTodoModal, setShowTodoModal] = useState<boolean>(false);
  const [editingTodoList, setEditingTodoList] = useState<TodoList | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodoList, setNewTodoList] = useState({ name: '', description: '' });
  const [newTodo, setNewTodo] = useState({ 
    title: '', 
    description: '', 
    priority: 2,
    assignedMemberId: null as number | null,
    dueDate: ''
  });
  


  // 사용자 정보 가져오기
  const getCurrentUser = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/user/me', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser({ id: userData.data.id, nickname: userData.data.nickName });
      }
    } catch (err) {
      console.log('사용자 정보 가져오기 실패');
    }
  };

  // 팀 정보 가져오기
  const fetchTeamInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.resultCode === '200-OK') {
        setTeam(result.data);
      } else {
        throw new Error(result.msg || 'Failed to fetch team');
      }
    } catch (error) {
      console.error('팀 정보 가져오기 실패:', error);
      setError('팀 정보를 가져오는데 실패했습니다.');
    }
  };

  // 팀 할일 목록 가져오기
  const fetchTodoLists = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/todo-lists`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.resultCode === '200-OK') {
        setTodoLists(result.data);
      } else {
        throw new Error(result.msg || 'Failed to fetch todo lists');
      }
    } catch (error) {
      console.error('할일 목록 가져오기 실패:', error);
      setError('할일 목록을 가져오는데 실패했습니다.');
    }
  };

  // 할일 목록별 할일 가져오기
  const fetchTodosByList = async (todoListId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/todo-lists/${todoListId}/todos`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.resultCode === '200-OK') {
        setTodos(result.data);
        setSelectedTodo(null); // 할일 목록 변경 시 선택된 할일 초기화
      } else {
        throw new Error(result.msg || 'Failed to fetch todos');
      }
    } catch (error) {
      console.error('할일 가져오기 실패:', error);
      setError('할일을 가져오는데 실패했습니다.');
    }
<<<<<<< HEAD
=======
  }, [teamId]);

  const fetchTodoLists = useCallback(async () => {
    try {
      // 팀 도메인의 할일 목록 API 사용 (임시로 하드코딩된 데이터 사용)
      const mockTodoLists = [
        {
          id: 1,
          name: "프론트엔드 개발팀 할일 목록",
          description: "팀원들과 함께 관리하는 할일들",
          todos: [
            {
              id: 1,
              title: "프론트엔드 컴포넌트 개발",
              description: "React 컴포넌트 라이브러리 구축",
              isCompleted: false,
              priority: 3,
              dueDate: "2025-08-25T18:00:00",
              assignedMemberId: 1,
              type: "team"
            },
            {
              id: 2,
              title: "UI/UX 디자인 검토",
              description: "새로운 디자인 시스템 검토 및 피드백",
              isCompleted: false,
              priority: 2,
              dueDate: "2025-08-22T18:00:00",
              assignedMemberId: 2,
              type: "team"
            }
          ]
        }
      ];
      
      setTodoLists(mockTodoLists);
    } catch (err) {
      console.error('할일 목록 가져오기 실패:', err);
      setTodoLists([]);
    }
  }, [teamId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTeamData(),
        fetchTodos(),
        fetchTodoLists()
      ]);
      setLoading(false);
    };

    if (teamId) {
      loadData();
    }
  }, [teamId, fetchTeamData, fetchTodos, fetchTodoLists]);

  const handleGoBack = () => {
    router.push('/teams');
>>>>>>> 9b69a65 (backup(fe): 팀 투두 서비스 철폐)
  };

  // 할일 목록 생성
  const handleCreateTodoList = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTodoList.name.trim()) {
      showToast('할일 목록 이름을 입력해주세요.', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/todo-lists`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTodoList)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.resultCode === '200-OK') {
        showToast('할일 목록이 성공적으로 생성되었습니다.', 'success');
        setNewTodoList({ name: '', description: '' });
        setShowTodoListModal(false);
        fetchTodoLists();
      } else {
        throw new Error(result.msg || 'Failed to create todo list');
      }
    } catch (error) {
      console.error('할일 목록 생성 실패:', error);
      showToast('할일 목록 생성에 실패했습니다.', 'error');
    }
  };

  // 할일 목록 수정
  const handleUpdateTodoList = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTodoList || !editingTodoList.name.trim()) {
      showToast('할일 목록 이름을 입력해주세요.', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/todo-lists/${editingTodoList.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingTodoList.name,
          description: editingTodoList.description
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.resultCode === '200-OK') {
        showToast('할일 목록이 성공적으로 수정되었습니다.', 'success');
        setEditingTodoList(null);
        setShowTodoListModal(false);
        fetchTodoLists();
      } else {
        throw new Error(result.msg || 'Failed to update todo list');
      }
    } catch (error) {
      console.error('할일 목록 수정 실패:', error);
      showToast('할일 목록 수정에 실패했습니다.', 'error');
    }
  };

<<<<<<< HEAD
  // 할일 목록 삭제
  const handleDeleteTodoList = async (todoListId: number) => {
    if (!confirm('정말로 이 할일 목록을 삭제하시겠습니까?')) {
=======
  const handleSelectTodoList = (todoList: any) => {
    setSelectedTodoList(todoList);
  };

  const handleEditTodoList = (todoList: any) => {
    // TODO: 할일 목록 수정 기능 구현
    console.log('할일 목록 수정:', todoList);
  };

  const handleDeleteTodoList = (todoListId: number) => {
    // TODO: 할일 목록 삭제 기능 구현
    console.log('할일 목록 삭제:', todoListId);
  };

  const handleAddTodo = async () => {
    console.log('할일 추가 시작');
    console.log('teamId:', teamId);
    console.log('todoForm:', todoForm);
    
    // 모달 내부 경고 메시지 초기화
    setModalError(null);
    
    if (!todoForm.title.trim()) {
      console.log('제목이 비어있음');
      setModalError('할일 제목을 입력해주세요.');
>>>>>>> 9b69a65 (backup(fe): 팀 투두 서비스 철폐)
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/todo-lists/${todoListId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.resultCode === '200-OK') {
        showToast('할일 목록이 성공적으로 삭제되었습니다.', 'success');
        if (selectedTodoList?.id === todoListId) {
          setSelectedTodoList(null);
          setTodos([]);
          setSelectedTodo(null);
        }
        fetchTodoLists();
      } else {
        throw new Error(result.msg || 'Failed to delete todo list');
      }
    } catch (error) {
      console.error('할일 목록 삭제 실패:', error);
      showToast('할일 목록 삭제에 실패했습니다.', 'error');
    }
  };

  // 할일 추가
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTodoList || !newTodo.title.trim()) {
      showToast('할일 제목을 입력해주세요.', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/todo-lists/${selectedTodoList.id}/todos`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newTodo,
          dueDate: newTodo.dueDate ? new Date(newTodo.dueDate).toISOString() : null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.resultCode === '200-OK') {
        showToast('할일이 성공적으로 추가되었습니다.', 'success');
        setNewTodo({ title: '', description: '', priority: 2, assignedMemberId: null, dueDate: '' });
        setShowTodoModal(false);
        fetchTodosByList(selectedTodoList.id);
      } else {
        throw new Error(result.msg || 'Failed to add todo');
      }
    } catch (error) {
      console.error('할일 추가 실패:', error);
      showToast('할일 추가에 실패했습니다.', 'error');
    }
  };

  // 할일 수정
  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTodo || !editingTodo.title.trim()) {
      showToast('할일 제목을 입력해주세요.', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/todos/${editingTodo.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editingTodo.title,
          description: editingTodo.description,
          priority: editingTodo.priority
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.resultCode === '200-OK') {
        showToast('할일이 성공적으로 수정되었습니다.', 'success');
        setEditingTodo(null);
        setShowTodoModal(false);
        if (selectedTodoList) {
          fetchTodosByList(selectedTodoList.id);
        }
      } else {
        throw new Error(result.msg || 'Failed to update todo');
      }
    } catch (error) {
      console.error('할일 수정 실패:', error);
      showToast('할일 수정에 실패했습니다.', 'error');
    }
  };

  // 할일 삭제
  const handleDeleteTodo = async (todoId: number) => {
    if (!confirm('정말로 이 할일을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/todos/${todoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.resultCode === '200-OK') {
        showToast('할일이 성공적으로 삭제되었습니다.', 'success');
        if (selectedTodo?.id === todoId) {
          setSelectedTodo(null);
        }
        if (selectedTodoList) {
          fetchTodosByList(selectedTodoList.id);
        }
      } else {
        throw new Error(result.msg || 'Failed to delete todo');
      }
    } catch (error) {
      console.error('할일 삭제 실패:', error);
      showToast('할일 삭제에 실패했습니다.', 'error');
    }
  };

  // 할일 완료 상태 토글
  const handleToggleTodoComplete = async (todoId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/todos/${todoId}/toggle`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.resultCode === '200-OK') {
        // 로컬 상태 업데이트
        setTodos(prevTodos => 
          prevTodos.map(todo => 
            todo.id === todoId 
              ? { ...todo, completed: !todo.completed }
              : todo
          )
        );
        
        // 선택된 할일이 같은 할일이면 업데이트
        if (selectedTodo?.id === todoId) {
          setSelectedTodo(prev => prev ? { ...prev, completed: !prev.completed } : null);
        }
      } else {
        throw new Error(result.msg || 'Failed to toggle todo');
      }
    } catch (error) {
      console.error('할일 상태 변경 실패:', error);
      showToast('할일 상태 변경에 실패했습니다.', 'error');
    }
  };

  // 할일 목록 선택
  const handleSelectTodoList = (todoList: TodoList) => {
    setSelectedTodoList(todoList);
    setSelectedTodo(null); // 할일 목록 변경 시 선택된 할일 초기화
    fetchTodosByList(todoList.id);
  };

  // 할일 선택
  const handleSelectTodo = (todo: Todo) => {
    setSelectedTodo(todo);
  };

  // 할일 목록 편집 모드
  const handleEditTodoList = (todoList: TodoList) => {
    setEditingTodoList(todoList);
    setShowTodoListModal(true);
  };

  // 할일 편집 모드
  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowTodoModal(true);
  };

  // 우선순위 문자열 변환
  const getPriorityString = (priority: number): string => {
    switch (priority) {
      case 1: return '높음';
      case 2: return '보통';
      case 3: return '낮음';
      default: return '보통';
    }
  };

  // 우선순위 색상
  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 사용자 역할 가져오기
  const getUserRole = (): 'LEADER' | 'MEMBER' | null => {
    if (!team || !currentUser) return null;
    const member = team.members.find(m => m.userId === currentUser.id);
    return member ? member.role : null;
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          getCurrentUser(),
          fetchTeamInfo(),
          fetchTodoLists()
        ]);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      loadData();
    }
  }, [teamId]);

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
            팀 정보를 불러오는 중...
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

  if (!team) {
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
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            팀을 찾을 수 없습니다
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', textAlign: 'center' }}>
            요청하신 팀이 존재하지 않거나 접근 권한이 없습니다.
          </p>
          <button
            onClick={() => router.back()}
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
            이전 페이지로
          </button>
        </div>
      </TodoListTemplate>
    );
  }

  const userRole = getUserRole();

  return (
    <TodoListTemplate>
<<<<<<< HEAD
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        height: 'calc(100vh - 120px)',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        gap: '1.5rem'
      }}>
        {/* 왼쪽: 팀 정보 (고정) */}
        <div style={{ 
          width: '25%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: 'var(--bg-white)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px var(--shadow-md)',
            border: '1px solid var(--border-light)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* 뒤로가기 버튼 */}
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={() => router.back()}
                style={{
                  padding: '0.5rem',
                  background: 'transparent',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* 팀 기본 정보 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: 'var(--text-primary)', 
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                👥 {team.teamName}
                {userRole === 'LEADER' && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    background: '#fef3c7',
                    color: '#d97706',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    <Crown className="w-3 h-3" />
                    리더
                  </span>
                )}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {team.description}
              </p>
            </div>

            {/* 팀 통계 */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <span style={{
                background: 'var(--primary-light)',
                color: 'var(--primary-color)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                👥 멤버 {team.members.length}명
              </span>
              <span style={{
                background: '#f0fdf4',
                color: '#16a34a',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                📋 할일목록 {todoLists.length}개
              </span>
              
            </div>

            {/* 팀 멤버 목록 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                👥 팀 멤버
              </h3>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      padding: '0.75rem',
                      background: 'var(--bg-main)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}>
                        {member.userNickname}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {member.userEmail}
=======
      <div className="flex h-full">
        {/* 왼쪽 패널 - 팀 정보 및 멤버 */}
        <div className="w-1/3 p-8 border-r border-gray-200 overflow-y-auto">
          {/* 팀 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{team.teamName}</h1>
                <p className="text-lg text-gray-600">{team.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditForm({ teamName: team.teamName, description: team.description });
                    setShowEditModal(true);
                  }}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  팀 수정
                </button>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  멤버 초대
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>생성일: {formatDate(team.createDate)}</span>
              <span>멤버: {team.members.length}명</span>
            </div>
          </div>

          {/* 멤버 목록 */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">팀 멤버</h2>
            <div className="space-y-3">
              {team.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {member.userNickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{member.userNickname}</div>
                      <div className="text-xs text-gray-500">
                        {member.role === 'LEADER' ? '리더' : '멤버'} • {formatDate(member.joinedAt)} 가입
>>>>>>> 9b69a65 (backup(fe): 팀 투두 서비스 철폐)
                      </div>
                    </div>
                    {member.role === 'LEADER' && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: '#fef3c7',
                        color: '#d97706',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        리더
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 팀 생성일 */}
            <div style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-light)',
              fontSize: '0.75rem',
              color: 'var(--text-light)',
              textAlign: 'center'
            }}>
              생성일: {formatDate(team.createDate)}
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* 중간: TodoList 목록들 */}
        <div style={{ 
          width: '37.5%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: 'var(--bg-white)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px var(--shadow-md)',
            border: '1px solid var(--border-light)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
                               <h2 style={{
                   fontSize: '1.25rem',
                   fontWeight: '600',
                   color: 'var(--text-primary)',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem'
                 }}>
                   📋 할일 목록 (TodoList)
                 </h2>
              <button
                onClick={() => {
                  setEditingTodoList(null);
                  setShowTodoListModal(true);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Plus className="w-4 h-4" />
                목록 추가
              </button>
            </div>
            
            {todoLists.length === 0 ? (
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
                <div style={{ fontSize: '3rem' }}>📋</div>
                                   <p style={{ fontSize: '1.1rem' }}>등록된 할일 목록 (TodoList)이 없습니다.</p>
                   <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>새로운 할일 목록 (TodoList)을 만들어보세요!</p>
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
                {todoLists.map((todoList) => (
                  <div
                    key={todoList.id}
                    style={{
                      background: selectedTodoList?.id === todoList.id ? 'var(--primary-light)' : 'var(--bg-main)',
                      borderRadius: '8px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: selectedTodoList?.id === todoList.id 
                        ? '2px solid var(--primary-color)' 
                        : '1px solid var(--border-light)',
                      minHeight: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onClick={() => handleSelectTodoList(todoList)}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontWeight: '600',
                        fontSize: '1rem',
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        📋 {todoList.name}
                      </h3>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {todoList.description || '설명이 없습니다.'}
                      </p>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      marginLeft: '1rem'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTodoList(todoList);
                        }}
                        style={{
                          padding: '0.25rem',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-light)',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTodoList(todoList.id);
                        }}
                        style={{
                          padding: '0.25rem',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-light)',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

                 {/* 오른쪽: 선택된 TodoList의 할일들 */}
         <div style={{ 
           width: '37.5%',
           height: '100%',
           display: 'flex',
           flexDirection: 'column'
         }}>
          {!selectedTodoList ? (
            // TodoList가 선택되지 않았을 때
            <div style={{
              background: 'var(--bg-white)',
              borderRadius: '12px',
              padding: '3rem',
              boxShadow: '0 4px 12px var(--shadow-md)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed var(--border-medium)'
            }}>
              <div style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📋</div>
                                 <h3 style={{ 
                   fontSize: '1.25rem', 
                   fontWeight: '600', 
                   marginBottom: '0.5rem',
                   color: 'var(--text-secondary)'
                 }}>
                   할일 목록 (TodoList)을 선택해주세요
                 </h3>
                                   <p style={{ fontSize: '1rem' }}>
                     중간에서 할일 목록 (TodoList)을 선택하면<br />할일 (Todo)들을 관리할 수 있습니다.
                   </p>
              </div>  
            </div>
                     ) : (
             // TodoList는 선택했지만 특정 할일은 선택하지 않았을 때 - 개인 투두리스트와 동일한 레이아웃
               <div style={{
                 background: 'var(--bg-white)',
                 borderRadius: '12px',
                 padding: '1.5rem',
                 boxShadow: '0 4px 12px var(--shadow-md)',
                 border: '1px solid var(--border-light)',
                 height: '100%',
                 display: 'flex',
                 flexDirection: 'column',
                 overflow: 'hidden'
               }}>
              {/* TodoList 정보 헤더 */}
              <div style={{
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-light)'
              }}>
                                 <h1 style={{ 
                   fontSize: '1.75rem', 
                   fontWeight: '700', 
                   color: 'var(--text-primary)', 
                   marginBottom: '0.5rem' 
                 }}>
                   📝 {selectedTodoList.name}
                 </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem' }}>
                  {selectedTodoList.description || '설명이 없습니다.'}
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary-color)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    총 {todos.length}개
                  </span>
                  <span style={{
                    background: '#f0fdf4',
                    color: '#16a34a',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    완료 {todos.filter(t => t.completed).length}개
                  </span>
                  <span style={{
                    background: '#fefce8',
                    color: '#eab308',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    진행중 {todos.filter(t => !t.completed).length}개
                  </span>
                </div>
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-light)',
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <span>생성일: {formatDate(selectedTodoList.createDate)}</span>
                  <span>수정일: {formatDate(selectedTodoList.modifyDate)}</span>
                </div>
              </div>

              {/* 할일 목록 */}
              <div style={{
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
                   📝 할 일 목록 (Todo)
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
                    <p style={{ fontSize: '1.1rem' }}>등록된 할일 (Todo)이 없습니다.</p>
                  </div>
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.75rem',
                    flex: 1,
                    overflowY: 'auto',
                    paddingRight: '0.5rem',
                    paddingTop: '0.5rem',
                    maxHeight: '100%'
                  }}>
                    {todos.map((todo) => (
                      <div
                        key={todo.id}
                        style={{
                          background: (selectedTodo && (selectedTodo as Todo).id === todo.id) ? 'var(--primary-light)' : 'var(--bg-main)',
                          borderRadius: '8px',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          borderLeft: `4px solid ${
                            todo.priority === 1 ? '#dc2626' : 
                            todo.priority === 2 ? '#eab308' : 
                            '#2563eb'
                          }`,
                          border: (selectedTodo && (selectedTodo as Todo).id === todo.id) 
                            ? '2px solid var(--primary-color)' 
                            : '1px solid var(--border-light)',
                          minHeight: '120px',
                          maxHeight: '120px',
                          overflow: 'hidden',
                          width: '100%'
                        }}
                        onClick={() => handleSelectTodo(todo)}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleTodoComplete(todo.id);
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
                              whiteSpace: 'nowrap',
                              maxWidth: '100%'
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
                              height: '2.4em',
                              maxHeight: '2.4em'
                            }}>
                              {todo.description || '설명이 없습니다.'}
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
                                background: todo.priority === 1 ? '#fef2f2' : 
                                          todo.priority === 2 ? '#fefce8' : '#eff6ff',
                                color: todo.priority === 1 ? '#dc2626' : 
                                       todo.priority === 2 ? '#eab308' : '#2563eb'
                              }}>
                                {getPriorityString(todo.priority)}
                              </span>
                              <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-light)',
                                fontWeight: '500'
                              }}>
                                📅 {formatDate(todo.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                                 {/* 할일 추가 버튼 */}
                 <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                   <button
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       setEditingTodo(null);
                       setShowTodoModal(true);
                     }}
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
            </div>
          )}
        </div>

        {/* 맨 오른쪽: 선택된 할일 상세 정보 */}
        <div style={{ 
          width: '37.5%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {!selectedTodo ? (
            // 할일이 선택되지 않았을 때
            <div style={{
              background: 'var(--bg-white)',
              borderRadius: '12px',
              padding: '3rem',
              boxShadow: '0 4px 12px var(--shadow-md)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed var(--border-medium)'
            }}>
              <div style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📝</div>
                                 <h3 style={{ 
                   fontSize: '1.25rem', 
                   fontWeight: '600', 
                   marginBottom: '0.5rem',
                   color: 'var(--text-secondary)'
                 }}>
                   할일 (Todo)을 선택해주세요
                 </h3>
                                   <p style={{ fontSize: '1rem' }}>
                     오른쪽에서 할일 (Todo)을 클릭하면<br />상세 정보가 표시됩니다.
                   </p>
              </div>  
            </div>
          ) : (
            // 선택된 할일 상세 정보
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
                    checked={selectedTodo.completed}
                    onChange={() => handleToggleTodoComplete(selectedTodo.id)}
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
                      color: selectedTodo.completed ? 'var(--text-light)' : 'var(--text-primary)',
                      textDecoration: selectedTodo.completed ? 'line-through' : 'none',
                      lineHeight: '1.3',
                      wordBreak: 'break-word'
                    }}>
                      {selectedTodo.title}
                    </h2>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginLeft: '1rem' }}>
                  <button
                    onClick={() => handleEditTodo(selectedTodo)}
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
                    onClick={() => handleDeleteTodo(selectedTodo.id)}
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
                    {selectedTodo.description || '설명이 없습니다.'}
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
                      background: selectedTodo.priority === 1 ? '#fef2f2' : 
                                selectedTodo.priority === 2 ? '#fefce8' : '#eff6ff',
                      color: selectedTodo.priority === 1 ? '#dc2626' : 
                             selectedTodo.priority === 2 ? '#eab308' : '#2563eb'
                    }}>
                      {getPriorityString(selectedTodo.priority)}
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
                      background: selectedTodo.completed ? '#f0fdf4' : '#fefce8',
                      color: selectedTodo.completed ? '#16a34a' : '#eab308'
                    }}>
                      {selectedTodo.completed ? '✅ 완료' : '⏳ 진행중'}
=======
        {/* 중앙 패널 - 할일 목록 관리 */}
        <div className="w-1/3 p-8 border-r border-gray-200 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                할일 목록 관리
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                팀의 할일 목록들을 관리합니다.
              </p>
            </div>
            <button
              onClick={() => setShowTodoListModal(true)}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              목록 추가
            </button>
          </div>

          <div className="space-y-3">
            {todoLists.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-sm mb-2">아직 할일 목록이 없습니다.</div>
                <p className="text-gray-400 text-xs">목록 추가 버튼을 눌러서 첫 번째 할일 목록을 만들어보세요!</p>
              </div>
            ) : (
              todoLists.map((todoList) => (
                <div key={todoList.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{todoList.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {todoList.todos?.length || 0}개 할일
                      </span>
                      <button
                        onClick={() => handleSelectTodoList(todoList)}
                        className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200"
                      >
                        선택
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{todoList.description}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditTodoList(todoList)}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteTodoList(todoList.id)}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 오른쪽 패널 - 선택된 할일 목록의 할일들 */}
        <div className="w-1/3 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedTodoList ? selectedTodoList.name : '할일 목록 선택'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedTodoList ? `${selectedTodoList.todos?.length || 0}개의 할일이 있습니다.` : '왼쪽에서 할일 목록을 선택해주세요.'}
              </p>
            </div>
            {selectedTodoList && (
              <button
                onClick={() => setShowTodoModal(true)}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                할일 추가
              </button>
            )}
          </div>

          <div className="space-y-3">
            {!selectedTodoList ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-sm mb-2">할일 목록을 선택해주세요</div>
                <p className="text-gray-400 text-xs">중앙 패널에서 할일 목록을 선택하면 할일들을 볼 수 있습니다.</p>
              </div>
            ) : selectedTodoList.todos?.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-sm mb-2">아직 할일이 없습니다.</div>
                <p className="text-gray-400 text-xs">할일 추가 버튼을 눌러서 첫 번째 할일을 만들어보세요!</p>
              </div>
            ) : (
                             selectedTodoList.todos?.map((todo: any) => (
                <div key={todo.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.isCompleted}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      readOnly
                    />
                    <div>
                      <div className={`font-semibold text-sm ${todo.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {todo.title}
                      </div>
                      {todo.description && (
                        <div className="text-xs text-gray-500 mt-1">{todo.description}</div>
                      )}
                      {todo.dueDate && (
                        <div className="text-xs text-gray-400 mt-1">
                          마감일: {formatDate(todo.dueDate)}
                        </div>
                      )}
                      {todo.assignedMemberId && (
                        <div className="text-xs text-blue-600 mt-1">
                          담당: {team?.members.find(m => m.userId === todo.assignedMemberId)?.userNickname || '알 수 없음'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-1 py-0.5 text-xs rounded-full ${
                      todo.priority === 1 ? 'bg-red-100 text-red-800' :
                      todo.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {todo.priority === 1 ? '높음' : todo.priority === 2 ? '보통' : '낮음'}
                    </span>
                    <span className={`px-1 py-0.5 text-xs rounded-full ${
                      todo.type === 'personal' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {todo.type === 'personal' ? '개인' : '팀'}
>>>>>>> 9b69a65 (backup(fe): 팀 투두 서비스 철폐)
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
                      {formatDate(selectedTodo.createdAt)}
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
                      {formatDate(selectedTodo.updatedAt)}
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
                      📅 마감기한
                    </label>
                    <div style={{ 
                      color: selectedTodo.dueDate ? 'var(--text-primary)' : 'var(--text-light)', 
                      fontSize: '0.9rem',
                      background: 'var(--bg-main)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      fontStyle: selectedTodo.dueDate ? 'normal' : 'italic'
                    }}>
                      {selectedTodo.dueDate ? formatDate(selectedTodo.dueDate) : '설정되지 않음'}
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
                      👤 담당자
                    </label>
                    <div style={{ 
                      color: selectedTodo.assignedMemberId ? 'var(--text-primary)' : 'var(--text-light)', 
                      fontSize: '0.9rem',
                      background: 'var(--bg-main)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      fontStyle: selectedTodo.assignedMemberId ? 'normal' : 'italic'
                    }}>
                      {selectedTodo.assignedMemberId ? 
                        team?.members.find(m => m.userId === (selectedTodo.assignedMemberId as number))?.userNickname || '담당자' : 
                        '지정되지 않음'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 할일 목록 생성/수정 모달 */}
      {showTodoListModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-white)',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '500px',
            margin: '0 1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem',
              borderBottom: '1px solid var(--border-light)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                {editingTodoList ? '할일 목록 수정' : '새 할일 목록 만들기'}
              </h3>
              <button
                onClick={() => {
                  setShowTodoListModal(false);
                  setEditingTodoList(null);
                  setNewTodoList({ name: '', description: '' });
                }}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingTodoList ? handleUpdateTodoList : handleCreateTodoList}>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem'
                  }}>
                    목록 이름 *
                  </label>
<<<<<<< HEAD
                  <input
                    type="text"
                    value={editingTodoList ? editingTodoList.name : newTodoList.name}
                    onChange={(e) => {
                      if (editingTodoList) {
                        setEditingTodoList({ ...editingTodoList, name: e.target.value });
                      } else {
                        setNewTodoList({ ...newTodoList, name: e.target.value });
                      }
                    }}
                    placeholder="할일 목록 이름을 입력하세요"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
=======
                  <select
                    value={todoForm.assignedMemberId}
                    onChange={(e) => setTodoForm(prev => ({ ...prev, assignedMemberId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">담당자 선택 (필수)</option>
                    {team?.members.map((member) => (
                      <option key={member.id} value={member.userId.toString()}>
                        {member.userNickname} ({member.role === 'LEADER' ? '리더' : '멤버'})
                      </option>
                    ))}
                  </select>
>>>>>>> d0cddd5 (팀 투두리스트, 팀 투두 엔티티 및 관련 서비스 만들어서 백업)
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem'
                  }}>
                    설명
                  </label>
                  <textarea
                    value={editingTodoList ? editingTodoList.description : newTodoList.description}
                    onChange={(e) => {
                      if (editingTodoList) {
                        setEditingTodoList({ ...editingTodoList, description: e.target.value });
                      } else {
                        setNewTodoList({ ...newTodoList, description: e.target.value });
                      }
                    }}
                    placeholder="할일 목록에 대한 설명을 입력하세요"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                padding: '1.5rem',
                borderTop: '1px solid var(--border-light)',
                background: 'var(--bg-main)',
                borderRadius: '0 0 12px 12px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowTodoListModal(false);
                    setEditingTodoList(null);
                    setNewTodoList({ name: '', description: '' });
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-white)',
                    color: 'var(--text-secondary)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{
                    padding: '0.5rem 1.5rem',
                    border: 'none',
                    background: 'var(--primary-color)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {editingTodoList ? '수정' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 할일 생성/수정 모달 */}
      {showTodoModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-white)',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '500px',
            margin: '0 1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem',
              borderBottom: '1px solid var(--border-light)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                {editingTodo ? '할일 수정' : '새 할일 만들기'}
              </h3>
              <button
                onClick={() => {
                  setShowTodoModal(false);
                  setEditingTodo(null);
                  setNewTodo({ title: '', description: '', priority: 2, assignedMemberId: null, dueDate: '' });
                }}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingTodo ? handleUpdateTodo : handleAddTodo}>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem'
                  }}>
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={editingTodo ? editingTodo.title : newTodo.title}
                    onChange={(e) => {
                      if (editingTodo) {
                        setEditingTodo({ ...editingTodo, title: e.target.value });
                      } else {
                        setNewTodo({ ...newTodo, title: e.target.value });
                      }
                    }}
                    placeholder="할일 제목을 입력하세요"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem'
                  }}>
                    설명
                  </label>
                  <textarea
                    value={editingTodo ? editingTodo.description : newTodo.description}
                    onChange={(e) => {
                      if (editingTodo) {
                        setEditingTodo({ ...editingTodo, description: e.target.value });
                      } else {
                        setNewTodo({ ...newTodo, description: e.target.value });
                      }
                    }}
                    placeholder="할일에 대한 설명을 입력하세요"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem'
                  }}>
                    우선순위
                  </label>
                  <select
                    value={editingTodo ? editingTodo.priority : newTodo.priority}
                    onChange={(e) => {
                      const priority = parseInt(e.target.value);
                      if (editingTodo) {
                        setEditingTodo({ ...editingTodo, priority });
                      } else {
                        setNewTodo({ ...newTodo, priority });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      background: 'white'
                    }}
                  >
                    <option value={1}>높음</option>
                    <option value={2}>보통</option>
                    <option value={3}>낮음</option>
                  </select>
                </div>
                
                {/* 담당멤버 선택 */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem'
                  }}>
                    담당멤버
                  </label>
                  <select
                    value={editingTodo ? editingTodo.assignedMemberId || '' : newTodo.assignedMemberId || ''}
                    onChange={(e) => {
                      const assignedMemberId = e.target.value ? parseInt(e.target.value) : null;
                      if (editingTodo) {
                        setEditingTodo({ ...editingTodo, assignedMemberId: assignedMemberId as number | null });
                      } else {
                        setNewTodo({ ...newTodo, assignedMemberId: assignedMemberId as number | null });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      background: 'white'
                    }}
                  >
                    <option value="">담당자 선택</option>
                    {team?.members.map((member) => (
                      <option key={member.id} value={member.userId}>
                        {member.userNickname} ({member.userEmail})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 마감기한 선택 */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem'
                  }}>
                    마감기한
                  </label>
                  <input
                    type="datetime-local"
                    value={editingTodo ? editingTodo.dueDate || '' : newTodo.dueDate || ''}
                    onChange={(e) => {
                      if (editingTodo) {
                        setEditingTodo({ ...editingTodo, dueDate: e.target.value });
                      } else {
                        setNewTodo({ ...newTodo, dueDate: e.target.value });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                padding: '1.5rem',
                borderTop: '1px solid var(--border-light)',
                background: 'var(--bg-main)',
                borderRadius: '0 0 12px 12px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowTodoModal(false);
                    setEditingTodo(null);
                    setNewTodo({ title: '', description: '', priority: 2, assignedMemberId: null, dueDate: '' });
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-white)',
                    color: 'var(--text-secondary)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{
                    padding: '0.5rem 1.5rem',
                    border: 'none',
                    background: 'var(--primary-color)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {editingTodo ? '수정' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </TodoListTemplate>
  );
};

export default TeamDetailPage;