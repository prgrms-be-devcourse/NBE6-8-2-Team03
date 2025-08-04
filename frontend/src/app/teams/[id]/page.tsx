'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Users, Settings, UserPlus, Crown, User, Calendar, Clock, 
  Edit3, Trash2, ArrowLeft, Plus, Search, X, MoreVertical,
  CheckCircle, Circle, AlertCircle, Flag, List, Tag, Filter,
  ExternalLink, UserMinus, Star, Bell, BellOff, Hash, Edit, Archive
} from 'lucide-react';
import TodoListTemplate from '../../_components/TodoList/TodoListTemplate';
// import { useToast } from '../../_hooks/useToast';
// import { useAuth } from '../../_hooks/useAuth';
// import { LabelManager } from '../../_components/labels/LabelManager';

// 백엔드 API 응답 구조에 맞는 인터페이스
interface TeamMemberResponseDto {
  id: number;
  userId: number;
  userNickname: string;
  userAvatar?: string;
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

interface TodoResponseDto {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: number;
  startDate: string;
  dueDate: string;
  todoList: number;
  createdAt: string;
  updatedAt: string;
}

// 프론트엔드에서 사용할 팀 인터페이스 (백엔드 데이터를 변환)
interface Team {
  id: number;
  teamName: string;
  description: string;
  createDate: string;
  modifyDate: string;
  isStarred: boolean; // 프론트엔드에서만 사용
  members: TeamMemberResponseDto[];
  labels: Label[];
  settings: {
    isPublic: boolean;
    allowMemberInvite: boolean;
    notificationsEnabled: boolean;
  };
}

// 라벨 인터페이스 (백엔드에서 제공하지 않으므로 프론트엔드에서만 사용)
interface Label {
  id: number;
  name: string;
  color: string;
  teamId: number;
  createdBy: number;
  createdAt: string;
}

// 투두 관련 인터페이스 (백엔드에서 제공하지 않으므로 프론트엔드에서만 사용)
interface TeamTodo {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: 1 | 2 | 3; // 1: Low, 2: Medium, 3: High
  startDate: string;
  dueDate: string;
  assignedUser?: TeamMemberResponseDto;
  createdBy: TeamMemberResponseDto;
  labels: Label[];
  comments: Comment[];
  subtasks: Subtask[];
  estimatedHours?: number;
  actualHours?: number;
  todoList: number; // 투두리스트 ID 추가
}

interface Comment {
  id: number;
  content: string;
  author: TeamMemberResponseDto;
  createdAt: string;
  updatedAt?: string;
}

interface Subtask {
  id: number;
  title: string;
  isCompleted: boolean;
  createdBy: TeamMemberResponseDto;
}

interface TeamTodoList {
  id: number;
  name: string;
  description: string;
  color: string;
  todos: TeamTodo[];
  labels: Label[]; // 라벨 추가
  createdBy: TeamMemberResponseDto;
  createdAt: string;
  isArchived: boolean;
}

interface ApiResponse<T> {
  resultCode: string;
  msg: string;
  data: T;
}

type FilterType = 'all' | 'my' | 'completed' | 'pending' | 'overdue';
type SortType = 'dueDate' | 'priority' | 'created' | 'updated' | 'title';

const TeamDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const teamId = parseInt(params?.id as string);
  // const { showToast } = useToast();
  // const { currentUser } = useAuth();
  
