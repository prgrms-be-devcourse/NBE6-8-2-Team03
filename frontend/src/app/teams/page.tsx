'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Calendar, User, Crown, Settings, Eye, Search, X, Filter, SortAsc, Star, Clock } from 'lucide-react';
import TodoListTemplate from '../_components/TodoList/TodoListTemplate';
// import { useToast } from '../_hooks/useToast';
// import { useAuth } from '../_hooks/useAuth';
// import { TeamCardSkeleton } from '../_components/skeletons/TeamCardSkeleton';

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

// API 응답 타입
interface ApiResponse<T> {
  resultCode: string;
  msg: string;
  data: T;
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
  todoStats: {
    total: number;
    completed: number;
    overdue: number;
  };
  lastActivity: string;
}

// 정렬 타입
type SortType = 'name' | 'created' | 'modified' | 'members' | 'activity';
type FilterType = 'all' | 'leader' | 'member' | 'starred';

// 현재 사용자 타입
interface CurrentUser {
  id: number;
  nickname: string;
}

const TeamsPage: React.FC = () => {
  const router = useRouter();
  // const { showToast } = useToast();
  // const { currentUser } = useAuth();
  
  // 임시 Toast 함수 (useCallback으로 감싸기)
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    alert(`${type.toUpperCase()}: ${message}`);
  }, []);
  
  // 임시 현재 사용자
  const currentUser: CurrentUser = { id: 1, nickname: '김개발' };
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('modified');
  const [filterBy, setFilterBy] = useState<FilterType>('all');
  const [newTeam, setNewTeam] = useState({
    teamName: '',
    description: ''
  });
  const [createLoading, setCreateLoading] = useState(false);

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
      todoStats: {
        total: 0, // 백엔드에서 todo 통계가 없으므로 기본값
        completed: 0,
        overdue: 0
      },
      lastActivity: backendTeam.modifyDate // 최근 활동은 수정일로 대체
    };
  };

  // 팀 목록 불러오기
  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 테스트용 임시 인증 헤더 (실제 프로덕션에서는 제거)
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // 테스트용 쿠키 설정 (실제 프로덕션에서는 제거)
      document.cookie = 'accessToken=test-token; path=/; domain=localhost';

      const response = await fetch('http://localhost:8080/api/v1/teams', {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        // 401 에러인 경우 테스트 데이터 반환
        if (response.status === 401) {
          console.log('인증 실패, 테스트 데이터 사용');
          const testTeams: Team[] = [
            {
              id: 1,
              teamName: '프론트엔드 개발팀',
              description: 'React, Next.js를 활용한 웹 프론트엔드 개발팀',
              createDate: '2024-12-15T09:00:00',
              modifyDate: '2024-12-20T14:30:00',
              isStarred: true,
              members: [
                { id: 1, userId: 1, userNickname: '김개발', teamId: 1, role: 'LEADER', joinedAt: '2024-12-15T09:00:00', createDate: '2024-12-15T09:00:00', modifyDate: '2024-12-15T09:00:00' },
                { id: 2, userId: 2, userNickname: '이코딩', teamId: 1, role: 'MEMBER', joinedAt: '2024-12-16T10:00:00', createDate: '2024-12-16T10:00:00', modifyDate: '2024-12-16T10:00:00' }
              ],
              todoStats: { total: 10, completed: 6, overdue: 1 },
              lastActivity: '2024-12-20T16:30:00'
            },
            {
              id: 2,
              teamName: '백엔드 개발팀',
              description: 'Spring Boot, JPA를 활용한 백엔드 개발팀',
              createDate: '2024-12-10T09:00:00',
              modifyDate: '2024-12-19T11:20:00',
              isStarred: false,
              members: [
                { id: 3, userId: 3, userNickname: '박서버', teamId: 2, role: 'LEADER', joinedAt: '2024-12-10T09:00:00', createDate: '2024-12-10T09:00:00', modifyDate: '2024-12-10T09:00:00' },
                { id: 4, userId: 1, userNickname: '김개발', teamId: 2, role: 'MEMBER', joinedAt: '2024-12-12T14:00:00', createDate: '2024-12-12T14:00:00', modifyDate: '2024-12-12T14:00:00' }
              ],
              todoStats: { total: 8, completed: 3, overdue: 2 },
              lastActivity: '2024-12-19T15:45:00'
            }
          ];
          setTeams(testTeams);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TeamResponseDto[]> = await response.json();
      
      if (result.resultCode === '200-OK') {
        const convertedTeams = result.data.map(convertBackendTeamToFrontend);
        setTeams(convertedTeams);
      } else {
        throw new Error(result.msg || '팀 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('팀 목록 불러오기 실패:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // 팀 생성
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTeam.teamName.trim()) {
      showToast('팀 이름을 입력해주세요.', 'error');
      return;
    }

    try {
      setCreateLoading(true);

      // 테스트용 쿠키 설정 (실제 프로덕션에서는 제거)
      document.cookie = 'accessToken=test-token; path=/; domain=localhost';

      const response = await fetch('http://localhost:8080/api/v1/teams', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: newTeam.teamName.trim(),
          description: newTeam.description.trim() || null
        })
      });

      if (!response.ok) {
        // 401 에러인 경우 테스트 모드로 동작
        if (response.status === 401) {
          console.log('인증 실패, 테스트 모드로 팀 생성');
          const newTestTeam: Team = {
            id: Date.now(), // 임시 ID
            teamName: newTeam.teamName.trim(),
            description: newTeam.description.trim() || '',
            createDate: new Date().toISOString(),
            modifyDate: new Date().toISOString(),
            isStarred: false,
            members: [
              {
                id: 1,
                userId: currentUser.id,
                userNickname: currentUser.nickname,
                teamId: Date.now(),
                role: 'LEADER',
                joinedAt: new Date().toISOString(),
                createDate: new Date().toISOString(),
                modifyDate: new Date().toISOString()
              }
            ],
            todoStats: { total: 0, completed: 0, overdue: 0 },
            lastActivity: new Date().toISOString()
          };
          
          setTeams(prev => [...prev, newTestTeam]);
          showToast('팀이 성공적으로 생성되었습니다! (테스트 모드)', 'success');
          setShowCreateModal(false);
          setNewTeam({ teamName: '', description: '' });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TeamResponseDto> = await response.json();
      
      if (result.resultCode === '200-OK') {
        showToast('팀이 성공적으로 생성되었습니다!', 'success');
        setShowCreateModal(false);
        setNewTeam({ teamName: '', description: '' });
        fetchTeams(); // 팀 목록 새로고침
      } else {
        throw new Error(result.msg || '팀 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('팀 생성 실패:', err);
      const errorMessage = err instanceof Error ? err.message : '팀 생성에 실패했습니다.';
      showToast(errorMessage, 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  // 팀 즐겨찾기 토글 (백엔드에 즐겨찾기 API가 없으므로 프론트엔드에서만 처리)
  const handleToggleStar = async (teamId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const team = teams.find((t: Team) => t.id === teamId);
      if (!team) return;

      // 프론트엔드에서만 즐겨찾기 상태 변경
      setTeams((prev: Team[]) => prev.map((t: Team) => 
        t.id === teamId ? { ...t, isStarred: !t.isStarred } : t
      ));

      showToast(
        team.isStarred ? '즐겨찾기에서 제거되었습니다.' : '즐겨찾기에 추가되었습니다.',
        'success'
      );
    } catch (err) {
      console.error('즐겨찾기 토글 실패:', err);
      showToast('즐겨찾기 설정에 실패했습니다.', 'error');
    }
  };

  // 팀 상세 페이지로 이동
  const handleTeamClick = (teamId: number) => {
    router.push(`/teams/${teamId}`);
  };

  // 컴포넌트 마운트 시 팀 목록 불러오기
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // 검색 및 필터링
  const filteredAndSortedTeams = teams
    .filter((team: Team) => {
      // 검색 필터
      const matchesSearch = team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // 타입 필터
      switch (filterBy) {
        case 'leader':
          return team.members.some((m: TeamMemberResponseDto) => m.userId === currentUser?.id && m.role === 'LEADER');
        case 'member':
          return team.members.some((m: TeamMemberResponseDto) => m.userId === currentUser?.id && m.role === 'MEMBER');
        case 'starred':
          return team.isStarred;
        default:
          return true;
      }
    })
    .sort((a: Team, b: Team) => {
      switch (sortBy) {
        case 'name':
          return a.teamName.localeCompare(b.teamName);
        case 'created':
          return new Date(b.createDate).getTime() - new Date(a.createDate).getTime();
        case 'modified':
          return new Date(b.modifyDate).getTime() - new Date(a.modifyDate).getTime();
        case 'members':
          return b.members.length - a.members.length;
        case 'activity':
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        default:
          return 0;
      }
    });

  // 사용자 역할 확인
  const getUserRole = (team: Team): 'LEADER' | 'MEMBER' | null => {
    const member = team.members.find((m: TeamMemberResponseDto) => m.userId === currentUser?.id);
    return member?.role || null;
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

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return formatDate(dateString);
  };

  // 검색어 초기화
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <TodoListTemplate>
      <div className="w-full h-full flex flex-col">
        {/* 헤더 섹션 */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                내 팀 목록
                {teams.length > 0 && (
                  <span className="text-lg text-gray-500 font-normal">({teams.length})</span>
                )}
              </h1>
              <p className="text-gray-600">
                참여하고 있는 팀들을 관리하고 새로운 팀을 만들어보세요
              </p>
            </div>
            
            {/* 컨트롤 영역 */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* 검색바 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="팀 이름 또는 설명 검색..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-2 w-full sm:w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 필터 및 정렬 */}
              <div className="flex gap-2">
                <select
                  value={filterBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterBy(e.target.value as FilterType)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">전체</option>
                  <option value="leader">내가 리더인 팀</option>
                  <option value="member">내가 멤버인 팀</option>
                  <option value="starred">즐겨찾기</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as SortType)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="modified">최근 수정</option>
                  <option value="created">생성일</option>
                  <option value="name">이름순</option>
                  <option value="members">멤버수</option>
                  <option value="activity">최근 활동</option>
                </select>
              </div>

              {/* 팀 생성 버튼 */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                새 팀 만들기
              </button>
            </div>
          </div>

          {/* 검색 및 필터 결과 표시 */}
          {(searchTerm || filterBy !== 'all') && (
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              {searchTerm && (
                <span>"{searchTerm}"에 대한 검색 결과</span>
              )}
              {filterBy !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {filterBy === 'leader' && '리더'}
                  {filterBy === 'member' && '멤버'}
                  {filterBy === 'starred' && '즐겨찾기'}
                </span>
              )}
              <span className="font-medium">{filteredAndSortedTeams.length}개 팀</span>
            </div>
          )}
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 min-h-0">
          {/* 로딩 상태 */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-red-800 font-semibold mb-2">오류가 발생했습니다</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchTeams}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 팀 목록 */}
          {!isLoading && !error && (
            <>
              {filteredAndSortedTeams.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                    {searchTerm || filterBy !== 'all' ? (
                      <>
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          검색 결과가 없습니다
                        </h3>
                        <p className="text-gray-500 mb-6">
                          조건과 일치하는 팀을 찾을 수 없습니다.
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterBy('all');
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          전체 팀 보기
                        </button>
                      </>
                    ) : (
                      <>
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          아직 참여한 팀이 없습니다
                        </h3>
                        <p className="text-gray-500 mb-6">
                          새로운 팀을 만들거나 팀에 초대받아 협업을 시작해보세요
                        </p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          첫 번째 팀 만들기
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                  {filteredAndSortedTeams.map((team: Team) => {
                    const userRole = getUserRole(team);
                    const completionRate = team.todoStats.total > 0 
                      ? Math.round((team.todoStats.completed / team.todoStats.total) * 100)
                      : 0;
                    
                    return (
                      <div
                        key={team.id}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 relative group"
                        onClick={() => handleTeamClick(team.id)}
                      >
                        {/* 즐겨찾기 버튼 */}
                        <button
                          onClick={(e: React.MouseEvent) => handleToggleStar(team.id, e)}
                          className="absolute top-4 right-4 z-10 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star 
                            className={`w-5 h-5 transition-colors ${
                              team.isStarred 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-400 hover:text-yellow-500'
                            }`} 
                          />
                        </button>

                        {/* 팀 헤더 */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-bold text-gray-800 flex-1 line-clamp-2 pr-8">
                              {team.teamName}
                            </h3>
                            {userRole === 'LEADER' && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                <Crown className="w-3 h-3" />
                                리더
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {team.description || '팀 설명이 없습니다.'}
                          </p>

                          {/* 진행률 표시 */}
                          {team.todoStats.total > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>완료율</span>
                                <span>{completionRate}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${completionRate}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* 팀 통계 */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-blue-600">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">{team.members.length}명</span>
                            </div>
                            <div className="flex items-center gap-1 text-green-600">
                              <span>{team.todoStats.completed}</span>
                              <span className="text-gray-400">/{team.todoStats.total}</span>
                            </div>
                            {team.todoStats.overdue > 0 && (
                              <div className="flex items-center gap-1 text-red-600">
                                <Clock className="w-4 h-4" />
                                <span>{team.todoStats.overdue}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 팀 정보 */}
                        <div className="p-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                생성일
                              </span>
                              <span className="text-gray-700 font-medium">
                                {formatDate(team.createDate)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                최근 활동
                              </span>
                              <span className="text-gray-700 font-medium">
                                {formatRelativeTime(team.lastActivity)}
                              </span>
                            </div>
                          </div>

                          {/* 액션 버튼 */}
                          <div className="mt-6 pt-4 border-t border-gray-100">
                            <button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleTeamClick(team.id);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              팀 상세보기
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* 팀 생성 모달 */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
              <form onSubmit={handleCreateTeam}>
                {/* 모달 헤더 */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">새 팀 만들기</h2>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* 모달 내용 */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      팀 이름 *
                    </label>
                    <input
                      type="text"
                      value={newTeam.teamName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="팀 이름을 입력하세요"
                      maxLength={255}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      팀 설명
                    </label>
                    <textarea
                      value={newTeam.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTeam({ ...newTeam, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="팀에 대한 간단한 설명을 입력하세요 (선택사항)"
                      rows={3}
                      maxLength={1000}
                    />
                  </div>
                </div>

                {/* 모달 푸터 */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading || !newTeam.teamName.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {createLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        생성 중...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        팀 생성
                      </>
                    )}
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

export default TeamsPage;