'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TodoListTemplate from '../../_components/TodoList/TodoListTemplate';

interface TeamMemberResponseDto {
  id: number;
  userId: number;
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

const TeamDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const teamId = Number(params.id);

  const [team, setTeam] = useState<TeamResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todos, setTodos] = useState<any[]>([]);

  // 모달 상태
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);

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

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // 실제 토스트 메시지 표시
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 3초 후 자동 제거
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
    
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // 모달 내부 경고 메시지 상태
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchTeamData = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('접근 권한이 없습니다. 이 팀의 멤버가 아닙니다.');
          return;
        }
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('팀 정보를 가져올 수 없습니다.');
      }

      const result = await response.json();
      
      if (result.resultCode === '200-OK') {
        console.log('백엔드 응답:', result);
        setTeam(result.data);
        console.log('팀 데이터 설정 완료');
      } else {
        throw new Error(result.msg || '팀 정보를 가져올 수 없습니다.');
      }
    } catch (err) {
      console.error('팀 데이터 가져오기 실패:', err);
      setError(err instanceof Error ? err.message : '팀 정보를 가져올 수 없습니다.');
    }
  }, [teamId, router]);

  const fetchTodos = useCallback(async () => {
    try {
      // 팀 도메인의 할일 API 사용
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/todos`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('인증 실패, 할일 목록을 가져올 수 없습니다.');
          setTodos([]);
          return;
        }
        if (response.status === 403) {
          console.log('권한 없음, 할일 목록을 가져올 수 없습니다.');
          setTodos([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.resultCode === '200-OK') {
        setTodos(result.data);
      } else {
        throw new Error(result.msg || '할일 목록을 가져올 수 없습니다.');
      }
    } catch (err) {
      console.error('할일 목록 가져오기 실패:', err);
      // 에러가 발생해도 할일 목록은 빈 배열로 설정
      setTodos([]);
    }
  }, [teamId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTeamData(),
        fetchTodos()
      ]);
      setLoading(false);
    };

    if (teamId) {
      loadData();
    }
  }, [teamId, fetchTeamData, fetchTodos]);

  const handleGoBack = () => {
    router.push('/teams');
  };

  const handleEditTeam = async () => {
    if (!editForm.teamName.trim()) {
      showToast('팀 이름을 입력해주세요.', 'error');
      return;
    }

    setActionLoading(prev => ({ ...prev, editTeam: true }));

    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: editForm.teamName,
          description: editForm.description
        })
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('팀 정보를 수정할 권한이 없습니다.');
        }
        if (response.status === 404) {
          throw new Error('팀을 찾을 수 없습니다.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.resultCode === '200-OK') {
        setTeam(prev => prev ? {
          ...prev,
          teamName: editForm.teamName,
          description: editForm.description
        } : prev);
        setShowEditModal(false);
        showToast('팀 정보가 수정되었습니다.', 'success');
      } else {
        throw new Error(result.msg || '팀 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('팀 수정 실패:', err);
      showToast(err instanceof Error ? err.message : '팀 수정에 실패했습니다.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, editTeam: false }));
    }
  };

  const handleInviteMember = async () => {
    if (!memberForm.email.trim()) {
      showToast('이메일을 입력해주세요.', 'error');
      return;
    }

    setActionLoading(prev => ({ ...prev, inviteMember: true }));

    try {
      // 임시: 백엔드에 사용자 조회 API가 없으므로 테스트 데이터 사용
      const testUserId = Date.now();
      const testUserNickname = memberForm.email.split('@')[0];

      // 2. 팀 멤버 추가
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/members`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: testUserId,
          role: memberForm.role
        })
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('팀 멤버를 추가할 권한이 없습니다.');
        }
        if (response.status === 404) {
          throw new Error('팀을 찾을 수 없습니다.');
        }
        if (response.status === 409) {
          throw new Error('이미 해당 팀의 멤버입니다.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.resultCode === '200-OK') {
        const newMember: TeamMemberResponseDto = {
          id: result.data.id,
          userId: testUserId,
          userNickname: testUserNickname,
          teamId: teamId,
          role: memberForm.role,
          joinedAt: result.data.joinedAt,
          createDate: result.data.createDate,
          modifyDate: result.data.modifyDate
        };

        setTeam(prev => prev ? {
          ...prev,
          members: [...prev.members, newMember]
        } : prev);
        setMemberForm({ email: '', role: 'MEMBER' });
        setShowMemberModal(false);
        showToast('멤버가 성공적으로 초대되었습니다.', 'success');
      } else {
        throw new Error(result.msg || '멤버 초대에 실패했습니다.');
      }
    } catch (err) {
      console.error('멤버 초대 실패:', err);
      showToast(err instanceof Error ? err.message : '멤버 초대에 실패했습니다.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, inviteMember: false }));
    }
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
      return;
    }

    // 팀 할일인 경우 담당 멤버 선택 필수
    if (teamId !== 0 && !todoForm.assignedMemberId) {
      console.log('담당 멤버가 선택되지 않음');
      console.log('teamId !== 0:', teamId !== 0);
      console.log('!todoForm.assignedMemberId:', !todoForm.assignedMemberId);
      setModalError('담당 멤버를 선택해주세요.');
      return;
    }

    console.log('검증 통과, API 요청 시작');
    setActionLoading(prev => ({ ...prev, addTodo: true }));

    try {
      // 팀 도메인의 할일 추가 API 사용
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/todos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: todoForm.title,
          description: todoForm.description,
          priority: 1, // 기본 우선순위
          dueDate: todoForm.dueDate ? new Date(todoForm.dueDate).toISOString() : null,
          assignedMemberId: todoForm.assignedMemberId || null
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setModalError('인증이 필요합니다. 다시 로그인해주세요.');
          return;
        }
        if (response.status === 403) {
          setModalError('팀에 할일을 추가할 권한이 없습니다.');
          return;
        }
        setModalError(`서버 오류가 발생했습니다. (${response.status})`);
        return;
      }

      const result = await response.json();

      if (result.resultCode === '200-OK') {
        showToast('할일이 성공적으로 추가되었습니다.', 'success');
        setTodoForm({ title: '', description: '', dueDate: '', assignedMemberId: '' });
        setShowTodoModal(false);
        setModalError(null);
        
        // 할일 목록 새로고침
        await fetchTodos();
      } else {
        setModalError(result.msg || '할일 추가에 실패했습니다.');
      }
    } catch (err) {
      console.error('할일 추가 실패:', err);
      setModalError(err instanceof Error ? err.message : '할일 추가에 실패했습니다.');
    } finally {
      setActionLoading(prev => ({ ...prev, addTodo: false }));
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <TodoListTemplate>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">팀 정보를 불러오는 중...</p>
          </div>
        </div>
      </TodoListTemplate>
    );
  }

  if (error) {
    return (
      <TodoListTemplate>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
            <button
              onClick={handleGoBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              팀 목록으로 돌아가기
            </button>
          </div>
        </div>
      </TodoListTemplate>
    );
  }

  if (!team) {
    return (
      <TodoListTemplate>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-gray-600 text-xl mb-4">팀을 찾을 수 없습니다.</div>
            <button
              onClick={handleGoBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              팀 목록으로 돌아가기
            </button>
          </div>
        </div>
      </TodoListTemplate>
    );
  }

  return (
    <TodoListTemplate>
      <div className="flex h-full">
        {/* 왼쪽 패널 - 팀 정보 및 멤버 */}
        <div className="w-1/2 p-12 border-r border-gray-200 overflow-y-auto">
          {/* 팀 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{team.teamName}</h1>
                <p className="text-xl text-gray-600">{team.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditForm({ teamName: team.teamName, description: team.description });
                    setShowEditModal(true);
                  }}
                  className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg"
                >
                  팀 수정
                </button>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg"
                >
                  멤버 초대
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-lg text-gray-500">
              <span>생성일: {formatDate(team.createDate)}</span>
              <span>멤버: {team.members.length}명</span>
            </div>
          </div>

          {/* 멤버 목록 */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">팀 멤버</h2>
            <div className="space-y-4">
              {team.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {member.userNickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{member.userNickname}</div>
                      <div className="text-sm text-gray-500">
                        {member.role === 'LEADER' ? '리더' : '멤버'} • {formatDate(member.joinedAt)} 가입
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽 패널 - 할일 목록 */}
        <div className="w-1/2 p-12 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900">
                {teamId === 0 ? '개인 할일 목록' : '팀 할일 목록'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {teamId === 0 ? '개인적으로 관리하는 할일들입니다.' : '팀원들과 함께 관리하는 할일들입니다.'}
              </p>
            </div>
            <button
              onClick={() => setShowTodoModal(true)}
              className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              할일 추가
            </button>
          </div>

          <div className="space-y-4">
            {todos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">아직 할일이 없습니다.</div>
                <p className="text-gray-400">할일 추가 버튼을 눌러서 첫 번째 할일을 만들어보세요!</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div key={todo.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={todo.isCompleted}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      readOnly
                    />
                    <div>
                      <div className={`font-semibold text-lg ${todo.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {todo.title}
                      </div>
                      {todo.description && (
                        <div className="text-sm text-gray-500 mt-1">{todo.description}</div>
                      )}
                      {todo.dueDate && (
                        <div className="text-xs text-gray-400 mt-1">
                          마감일: {formatDate(todo.dueDate)}
                        </div>
                      )}
                      {teamId !== 0 && todo.assignedMemberId && (
                        <div className="text-xs text-blue-600 mt-1">
                          담당: {team?.members.find(m => m.userId === todo.assignedMemberId)?.userNickname || '알 수 없음'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      todo.priority === 1 ? 'bg-red-100 text-red-800' :
                      todo.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {todo.priority === 1 ? '높음' : todo.priority === 2 ? '보통' : '낮음'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      todo.type === 'personal' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {todo.type === 'personal' ? '개인' : '팀'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 팀 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 className="text-2xl font-semibold mb-6">팀 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">팀 이름</label>
                <input
                  type="text"
                  value={editForm.teamName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, teamName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="팀 이름을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="팀 설명을 입력하세요"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleEditTeam}
                disabled={actionLoading.editTeam}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading.editTeam ? '수정 중...' : '수정'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 초대 모달 */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 className="text-2xl font-semibold mb-6">멤버 초대</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="초대할 멤버의 이메일을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">권한 설정</label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, role: e.target.value as 'LEADER' | 'MEMBER' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MEMBER">일반 멤버</option>
                  <option value="LEADER">리더</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMemberModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleInviteMember}
                disabled={actionLoading.inviteMember}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading.inviteMember ? '초대 중...' : '초대'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 할일 추가 모달 */}
      {showTodoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 className="text-2xl font-semibold mb-6">
              {teamId === 0 ? '개인 할일 추가' : '팀 할일 추가'}
            </h3>
            
            {/* 경고 메시지 표시 */}
            {modalError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{modalError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">할일 제목</label>
                <input
                  type="text"
                  value={todoForm.title}
                  onChange={(e) => setTodoForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="할일 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                <textarea
                  value={todoForm.description}
                  onChange={(e) => setTodoForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="할일 설명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">마감일</label>
                <input
                  type="date"
                  value={todoForm.dueDate}
                  onChange={(e) => setTodoForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {teamId !== 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담당 멤버 <span className="text-red-500">*</span>
                  </label>
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
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowTodoModal(false);
                  setModalError(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddTodo}
                disabled={actionLoading.addTodo}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading.addTodo ? '추가 중...' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </TodoListTemplate>
  );
};

export default TeamDetailPage; 