  // 임시 Toast 함수 (useCallback으로 감싸기)
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    alert(`${type.toUpperCase()}: ${message}`);
  }, []);
  
  // 임시 현재 사용자
  const currentUser = { id: 1, nickname: '김개발' };

  // 상태 관리
  const [team, setTeam] = useState<Team | null>(null);
  const [todoLists, setTodoLists] = useState<TeamTodoList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 활성 탭
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'todos' | 'labels'>('overview');
  
  // 모달 상태
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTodoListModal, setShowTodoListModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TeamTodo | null>(null);
  
  // 폼 상태
  const [editForm, setEditForm] = useState({ teamName: '', description: '' });
  const [memberForm, setMemberForm] = useState({ 
    email: '', 
    role: 'MEMBER' as 'LEADER' | 'MEMBER',
    message: ''
  });
  const [todoListForm, setTodoListForm] = useState({ 
    name: '', 
    description: '', 
    color: '#3B82F6',
    selectedLabels: [] as number[]
  });
  const [todoForm, setTodoForm] = useState({
    title: '',
    description: '',
    priority: 2 as 1 | 2 | 3,
    todoListId: 0,
    assignedUserId: 0,
    dueDate: '',
    estimatedHours: 0,
    labelIds: [] as number[]
  });

  // 검색 및 필터 상태
  const [memberSearch, setMemberSearch] = useState('');
  const [todoFilter, setTodoFilter] = useState<FilterType>('all');
  const [todoSort, setTodoSort] = useState<SortType>('dueDate');
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [searchTodo, setSearchTodo] = useState('');

  // 로딩 상태
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  // 라벨 관련 상태
  const [labels, setLabels] = useState<Label[]>([]);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelForm, setLabelForm] = useState({ 
    name: '', 
    color: '#3B82F6' 
  });

  // 투두리스트 드롭다운 메뉴 상태
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  
  // 아카이브된 투두리스트 표시 여부
  const [showArchived, setShowArchived] = useState(false);
  
  // 편집 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTodoListId, setEditingTodoListId] = useState<number | null>(null);

  // 할일 상세 정보 모달 상태
  const [showTodoDetailModal, setShowTodoDetailModal] = useState(false);

  // 할일 추가 모달 상태
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [selectedTodoListForAdd, setSelectedTodoListForAdd] = useState<number | null>(null);


  // 백엔드 API 응답을 프론트엔드 형식으로 변환
  const convertBackendTeamToFrontend = (backendTeam: TeamResponseDto): Team => {
    return {
      id: backendTeam.id,
      teamName: backendTeam.teamName,
      description: backendTeam.description || '',
      createDate: backendTeam.createDate,
      modifyDate: backendTeam.modifyDate,
      isStarred: false, // 백엔드에서 즐겨찾기 기능이 없으므로 기본값
      members: backendTeam.members,
      labels: [], // 빈 배열로 초기화 (라벨은 별도로 로드)
      settings: {
        isPublic: true, // 백엔드에서 제공하지 않으므로 기본값
        allowMemberInvite: true,
        notificationsEnabled: true
      }
    };
  };

  // 팀 데이터 불러오기
  const fetchTeamData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 테스트용 쿠키 설정 (실제 프로덕션에서는 제거)
      document.cookie = 'accessToken=test-token; path=/; domain=localhost';

      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        // 401 에러인 경우 테스트 데이터 반환
        if (response.status === 401) {
          console.log('인증 실패, 테스트 데이터 사용');
          const testTeam: Team = {
            id: teamId,
            teamName: '프론트엔드 개발팀',
            description: 'React, Next.js를 활용한 웹 프론트엔드 개발팀',
            createDate: '2024-12-15T09:00:00',
            modifyDate: '2024-12-20T14:30:00',
            isStarred: true,
            members: [
              { id: 1, userId: 1, userNickname: '김개발', teamId: teamId, role: 'LEADER', joinedAt: '2024-12-15T09:00:00', createDate: '2024-12-15T09:00:00', modifyDate: '2024-12-15T09:00:00' },
              { id: 2, userId: 2, userNickname: '이코딩', teamId: teamId, role: 'MEMBER', joinedAt: '2024-12-16T10:00:00', createDate: '2024-12-16T10:00:00', modifyDate: '2024-12-16T10:00:00' }
            ],
            labels: [],
            settings: {
              isPublic: true,
              allowMemberInvite: true,
              notificationsEnabled: true
            }
          };
          setTeam(testTeam);
          setEditForm({
            teamName: testTeam.teamName,
            description: testTeam.description
          });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TeamResponseDto> = await response.json();
      
      if (result.resultCode === '200-OK') {
        const convertedTeam = convertBackendTeamToFrontend(result.data);
        setTeam(convertedTeam);
        setEditForm({
          teamName: convertedTeam.teamName,
          description: convertedTeam.description
        });
      } else {
        throw new Error(result.msg || '팀 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('팀 데이터 불러오기 실패:', err);
      setError(err instanceof Error ? err.message : '팀 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  // 권한 확인
  const isLeader = useCallback(() => {
    return team?.members.find(m => m.userId === currentUser?.id)?.role === 'LEADER';
  }, [team, currentUser]);

  const isMember = useCallback(() => {
    return team?.members.some(m => m.userId === currentUser?.id);
  }, [team, currentUser]);

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    if (teamId) {
      fetchTeamData();
      fetchLabels();
    }
  }, [teamId, fetchTeamData]);

  // 투두 토글 (백엔드 API 연동)
  const handleToggleTodo = async (todoId: number, todoListId: number) => {
    const loadingKey = `toggle-${todoId}`;
    setActionLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      // 테스트용 쿠키 설정 (실제 프로덕션에서는 제거)
      document.cookie = 'accessToken=test-token; path=/; domain=localhost';

      const response = await fetch(`http://localhost:8080/api/todo/${todoId}/complete`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // 401 에러인 경우 테스트 모드로 동작
        if (response.status === 401) {
          console.log('인증 실패, 테스트 모드로 할일 상태 변경');
          setTodoLists(prev => prev.map(list => 
            list.id === todoListId 
              ? {
                  ...list,
                  todos: list.todos.map(todo => 
                    todo.id === todoId 
                      ? { ...todo, isCompleted: !todo.isCompleted }
                      : todo
                  )
                }
              : list
          ));
          showToast('할일 상태가 변경되었습니다. (테스트 모드)', 'success');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TodoResponseDto> = await response.json();
      
      if (result.resultCode === '200-OK') {
        // 백엔드 응답으로 상태 업데이트
        setTodoLists(prev => prev.map(list => 
          list.id === todoListId 
            ? {
                ...list,
                todos: list.todos.map(todo => 
                  todo.id === todoId 
                    ? { ...todo, isCompleted: result.data.isCompleted }
                    : todo
                )
              }
            : list
        ));
        showToast('할일 상태가 변경되었습니다.', 'success');
      } else {
        throw new Error(result.msg || '할일 상태 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('할일 상태 변경 실패:', err);
      showToast('할일 상태 변경에 실패했습니다.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // 팀 수정
  const handleEditTeam = async () => {
    if (!editForm.teamName.trim()) {
      showToast('팀 이름을 입력해주세요.', 'error');
      return;
    }

    setActionLoading(prev => ({ ...prev, editTeam: true }));

    try {
      // 테스트용 쿠키 설정 (실제 프로덕션에서는 제거)
      document.cookie = 'accessToken=test-token; path=/; domain=localhost';

      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: editForm.teamName.trim(),
          description: editForm.description.trim()
        })
      });

      if (!response.ok) {
        // 401 에러인 경우 테스트 모드로 동작
        if (response.status === 401) {
          console.log('인증 실패, 테스트 모드로 팀 수정');
          if (team) {
            const updatedTeam = {
              ...team,
              teamName: editForm.teamName.trim(),
              description: editForm.description.trim(),
              modifyDate: new Date().toISOString()
            };
            setTeam(updatedTeam);
            setShowEditModal(false);
            showToast('팀 정보가 수정되었습니다! (테스트 모드)', 'success');
          }
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TeamResponseDto> = await response.json();

      if (result.resultCode === '200-OK') {
        const convertedTeam = convertBackendTeamToFrontend(result.data);
        setTeam(convertedTeam);
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

  // 멤버 초대
  const handleInviteMember = async () => {
    if (!memberForm.email.trim()) {
      showToast('이메일을 입력해주세요.', 'error');
      return;
    }

    setActionLoading(prev => ({ ...prev, inviteMember: true }));

    try {
      // 1. 이메일로 사용자 찾기
      let userId = 0;
      
      try {
        const userResponse = await fetch(`http://localhost:8080/api/v1/user/find-by-email?email=${encodeURIComponent(memberForm.email.trim())}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (userResponse.ok) {
          const userResult = await userResponse.json();
          if (userResult.resultCode === '200-1') {
            userId = userResult.data.id;
          } else {
            throw new Error(userResult.msg || '사용자를 찾을 수 없습니다.');
          }
        } else {
          // 401 에러인 경우 테스트 모드로 동작
          if (userResponse.status === 401) {
            console.log('인증 실패, 테스트 모드로 사용자 찾기');
            // 테스트용 하드코딩된 사용자 ID 사용 (실제 DB에 있는 사용자만)
            if (memberForm.email.includes('dev@test.com')) {
              userId = 1; // 김개발
            } else if (memberForm.email.includes('coding@test.com')) {
              userId = 2; // 이코딩
            } else if (memberForm.email.includes('server@test.com')) {
              userId = 3; // 박서버
            } else {
              // 실제 DB에 없는 사용자는 에러 처리
              throw new Error('테스트 모드에서는 등록된 사용자만 초대 가능합니다: dev@test.com, coding@test.com, server@test.com');
            }
          } else {
            throw new Error(`사용자 조회 실패: ${userResponse.status}`);
          }
        }
      } catch (userError) {
        console.error('사용자 조회 실패:', userError);
        showToast(userError instanceof Error ? userError.message : '사용자를 찾을 수 없습니다.', 'error');
        return;
      }

      // 2. 팀 멤버 추가
      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/members`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          role: memberForm.role
        })
      });

      if (!response.ok) {
        // 401 에러인 경우 테스트 모드로 동작
        if (response.status === 401) {
          console.log('인증 실패, 테스트 모드로 멤버 초대');
          
          // 테스트 모드에서 실제 사용자 정보 시뮬레이션 (실제 DB에 있는 사용자만)
          const testUserInfo: Record<number, { nickname: string; email: string }> = {
            1: { nickname: '김개발', email: 'dev@test.com' },
            2: { nickname: '이코딩', email: 'coding@test.com' },
            3: { nickname: '박서버', email: 'server@test.com' }
          };
          
          const userInfo = testUserInfo[userId] || { nickname: memberForm.email.split('@')[0], email: memberForm.email };
          
          showToast(`${userInfo.nickname}(${userInfo.email})님이 팀에 초대되었습니다! (테스트 모드)`, 'success');
          setMemberForm({ email: '', role: 'MEMBER', message: '' });
          setShowMemberModal(false);
          return;
        }
        
        // 404 에러인 경우 사용자를 찾을 수 없음
        if (response.status === 404) {
          showToast('해당 이메일의 사용자를 찾을 수 없습니다.', 'error');
          return;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.resultCode === '200-OK') {
        showToast('멤버가 성공적으로 초대되었습니다.', 'success');
        setMemberForm({ email: '', role: 'MEMBER', message: '' });
        setShowMemberModal(false);
        // 팀 정보 새로고침
        fetchTeamData();
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

  // 멤버 제거
  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (!confirm(`${memberName}님을 팀에서 제거하시겠습니까?`)) return;

    setActionLoading(prev => ({ ...prev, [`removeMember-${memberId}`]: true }));

    try {
      // 테스트용 쿠키 설정 (실제 프로덕션에서는 제거)
      document.cookie = 'accessToken=test-token; path=/; domain=localhost';

      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        // 401 에러인 경우 테스트 모드로 동작
        if (response.status === 401) {
          console.log('인증 실패, 테스트 모드로 멤버 제거');
          if (team) {
            setTeam({
              ...team,
              members: team.members.filter(m => m.id !== memberId)
            });
          }
          showToast(`${memberName}님이 팀에서 제거되었습니다! (테스트 모드)`, 'success');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (team) {
        setTeam({
          ...team,
          members: team.members.filter(m => m.id !== memberId)
        });
      }

      showToast(`${memberName}님이 팀에서 제거되었습니다.`, 'success');
    } catch (err) {
      console.error('멤버 제거 실패:', err);
      showToast('멤버 제거에 실패했습니다.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`removeMember-${memberId}`]: false }));
    }
  };

  // 팀 나가기
  const handleLeaveTeam = async () => {
    if (!team) return;

    setActionLoading(prev => ({ ...prev, leaveTeam: true }));

    try {
      // 테스트용 쿠키 설정 (실제 프로덕션에서는 제거)
      document.cookie = 'accessToken=test-token; path=/; domain=localhost';

      const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}/leave`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        // 401 에러인 경우 테스트 모드로 동작
        if (response.status === 401) {
          console.log('인증 실패, 테스트 모드로 팀 나가기');
          showToast('팀에서 나갔습니다! (테스트 모드)', 'success');
          router.push('/teams');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showToast('팀에서 나갔습니다.', 'success');
      router.push('/teams');
    } catch (err) {
      console.error('팀 나가기 실패:', err);
      showToast('팀 나가기에 실패했습니다.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, leaveTeam: false }));
    }
  };

  // 투두리스트 생성
  const handleCreateTodoList = async () => {
    if (!todoListForm.name.trim()) {
      showToast('투두리스트 이름을 입력해주세요.', 'error');
      return;
    }

    setActionLoading(prev => ({ ...prev, createTodoList: true }));

    try {
      // 백엔드에서 투두리스트 API가 없으므로 테스트 모드로만 동작
      console.log('테스트 모드: 투두리스트 생성');
      
      const newTodoList: TeamTodoList = {
        id: Date.now(), // 임시 ID
        name: todoListForm.name.trim(),
        description: todoListForm.description.trim(),
        color: todoListForm.color,
        todos: [
          // 기본 할일 추가
          {
            id: Date.now() + 1,
            title: '샘플 할일 1',
            description: '샘플 할일 설명입니다.',
            isCompleted: false,
            priority: 2,
            startDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
            createdBy: {
              id: 1,
              userId: currentUser.id,
              userNickname: currentUser.nickname,
              teamId: teamId,
              role: 'LEADER',
              joinedAt: new Date().toISOString(),
              createDate: new Date().toISOString(),
              modifyDate: new Date().toISOString()
            },
            labels: [],
            comments: [],
            subtasks: [],
            todoList: Date.now() // 임시 투두리스트 ID
          },
          {
            id: Date.now() + 2,
            title: '샘플 할일 2',
            description: '두 번째 샘플 할일입니다.',
            isCompleted: false,
            priority: 1,
            startDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14일 후
            createdBy: {
              id: 1,
              userId: currentUser.id,
              userNickname: currentUser.nickname,
              teamId: teamId,
              role: 'LEADER',
              joinedAt: new Date().toISOString(),
              createDate: new Date().toISOString(),
              modifyDate: new Date().toISOString()
            },
            labels: [],
            comments: [],
            subtasks: [],
            todoList: Date.now() // 임시 투두리스트 ID
          }
        ],
        labels: labels.filter(label => todoListForm.selectedLabels.includes(label.id)), // 선택된 라벨 포함
        createdBy: {
          id: 1,
          userId: currentUser.id,
          userNickname: currentUser.nickname,
          teamId: teamId,
          role: 'LEADER',
          joinedAt: new Date().toISOString(),
          createDate: new Date().toISOString(),
          modifyDate: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        isArchived: false
      };

      setTodoLists(prev => [...prev, newTodoList]);
      setTodoListForm({ name: '', description: '', color: '#3B82F6', selectedLabels: [] });
      setShowTodoListModal(false);
      setIsEditMode(false);
      setEditingTodoListId(null);
      showToast('투두리스트가 생성되었습니다. (테스트 모드)', 'success');
    } catch (err) {
      console.error('투두리스트 생성 실패:', err);
      showToast('투두리스트 생성에 실패했습니다.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, createTodoList: false }));
    }
  };

  // 투두리스트 수정
  const handleUpdateTodoList = async () => {
    if (!todoListForm.name.trim()) {
      showToast('투두리스트 이름을 입력해주세요.', 'error');
      return;
    }

    if (!editingTodoListId) {
      showToast('편집할 투두리스트를 찾을 수 없습니다.', 'error');
      return;
    }

    setActionLoading(prev => ({ ...prev, updateTodoList: true }));

    try {
      // 백엔드에서 투두리스트 수정 API가 없으므로 테스트 모드로만 동작
      console.log('테스트 모드: 투두리스트 수정');
      
      setTodoLists(prev => prev.map(list => 
        list.id === editingTodoListId 
          ? {
              ...list,
              name: todoListForm.name.trim(),
              description: todoListForm.description.trim(),
              color: todoListForm.color,
              labels: labels.filter(label => todoListForm.selectedLabels.includes(label.id))
            }
          : list
      ));
      
      setTodoListForm({ name: '', description: '', color: '#3B82F6', selectedLabels: [] });
      setShowTodoListModal(false);
      setIsEditMode(false);
      setEditingTodoListId(null);
      showToast('투두리스트가 수정되었습니다. (테스트 모드)', 'success');
    } catch (err) {
      console.error('투두리스트 수정 실패:', err);
      showToast('투두리스트 수정에 실패했습니다.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, updateTodoList: false }));
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 우선순위 정보
  const getPriorityInfo = (priority: 1 | 2 | 3) => {
    switch (priority) {
      case 3:
        return { label: '높음', color: 'bg-red-100 text-red-600 border-red-200', icon: '🔴' };
      case 2:
        return { label: '보통', color: 'bg-yellow-100 text-yellow-600 border-yellow-200', icon: '🟡' };
      case 1:
        return { label: '낮음', color: 'bg-blue-100 text-blue-600 border-blue-200', icon: '🔵' };
      default:
        return { label: '보통', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: '⚪' };
    }
  };

  // 필터링된 투두 목록
  const getFilteredTodos = (todos: TeamTodo[]) => {
    return todos.filter(todo => {
      // 텍스트 검색
      if (searchTodo && !todo.title.toLowerCase().includes(searchTodo.toLowerCase()) && 
          !todo.description.toLowerCase().includes(searchTodo.toLowerCase())) {
        return false;
      }

      // 라벨 필터
      if (selectedLabels.length > 0 && !selectedLabels.some(labelId => 
        todo.labels.some(label => label.id === labelId))) {
        return false;
      }

      // 상태 필터
      switch (todoFilter) {
        case 'my':
          return todo.assignedUser?.userId === currentUser?.id;
        case 'completed':
          return todo.isCompleted;
        case 'pending':
          return !todo.isCompleted;
        case 'overdue':
          return !todo.isCompleted && new Date(todo.dueDate) < new Date();
        default:
          return true;
      }
    }).sort((a, b) => {
      switch (todoSort) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          return b.priority - a.priority;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdBy.createDate).getTime() - new Date(a.createdBy.createDate).getTime();
        case 'updated':
          return new Date(b.createdBy.modifyDate).getTime() - new Date(a.createdBy.modifyDate).getTime();
        default:
          return 0;
      }
    });
  };

  // 뒤로가기
  const handleGoBack = () => {
    router.push('/teams');
  };

  // 팀 설정 페이지로 이동
  const handleGoToSettings = () => {
    router.push(`/teams/${teamId}/settings`);
  };

  // 라벨 데이터 불러오기
  const fetchLabels = useCallback(async () => {
    try {
      // 테스트용 쿠키 설정 (실제 프로덕션에서는 제거)
      document.cookie = 'accessToken=test-token; path=/; domain=localhost';

      const response = await fetch('http://localhost:8080/api/labels', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        // 401 에러인 경우 테스트 데이터 반환
        if (response.status === 401) {
          console.log('인증 실패, 테스트 라벨 데이터 사용');
          const testLabels: Label[] = [
            { id: 1, name: '공부', color: '#FF4D4F', teamId: teamId, createdBy: 1, createdAt: '2024-12-15T09:00:00' },
            { id: 2, name: '운동', color: '#1890FF', teamId: teamId, createdBy: 1, createdAt: '2024-12-15T09:00:00' },
            { id: 3, name: '휴식', color: '#52C41A', teamId: teamId, createdBy: 1, createdAt: '2024-12-15T09:00:00' }
          ];
          setLabels(testLabels);
          // 팀의 labels도 업데이트
          setTeam(prev => prev ? { ...prev, labels: testLabels } : prev);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ labels: Label[] }> = await response.json();
      
      if (result.resultCode === '200-1') {
        setLabels(result.data.labels);
        // 팀의 labels도 업데이트
        setTeam(prev => prev ? { ...prev, labels: result.data.labels } : prev);
      } else {
        throw new Error(result.msg || '라벨 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('라벨 데이터 불러오기 실패:', err);
      showToast('라벨 목록을 불러오는데 실패했습니다.', 'error');
    }
  }, [teamId, showToast]);

  // 라벨 생성
  const handleCreateLabel = async () => {
    if (!labelForm.name.trim()) {
      showToast('라벨 이름을 입력해주세요.', 'error');
      return;
    }

    setActionLoading(prev => ({ ...prev, createLabel: true }));

    try {
      // 백엔드에서 라벨 생성 API가 없으므로 테스트 모드로만 동작
      console.log('테스트 모드: 라벨 생성');
      
      const newLabel: Label = {
        id: Date.now(), // 임시 ID
        name: labelForm.name.trim(),
        color: labelForm.color,
        teamId: teamId,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString()
      };

      setLabels(prev => [...prev, newLabel]);
      // 팀의 labels도 업데이트
      setTeam(prev => prev ? { ...prev, labels: [...prev.labels, newLabel] } : prev);
      setLabelForm({ name: '', color: '#3B82F6' });
      setShowLabelModal(false);
      showToast('라벨이 생성되었습니다. (테스트 모드)', 'success');
    } catch (err) {
      console.error('라벨 생성 실패:', err);
      showToast('라벨 생성에 실패했습니다.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, createLabel: false }));
    }
  };

  // 라벨 삭제
  const handleDeleteLabel = async (labelId: number, labelName: string) => {
    if (!confirm(`"${labelName}" 라벨을 삭제하시겠습니까?`)) return;

    setActionLoading(prev => ({ ...prev, [`deleteLabel-${labelId}`]: true }));

    try {
      // 백엔드에서 라벨 삭제 API가 없으므로 테스트 모드로만 동작
      console.log('테스트 모드: 라벨 삭제');
      
      setLabels(prev => prev.filter(label => label.id !== labelId));
      // 팀의 labels도 업데이트
      setTeam(prev => prev ? { ...prev, labels: prev.labels.filter(label => label.id !== labelId) } : prev);
      showToast(`"${labelName}" 라벨이 삭제되었습니다. (테스트 모드)`, 'success');
    } catch (err) {
      console.error('라벨 삭제 실패:', err);
      showToast('라벨 삭제에 실패했습니다.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`deleteLabel-${labelId}`]: false }));
    }
  };

  // 투두리스트 삭제
  const handleDeleteTodoList = async (todoListId: number, todoListName: string) => {
    if (!confirm(`"${todoListName}" 투두리스트를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return;

    setActionLoading(prev => ({ ...prev, [`deleteTodoList-${todoListId}`]: true }));

    try {
      // 테스트용 쿠키 설정 (실제 프로덕션에서는 제거)
      document.cookie = 'accessToken=test-token; path=/; domain=localhost';

      const response = await fetch(`http://localhost:8080/api/todo-lists/${todoListId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        // 401 에러인 경우 테스트 모드로 동작
        if (response.status === 401) {
          console.log('인증 실패, 테스트 모드로 투두리스트 삭제');
          setTodoLists(prev => prev.filter(list => list.id !== todoListId));
          showToast(`"${todoListName}" 투두리스트가 삭제되었습니다! (테스트 모드)`, 'success');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTodoLists(prev => prev.filter(list => list.id !== todoListId));
      showToast(`"${todoListName}" 투두리스트가 삭제되었습니다.`, 'success');
    } catch (err) {
      console.error('투두리스트 삭제 실패:', err);
      showToast('투두리스트 삭제에 실패했습니다.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`deleteTodoList-${todoListId}`]: false }));
    }
  };

  // 투두리스트 드롭다운 메뉴 토글
  const toggleDropdown = (todoListId: number) => {
    setOpenDropdown(openDropdown === todoListId ? null : todoListId);
  };

  // 투두리스트 아카이브/언아카이브
  const handleToggleArchive = async (todoListId: number, todoListName: string) => {
    setActionLoading(prev => ({ ...prev, [`archive-${todoListId}`]: true }));

    try {
      // 백엔드에서 아카이브 API가 없으므로 테스트 모드로만 동작
      console.log('테스트 모드: 투두리스트 아카이브/언아카이브');
      
      setTodoLists(prev => prev.map(list => 
        list.id === todoListId 
          ? { ...list, isArchived: !list.isArchived }
          : list
      ));
      
      const updatedList = todoLists.find(list => list.id === todoListId);
      const action = updatedList?.isArchived ? '언아카이브' : '아카이브';
      showToast(`"${todoListName}" 투두리스트가 ${action}되었습니다. (테스트 모드)`, 'success');
    } catch (err) {
      console.error('투두리스트 아카이브 실패:', err);
      showToast('투두리스트 아카이브에 실패했습니다.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`archive-${todoListId}`]: false }));
      setOpenDropdown(null);
    }
  };

  // 투두리스트 편집
  const handleEditTodoList = (todoListId: number) => {
    const todoList = todoLists.find(list => list.id === todoListId);
    if (todoList) {
      setTodoListForm({
        name: todoList.name,
        description: todoList.description,
        color: todoList.color,
        selectedLabels: todoList.labels.map(label => label.id)
      });
      setIsEditMode(true);
      setEditingTodoListId(todoListId);
      setShowTodoListModal(true);
    }
    setOpenDropdown(null);
  };

  // 할일 상세 정보 보기
  const handleViewTodoDetail = (todo: TeamTodo) => {
    setSelectedTodo(todo);
    setShowTodoDetailModal(true);
  };

  // 투두 클릭 핸들러 추가
  const handleTodoClick = (todo: TeamTodo) => {
    setSelectedTodo(todo);
  };

  // 할일 생성 (백엔드 API 연동)
  const handleCreateTodo = async (todoListId: number, todoData: {
    title: string;
    description: string;
    priority: 1 | 2 | 3;
    dueDate?: string;
  }) => {
    try {
      // 테스트용 쿠키 설정 (실제 프로덕션에서는 제거)
      document.cookie = 'accessToken=test-token; path=/; domain=localhost';

      const response = await fetch('http://localhost:8080/api/todo', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: todoData.title,
          description: todoData.description,
          priority: todoData.priority,
          startDate: new Date().toISOString(),
          dueDate: todoData.dueDate || null,
          todoList: todoListId
        })
      });

      if (!response.ok) {
        // 401 에러인 경우 테스트 모드로 동작
        if (response.status === 401) {
          console.log('인증 실패, 테스트 모드로 할일 생성');
          const newTodo: TeamTodo = {
            id: Date.now(),
            title: todoData.title,
            description: todoData.description,
            isCompleted: false,
            priority: todoData.priority,
            startDate: new Date().toISOString(),
            dueDate: todoData.dueDate || '',
            createdBy: {
              id: 1,
              userId: currentUser.id,
              userNickname: currentUser.nickname,
              teamId: teamId,
              role: 'LEADER',
              joinedAt: new Date().toISOString(),
              createDate: new Date().toISOString(),
              modifyDate: new Date().toISOString()
            },
            labels: [],
            comments: [],
            subtasks: [],
            todoList: todoListId
          };
          
          setTodoLists(prev => prev.map(list => 
            list.id === todoListId 
              ? { ...list, todos: [...list.todos, newTodo] }
              : list
          ));
          showToast('할일이 생성되었습니다. (테스트 모드)', 'success');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TodoResponseDto> = await response.json();
      
      if (result.resultCode === '200-OK') {
        // 백엔드 응답으로 새 할일 추가
        const newTodo: TeamTodo = {
          id: result.data.id,
          title: result.data.title,
          description: result.data.description,
          isCompleted: result.data.isCompleted,
          priority: result.data.priority as 1 | 2 | 3,
          startDate: result.data.startDate,
          dueDate: result.data.dueDate,
          createdBy: {
            id: 1,
            userId: currentUser.id,
            userNickname: currentUser.nickname,
            teamId: teamId,
            role: 'LEADER',
            joinedAt: new Date().toISOString(),
            createDate: new Date().toISOString(),
            modifyDate: new Date().toISOString()
          },
          labels: [],
          comments: [],
          subtasks: [],
          todoList: todoListId
        };
        
        setTodoLists(prev => prev.map(list => 
          list.id === todoListId 
            ? { ...list, todos: [...list.todos, newTodo] }
            : list
        ));
        showToast('할일이 생성되었습니다.', 'success');
      } else {
        throw new Error(result.msg || '할일 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('할일 생성 실패:', err);
      showToast('할일 생성에 실패했습니다.', 'error');
    }
  };

  if (isLoading) {
    return (
      <TodoListTemplate>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>팀 정보를 불러오는 중...</span>
          </div>
        </div>
      </TodoListTemplate>
    );
  }

  if (error || !team) {
    return (
      <TodoListTemplate>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-red-800 font-semibold mb-2">오류가 발생했습니다</h3>
            <p className="text-red-600 mb-4">{error || '팀을 찾을 수 없습니다.'}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchTeamData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                팀 목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </TodoListTemplate>
    );
  }

  if (!isMember()) {
    return (
      <TodoListTemplate>
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <Users className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-yellow-800 font-semibold mb-2">접근 권한이 없습니다</h3>
            <p className="text-yellow-600 mb-4">이 팀의 멤버가 아닙니다.</p>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              팀 목록으로 돌아가기
            </button>
          </div>
        </div>
      </TodoListTemplate>
    );
  }

  const filteredMembers = team.members.filter(member =>
    member.userNickname.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const totalTodos = todoLists.reduce((sum, list) => sum + list.todos.length, 0);
  const completedTodos = todoLists.reduce((sum, list) => sum + list.todos.filter(t => t.isCompleted).length, 0);
  const myTodos = todoLists.reduce((sum, list) => 
    sum + list.todos.filter(t => t.assignedUser?.userId === currentUser?.id).length, 0);
  const overdueTodos = todoLists.reduce((sum, list) => 
    sum + list.todos.filter(t => !t.isCompleted && new Date(t.dueDate) < new Date()).length, 0);
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <TodoListTemplate>
      <div className="w-full h-full flex flex-col">
        {/* 헤더 */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              팀 목록
            </button>
            
            {/* 팀 알림 설정 */}
            <button
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title={team.settings.notificationsEnabled ? "알림 끄기" : "알림 켜기"}
            >
              {team.settings.notificationsEnabled ? (
                <Bell className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
            </button>

            {/* 즐겨찾기 토글 */}
            <button
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Star className={`w-5 h-5 ${team.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold relative">
                {team.teamName.charAt(0)}
                {team.isStarred && (
                  <Star className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 fill-current" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1 flex items-center gap-3">
                  {team.teamName}
                  {team.settings.isPublic && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      공개
                    </span>
                  )}
                </h1>
                <p className="text-gray-600">
                  {team.members.length}명의 멤버 • {formatDate(team.createDate)} 생성
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {!isLeader() && (
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <UserMinus className="w-4 h-4" />
                  팀 나가기
                </button>
              )}
              
              {isLeader() && (
                <>
                  <button
                    onClick={() => setShowMemberModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    멤버 초대
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    팀 수정
                  </button>
                  <button
                    onClick={handleGoToSettings}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    설정
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Flag className="w-4 h-4" />
              개요
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === 'members'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              멤버 ({team.members.length})
            </button>
            <button
              onClick={() => setActiveTab('todos')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === 'todos'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
              할일 ({totalTodos})
            </button>
            <button
              onClick={() => setActiveTab('labels')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === 'labels'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Tag className="w-4 h-4" />
              라벨 ({team.labels.length})
            </button>
          </div>
        </div>

        {/* 탭 내용 */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 팀 설명 */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">팀 소개</h3>
                <p className="text-gray-600 leading-relaxed">
                  {team.description || '팀 설명이 없습니다.'}
                </p>
              </div>

              {/* 통계 카드들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{team.members.length}</div>
                      <div className="text-gray-500 text-sm">총 멤버</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{completedTodos}</div>
                      <div className="text-gray-500 text-sm">완료된 할일</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Circle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{myTodos}</div>
                      <div className="text-gray-500 text-sm">내 할일</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Flag className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{completionRate}%</div>
                      <div className="text-gray-500 text-sm">완료율</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 진행률 차트 */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">프로젝트 진행률</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">전체 진행률</span>
                    <span className="font-semibold text-gray-800">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{completedTodos}</div>
                      <div className="text-gray-500">완료</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-yellow-600">{totalTodos - completedTodos - overdueTodos}</div>
                      <div className="text-gray-500">진행중</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">{overdueTodos}</div>
                      <div className="text-gray-500">지연</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 최근 활동 */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">최근 활동</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">대시보드 컴포넌트 개발이 완료되었습니다</div>
                      <div className="text-xs text-gray-500">박웹개발 • 2시간 전</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">최프론트님이 팀에 합류했습니다</div>
                      <div className="text-xs text-gray-500">1일 전</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">새로운 투두리스트 "UI 개선"이 생성되었습니다</div>
                      <div className="text-xs text-gray-500">김개발 • 3일 전</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">팀 멤버</h3>
                  {isLeader() && (
                    <button
                      onClick={() => setShowMemberModal(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      멤버 초대
                    </button>
                  )}
                </div>

                {/* 멤버 검색 */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="멤버 검색..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {memberSearch && (
                    <button
                      onClick={() => setMemberSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 멤버 목록 */}
                <div className="space-y-3">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.userAvatar ? (
                              <img src={member.userAvatar} alt={member.userNickname} className="w-10 h-10 rounded-full" />
                            ) : (
                              member.userNickname.charAt(0).toUpperCase()
                            )}
                          </div>
                          {/* 백엔드에서 isOnline 속성을 제공하지 않으므로 제거 */}
                          {/* {member.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )} */}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{member.userNickname}</span>
                            {member.role === 'LEADER' && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                <Crown className="w-3 h-3" />
                                리더
                              </div>
                            )}
                            {member.userId === currentUser?.id && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                나
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(member.joinedAt)} 합류
                          </div>
                        </div>
                      </div>

                      {isLeader() && member.userId !== currentUser?.id && (
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => handleRemoveMember(member.id, member.userNickname)}
                            disabled={actionLoading[`removeMember-${member.id}`]}
                          >
                            {actionLoading[`removeMember-${member.id}`] ? (
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <UserMinus className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredMembers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {memberSearch ? '검색 결과가 없습니다.' : '멤버가 없습니다.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'todos' && (
            <div style={{ 
              display: 'flex', 
              width: '100%', 
              height: 'calc(100vh - 200px)',
              gap: '2rem',
              paddingTop: '0',
              margin: '0',
              overflow: 'hidden'
            }}>
              {/* 왼쪽: 투두리스트 + 투두목록 - 정확히 50% */}
              <div style={{ 
                width: '50%',
                minWidth: '50%',
                maxWidth: '50%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                height: '100%'
              }}>
                {/* 투두리스트 정보 블록 */}
                <div style={{
                  background: 'var(--bg-white)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px var(--shadow-md)',
                  border: '1px solid var(--border-light)',
                  flexShrink: 0,
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <h2 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700', 
                        color: 'var(--text-primary)', 
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        📋 투두리스트 관리
                      </h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        팀의 할일들을 체계적으로 관리하세요
                      </p>
                    </div>
                    
                    {/* 컨트롤 영역 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* 검색바 */}
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="할일 검색..."
                          value={searchTodo}
                          onChange={(e) => setSearchTodo(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            border: '1px solid var(--border-light)',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--primary-color)';
                            e.target.style.boxShadow = '0 0 0 3px var(--primary-light)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border-light)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        <Search style={{
                          position: 'absolute',
                          left: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '1.25rem',
                          height: '1.25rem',
                          color: 'var(--text-light)'
                        }} />
                      </div>

                      {/* 필터 및 정렬 */}
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <select
                          value={todoFilter}
                          onChange={(e) => setTodoFilter(e.target.value as FilterType)}
                          style={{
                            padding: '0.75rem',
                            border: '1px solid var(--border-light)',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            background: 'white'
                          }}
                        >
                          <option value="all">전체</option>
                          <option value="my">내 할일</option>
                          <option value="pending">진행중</option>
                          <option value="completed">완료</option>
                          <option value="overdue">지연</option>
                        </select>

                        <select
                          value={todoSort}
                          onChange={(e) => setTodoSort(e.target.value as SortType)}
                          style={{
                            padding: '0.75rem',
                            border: '1px solid var(--border-light)',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            background: 'white'
                          }}
                        >
                          <option value="dueDate">마감일순</option>
                          <option value="priority">우선순위</option>
                          <option value="title">제목순</option>
                          <option value="created">생성일순</option>
                          <option value="updated">수정일순</option>
                        </select>
                        
                        {/* 라벨 필터 */}
                        {labels.length > 0 && (
                          <select
                            value={selectedLabels.length > 0 ? selectedLabels[0] : ''}
                            onChange={(e) => {
                              const labelId = parseInt(e.target.value);
                              if (labelId) {
                                setSelectedLabels([labelId]);
                              } else {
                                setSelectedLabels([]);
                              }
                            }}
                            style={{
                              padding: '0.75rem',
                              border: '1px solid var(--border-light)',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              outline: 'none',
                              background: 'white'
                            }}
                          >
                            <option value="">모든 라벨</option>
                            {labels.map((label) => (
                              <option key={label.id} value={label.id}>
                                {label.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* 투두리스트 생성 버튼 */}
                      <button
                        onClick={() => setShowTodoListModal(true)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          background: 'linear-gradient(135deg, var(--primary-color) 0%, #7c3aed 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                        새 투두리스트 만들기
                      </button>
                    </div>

                    {/* 아카이브 토글 버튼 */}
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        background: 'white',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <Archive style={{ width: '1rem', height: '1rem' }} />
                      {showArchived ? '활성만 보기' : '아카이브 보기'}
                    </button>
                  </div>
                </div>

                {/* 투두리스트 목록 블록 */}
                <div style={{
                  background: 'var(--bg-white)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px var(--shadow-md)',
                  border: '1px solid var(--border-light)',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
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
                    📝 투두리스트 목록
                  </h2>
                  
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
                    {todoLists
                      .filter(list => showArchived ? list.isArchived : !list.isArchived)
                      .map((todoList) => {
                      const filteredTodos = getFilteredTodos(todoList.todos);
                      
                      return (
                        <div key={todoList.id} style={{
                          background: selectedTodo && selectedTodo.todoList === todoList.id ? 'var(--primary-light)' : 'var(--bg-main)',
                          borderRadius: '8px',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: selectedTodo && selectedTodo.todoList === todoList.id 
                            ? '2px solid var(--primary-color)' 
                            : '1px solid var(--border-light)',
                          minHeight: '120px',
                          maxHeight: '120px',
                          overflow: 'hidden',
                          width: '100%',
                          opacity: todoList.isArchived ? 0.75 : 1
                        }}
                        onClick={() => {
                          // 투두리스트 클릭 시 첫 번째 투두 선택
                          if (filteredTodos.length > 0) {
                            handleTodoClick(filteredTodos[0]);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedTodo || selectedTodo.todoList !== todoList.id) {
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow-md)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedTodo || selectedTodo.todoList !== todoList.id) {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <h3 style={{
                                  fontWeight: '600',
                                  fontSize: '1rem',
                                  color: 'var(--text-primary)',
                                  lineHeight: '1.4',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '70%'
                                }}>
                                  {todoList.name}
                                  {todoList.isArchived && (
                                    <span style={{
                                      marginLeft: '0.5rem',
                                      padding: '0.25rem 0.5rem',
                                      background: 'var(--bg-main)',
                                      color: 'var(--text-secondary)',
                                      borderRadius: '12px',
                                      fontSize: '0.75rem'
                                    }}>
                                      아카이브됨
                                    </span>
                                  )}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div 
                                    style={{ 
                                      width: '0.75rem', 
                                      height: '0.75rem', 
                                      borderRadius: '50%',
                                      backgroundColor: todoList.color
                                    }}
                                  />
                                </div>
                              </div>
                              
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
                                {todoList.description}
                              </p>
                              
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                gap: '0.5rem'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <List style={{ width: '0.875rem', height: '0.875rem', color: 'var(--primary-color)' }} />
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {filteredTodos.length}개 할일
                                  </span>
                                  {filteredTodos.length > 0 && (
                                    <>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>•</span>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {filteredTodos.filter(t => t.isCompleted).length}/{filteredTodos.length}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <button
                                  onClick={() => setSelectedTodoListForAdd(todoList.id)}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary-color)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                >
                                  할일 추가
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 선택된 투두 상세 정보 - 정확히 50% */}
              <div style={{ 
                width: '50%',
                minWidth: '50%',
                maxWidth: '50%',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                {selectedTodo ? (
                  <div style={{
                    background: 'var(--bg-white)',
                    borderRadius: '12px',
                    padding: '2rem',
                    boxShadow: '0 4px 12px var(--shadow-md)',
                    border: '1px solid var(--border-light)',
                    height: '100%',
                    width: '100%',
                    minWidth: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}>
                    {/* 헤더 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '2rem',
                      paddingBottom: '1rem',
                      borderBottom: '2px solid var(--border-light)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h2 style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: 'var(--text-primary)',
                          lineHeight: '1.3',
                          marginBottom: '0.5rem'
                        }}>
                          {selectedTodo.title}
                        </h2>
                        <p style={{
                          color: 'var(--text-secondary)',
                          fontSize: '1rem',
                          lineHeight: '1.5'
                        }}>
                          {selectedTodo.description || '설명이 없습니다.'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginLeft: '1rem' }}>
                        <button
                          onClick={() => handleViewTodoDetail(selectedTodo)}
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
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#3730a3';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--primary-color)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          📋 상세보기
                        </button>
                      </div>
                    </div>

                    {/* 상세 내용 */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '1.5rem',
                      flex: 1,
                      overflowY: 'auto'
                    }}>
                      {/* 상태 정보 */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.75rem'
                        }}>
                          📊 상태 정보
                        </label>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '1rem' 
                        }}>
                          <div style={{
                            background: 'var(--bg-main)',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: selectedTodo.isCompleted ? '#16a34a' : '#6b7280', marginBottom: '0.25rem' }}>
                              {selectedTodo.isCompleted ? '✅ 완료' : '⏳ 진행중'}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              상태
                            </div>
                          </div>
                          <div style={{
                            background: 'var(--bg-main)',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: getPriorityInfo(selectedTodo.priority).color, marginBottom: '0.25rem' }}>
                              {getPriorityInfo(selectedTodo.priority).label}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              우선순위
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 담당자 정보 */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.75rem'
                        }}>
                          👤 담당자 정보
                        </label>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.5rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            background: 'var(--bg-main)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '2rem',
                                height: '2rem',
                                borderRadius: '50%',
                                background: 'var(--primary-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary-color)',
                                fontWeight: '600',
                                fontSize: '0.875rem'
                              }}>
                                {selectedTodo.createdBy.userNickname.charAt(0)}
                              </div>
                              <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                                {selectedTodo.createdBy.userNickname}
                              </span>
                            </div>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: selectedTodo.createdBy.role === 'LEADER' ? '#fef3c7' : '#f3f4f6',
                              color: selectedTodo.createdBy.role === 'LEADER' ? '#d97706' : '#6b7280'
                            }}>
                              {selectedTodo.createdBy.role === 'LEADER' ? '리더' : '멤버'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 날짜 정보 */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.75rem'
                        }}>
                          📅 날짜 정보
                        </label>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '1rem' 
                        }}>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                              시작일
                            </div>
                            <div style={{ 
                              color: 'var(--text-primary)', 
                              fontSize: '0.9rem',
                              background: 'var(--bg-main)',
                              padding: '0.75rem',
                              borderRadius: '8px',
                              border: '1px solid var(--border-light)'
                            }}>
                              {formatDate(selectedTodo.startDate)}
                            </div>
                          </div>
                          {selectedTodo.dueDate && (
                            <div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                마감일
                              </div>
                              <div style={{ 
                                color: new Date(selectedTodo.dueDate) < new Date() && !selectedTodo.isCompleted ? '#dc2626' : 'var(--text-primary)', 
                                fontSize: '0.9rem',
                                background: 'var(--bg-main)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-light)'
                              }}>
                                {formatDate(selectedTodo.dueDate)}
                                {new Date(selectedTodo.dueDate) < new Date() && !selectedTodo.isCompleted && (
                                  <span style={{ marginLeft: '0.5rem', color: '#dc2626', fontWeight: '600' }}>
                                    ⚠️ 지연
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
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
                        할일을 선택해주세요
                      </h3>
                      <p style={{ fontSize: '1rem' }}>
                        왼쪽에서 투두리스트를 클릭하면 할일 상세 정보가 표시됩니다.
                      </p>
                    </div>  
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'labels' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">라벨 관리</h3>
                  {isLeader() && (
                    <button
                      onClick={() => setShowLabelModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      라벨 추가
                    </button>
                  )}
                </div>

                {labels.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>아직 라벨이 없습니다.</p>
                    {isLeader() && (
                      <p className="text-sm mt-2">첫 번째 라벨을 만들어보세요.</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {labels.map((label) => (
                      <div key={label.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: label.color }}
                            ></div>
                            <span className="font-medium text-gray-800">{label.name}</span>
                          </div>
                          {isLeader() && (
                            <button
                              onClick={() => handleDeleteLabel(label.id, label.name)}
                              disabled={actionLoading[`deleteLabel-${label.id}`]}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="라벨 삭제"
                            >
                              {actionLoading[`deleteLabel-${label.id}`] ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          색상: {label.color}
                        </div>
                        <div className="text-xs text-gray-500">
                          생성일: {formatDate(label.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 팀 수정 모달 */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">팀 수정</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    팀 이름 *
                  </label>
                  <input
                    type="text"
                    value={editForm.teamName}
                    onChange={(e) => setEditForm({ ...editForm, teamName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="팀 이름을 입력하세요"
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    팀 설명
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="팀에 대한 설명을 입력하세요"
                    rows={3}
                    maxLength={1000}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleEditTeam}
                  disabled={actionLoading.editTeam}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {actionLoading.editTeam ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      수정 중...
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      수정
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 멤버 초대 모달 */}
        {showMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">멤버 초대</h2>
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* 사용 가능한 이메일 안내 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">📧 사용 가능한 이메일</h3>
                  <p className="text-xs text-blue-700 mb-2">다음 이메일을 사용하거나 실제 등록된 이메일을 입력하세요:</p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• <strong>dev@test.com</strong> - 김개발 (테스트)</li>
                    <li>• <strong>coding@test.com</strong> - 이코딩 (테스트)</li>
                    <li>• <strong>server@test.com</strong> - 박서버 (테스트)</li>
                    <li>• <strong>실제 등록된 이메일</strong> - 실제 DB에 있는 사용자</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    💡 실제 DB에 등록된 사용자만 초대할 수 있습니다!
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="초대할 사용자의 이메일을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    역할
                  </label>
                  <select
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as 'LEADER' | 'MEMBER' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="MEMBER">멤버</option>
                    <option value="LEADER">리더</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    초대 메시지 (선택사항)
                  </label>
                  <textarea
                    value={memberForm.message}
                    onChange={(e) => setMemberForm({ ...memberForm, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="초대와 함께 보낼 메시지를 입력하세요"
                    rows={3}
                    maxLength={500}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleInviteMember}
                  disabled={actionLoading.inviteMember}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {actionLoading.inviteMember ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      초대 중...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      초대 보내기
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 투두리스트 생성/수정 모달 */}
        {showTodoListModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  {isEditMode ? '투두리스트 수정' : '투두리스트 추가'}
                </h2>
                <button
                  onClick={() => {
                    setShowTodoListModal(false);
                    setIsEditMode(false);
                    setEditingTodoListId(null);
                    setTodoListForm({ name: '', description: '', color: '#3B82F6', selectedLabels: [] });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    투두리스트 이름 *
                  </label>
                  <input
                    type="text"
                    value={todoListForm.name}
                    onChange={(e) => setTodoListForm({ ...todoListForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="투두리스트 이름을 입력하세요"
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명
                  </label>
                  <textarea
                    value={todoListForm.description}
                    onChange={(e) => setTodoListForm({ ...todoListForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="투두리스트에 대한 설명을 입력하세요"
                    rows={3}
                    maxLength={1000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    색상
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={todoListForm.color}
                      onChange={(e) => setTodoListForm({ ...todoListForm, color: e.target.value })}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <span className="text-gray-600 text-sm">{todoListForm.color}</span>
                  </div>
                </div>

                {/* 라벨 선택 */}
                {labels.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      라벨 선택 (선택사항)
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {labels.map((label) => (
                        <label
                          key={label.id}
                          className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={todoListForm.selectedLabels.includes(label.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTodoListForm({
                                  ...todoListForm,
                                  selectedLabels: [...todoListForm.selectedLabels, label.id]
                                });
                              } else {
                                setTodoListForm({
                                  ...todoListForm,
                                  selectedLabels: todoListForm.selectedLabels.filter(id => id !== label.id)
                                });
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: label.color }}
                          ></div>
                          <span className="text-sm text-gray-700">{label.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => {
                    setShowTodoListModal(false);
                    setIsEditMode(false);
                    setEditingTodoListId(null);
                    setTodoListForm({ name: '', description: '', color: '#3B82F6', selectedLabels: [] });
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={isEditMode ? handleUpdateTodoList : handleCreateTodoList}
                  disabled={actionLoading.createTodoList || actionLoading.updateTodoList}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {actionLoading.createTodoList || actionLoading.updateTodoList ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isEditMode ? '수정 중...' : '생성 중...'}
                    </>
                  ) : (
                    <>
                      {isEditMode ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {isEditMode ? '수정' : '생성'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 할일 상세 정보 모달 */}
        {showTodoDetailModal && selectedTodo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">할일 상세 정보</h2>
                <button
                  onClick={() => setShowTodoDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="p-6 space-y-6">
                {/* 제목 및 완료 상태 */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {selectedTodo.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedTodo.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedTodo.isCompleted 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedTodo.isCompleted ? '완료' : '진행중'}
                    </span>
                  </div>
                </div>

                {/* 우선순위 */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">우선순위:</span>
                  <div className="flex items-center gap-1">
                    {getPriorityInfo(selectedTodo.priority).icon}
                    <span className="text-sm font-medium">
                      {getPriorityInfo(selectedTodo.priority).label}
                    </span>
                  </div>
                </div>

                {/* 날짜 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">시작일:</span>
                    <p className="text-gray-800 font-medium">
                      {formatDateTime(selectedTodo.startDate)}
                    </p>
                  </div>
                  {selectedTodo.dueDate && (
                    <div>
                      <span className="text-gray-600 text-sm">마감일:</span>
                      <p className="text-gray-800 font-medium">
                        {formatDateTime(selectedTodo.dueDate)}
                      </p>
                    </div>
                  )}
                </div>

                {/* 담당자 */}
                {selectedTodo.assignedUser && (
                  <div>
                    <span className="text-gray-600 text-sm">담당자:</span>
                    <p className="text-gray-800 font-medium">
                      {selectedTodo.assignedUser.userNickname}
                    </p>
                  </div>
                )}

                {/* 생성자 */}
                <div>
                  <span className="text-gray-600 text-sm">생성자:</span>
                  <p className="text-gray-800 font-medium">
                    {selectedTodo.createdBy.userNickname}
                  </p>
                </div>

                {/* 라벨 */}
                {selectedTodo.labels.length > 0 && (
                  <div>
                    <span className="text-gray-600 text-sm">라벨:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedTodo.labels.map(label => (
                        <span
                          key={label.id}
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${label.color}20`,
                            color: label.color,
                            border: `1px solid ${label.color}40`
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 댓글 */}
                {selectedTodo.comments.length > 0 && (
                  <div>
                    <span className="text-gray-600 text-sm">댓글 ({selectedTodo.comments.length}):</span>
                    <div className="space-y-2 mt-2">
                      {selectedTodo.comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-800">
                              {comment.author.userNickname}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 하위 작업 */}
                {selectedTodo.subtasks.length > 0 && (
                  <div>
                    <span className="text-gray-600 text-sm">하위 작업 ({selectedTodo.subtasks.length}):</span>
                    <div className="space-y-2 mt-2">
                      {selectedTodo.subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={subtask.isCompleted}
                            onChange={() => {
                              // 하위 작업 완료 상태 변경 로직
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className={`text-sm ${
                            subtask.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'
                          }`}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 모달 푸터 */}
              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setShowTodoDetailModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    // 할일 수정 로직
                    setShowTodoDetailModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 라벨 생성 모달 */}
        {showLabelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">라벨 추가</h2>
                <button
                  onClick={() => setShowLabelModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    라벨 이름 *
                  </label>
                  <input
                    type="text"
                    value={labelForm.name}
                    onChange={(e) => setLabelForm({ ...labelForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="라벨 이름을 입력하세요"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    색상
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={labelForm.color}
                      onChange={(e) => setLabelForm({ ...labelForm, color: e.target.value })}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <span className="text-gray-600 text-sm">{labelForm.color}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setShowLabelModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateLabel}
                  disabled={actionLoading.createLabel}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {actionLoading.createLabel ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      생성
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 할일 추가 모달 */}
        {showAddTodoModal && selectedTodoListForAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateTodo(selectedTodoListForAdd, {
                  title: todoForm.title,
                  description: todoForm.description,
                  priority: todoForm.priority,
                  dueDate: todoForm.dueDate || undefined
                });
                setShowAddTodoModal(false);
              }}>
                {/* 모달 헤더 */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">새 할일 추가</h2>
                  <button
                    type="button"
                    onClick={() => setShowAddTodoModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* 모달 내용 */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제목 *
                    </label>
                    <input
                      type="text"
                      value={todoForm.title}
                      onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="할일 제목을 입력하세요"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      설명
                    </label>
                    <textarea
                      value={todoForm.description}
                      onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="할일에 대한 설명을 입력하세요"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      우선순위
                    </label>
                    <select
                      value={todoForm.priority}
                      onChange={(e) => setTodoForm({ ...todoForm, priority: Number(e.target.value) as 1 | 2 | 3 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>낮음</option>
                      <option value={2}>보통</option>
                      <option value={3}>높음</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      마감일 (선택사항)
                    </label>
                    <input
                      type="datetime-local"
                      value={todoForm.dueDate}
                      onChange={(e) => setTodoForm({ ...todoForm, dueDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 모달 푸터 */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
                  <button
                    type="button"
                    onClick={() => setShowAddTodoModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={!todoForm.title.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    할일 추가
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TodoListTemplate>
  );
};

export default TeamDetailPage;