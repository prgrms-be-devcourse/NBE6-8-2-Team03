'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckSquare,
  Users,
  User,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Target,
} from 'lucide-react';
import TodoListTemplate from "../_components/TodoList/TodoListTemplate";

interface TeamTodo {
  id: number;
  title: string;
  completed: boolean;
  assignee: string;
  dueDate: string; // 'YYYY-MM-DD'
}

interface PersonalTodo {
  id: number;
  title: string;
  completed: boolean;
  dueDate: string; // 'YYYY-MM-DD'
}

// API DTOs
interface ApiTodoItem {
  id: number;
  title: string;
  description: string;
  priority: number;
  startDate: string; // ISO
  dueDate: string; // ISO
  todoList: number;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
}

interface ApiTodoList {
  id: number;
  name: string;
  description: string;
  userId: number;
  teamId: number | null;
  createDate: string;
  modifyDate: string;
  todo: ApiTodoItem[];
}

interface ApiResponse {
  resultCode: string;
  msg: string;
  data: ApiTodoList[];
}

const formatISOToYMD = (iso: string) => {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function MainPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(today);

  const [teamTodos, setTeamTodos] = useState<TeamTodo[]>([]);
  const [personalTodos, setPersonalTodos] = useState<PersonalTodo[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8080/api/todo-lists/me', {
        credentials: 'include', // 쿠키 포함
      });

      if (res.status === 401) {
        window.location.href = '/login'; // 인증 실패시 로그인 페이지로 이동
        return;
      }

      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

      const json: ApiResponse = await res.json();

      const newTeamTodos: TeamTodo[] = [];
      const newPersonalTodos: PersonalTodo[] = [];

      json.data.forEach((list) => {
        list.todo.forEach((item) => {
          const common = {
            id: item.id,
            title: item.title,
            completed: item.completed,
            dueDate: formatISOToYMD(item.dueDate),
          };
          if (list.teamId === 1) {
            newPersonalTodos.push(common);
          } else  {
            newTeamTodos.push({
              ...common,
              assignee: list.name || '알 수 없음',
            });
          }
        });
      });

      setTeamTodos(newTeamTodos);
      setPersonalTodos(newPersonalTodos);
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const generateCalendar = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const getTodoSummaryForDate = (date: Date) => {
    const dateStr = formatISOToYMD(date.toISOString());
    const teamCount = teamTodos.filter(todo => todo.dueDate === dateStr && !todo.completed).length;
    const personalCount = personalTodos.filter(todo => todo.dueDate === dateStr && !todo.completed).length;
    return { team: teamCount, personal: personalCount };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentCalendarDate.getMonth();
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const toggleTodo = async (type: 'team' | 'personal', id: number) => {
    const isTeam = type === 'team';

    // 로컬 상태 optimistic update
    if (isTeam) {
      setTeamTodos(prev => prev.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    } else {
      setPersonalTodos(prev => prev.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    }

    try {
      const currentCompleted = isTeam
        ? teamTodos.find(t => t.id === id)?.completed
        : personalTodos.find(t => t.id === id)?.completed;

      // toggle 했으니 반대값을 보냄
      const newCompleted = currentCompleted === undefined ? true : !currentCompleted;

      const res = await fetch(`http://localhost:8080/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({ completed: newCompleted }),
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

    } catch (e: any) {
      setError('할일 상태 업데이트 실패');
      // 롤백 처리
      if (isTeam) {
        setTeamTodos(prev => prev.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
      } else {
        setPersonalTodos(prev => prev.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
      }
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentCalendarDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const calendarDays = generateCalendar();
  const selectedDateSummary = getTodoSummaryForDate(selectedDate);

  const todosForSelectedDateTeam = teamTodos.filter(todo =>
    todo.dueDate === formatISOToYMD(selectedDate.toISOString())
  );
  const todosForSelectedDatePersonal = personalTodos.filter(todo =>
    todo.dueDate === formatISOToYMD(selectedDate.toISOString())
  );

  return (
    <TodoListTemplate>
      <div className="max-w-7xl mx-auto p-6 flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* 헤더 섹션 */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                할일 관리
              </h1>
              <p className="text-gray-600 mt-1">효율적인 하루를 위한 스마트 플래너</p>
            </div>
          </div>
        </div>

        {/* 로딩 / 에러 */}
        {loading && (
          <div className="text-center mb-4">
            <p className="text-gray-600">할일을 불러오는 중입니다...</p>
          </div>
        )}
        {error && (
          <div className="text-center mb-4 text-red-600">
            <p>{error}</p>
          </div>
        )}

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-8 h-[400px]">
          {/* 캘린더 섹션 */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  {currentCalendarDate.getFullYear()}년 {currentCalendarDate.getMonth() + 1}월
                </h2>
                <div className="flex gap-2">
                  <button
                    className="p-3 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105"
                    onClick={() => handleMonthChange('prev')}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    className="p-3 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105"
                    onClick={() => handleMonthChange('next')}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4 flex-shrink-0">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                  <div key={day} className={`text-center text-sm font-semibold py-3 rounded-lg ${
                    index === 0 ? 'text-red-500 bg-red-50' :
                    index === 6 ? 'text-blue-500 bg-blue-50' :
                    'text-gray-600 bg-gray-50'
                  }`}>
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 flex-grow">
                {calendarDays.map((date, index) => {
                  const summary = getTodoSummaryForDate(date);
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        relative p-2 text-sm rounded-xl transition-all duration-300 transform hover:scale-105
                        ${!isCurrentMonth(date) ? 'text-gray-300 bg-gray-50' : 'text-gray-700 bg-white shadow-sm hover:shadow-md'}
                        ${isToday(date) ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg' : ''}
                        ${isSelectedDate(date) && !isToday(date) ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg' : ''}
                        flex flex-col items-center justify-center border border-gray-100
                      `}
                      style={{ aspectRatio: '1/1' }}
                    >
                      <div className="font-medium">{date.getDate()}</div>
                      {(summary.team > 0 || summary.personal > 0) && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {summary.team > 0 && (
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-sm"></div>
                          )}
                          {summary.personal > 0 && (
                            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full shadow-sm"></div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 팀 할일 섹션 */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 h-full flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  팀 할일
                </h3>
            
              </div>

              <div className="mb-4 text-center bg-emerald-50 rounded-xl p-4">
                <h4 className="text-lg font-bold text-emerald-800 mb-2">
                  {formatDate(selectedDate)}
                </h4>
                <div className="text-lg font-bold text-emerald-600">
                  {selectedDateSummary.team}개의 할일
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto flex-grow min-h-[100px]">
                {todosForSelectedDateTeam.length > 0 ? (
                  todosForSelectedDateTeam.map(todo => (
                    <div key={todo.id} className="group bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-emerald-200">
                      <div className="flex items-start gap-3">
                        {/* <button
                          onClick={() => toggleTodo('team', todo.id)}
                          className={`mt-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            todo.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                              : 'border-gray-300 hover:border-emerald-500 hover:shadow-sm'
                          }`}
                        >
                          {todo.completed && <CheckSquare className="w-3 h-3" />}
                        </button> */}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {todo.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {todo.assignee}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {todo.dueDate}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">선택된 날짜에 팀 할일이 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 개인 할일 섹션 */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 h-full flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-violet-500 rounded-xl">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  개인 할일
                </h3>

              </div>

              <div className="mb-4 text-center bg-violet-50 rounded-xl p-4">
                <h4 className="text-lg font-bold text-violet-800 mb-2">
                  {formatDate(selectedDate)}
                </h4>
                <div className="text-lg font-bold text-violet-600">
                  {selectedDateSummary.personal}개의 할일
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto flex-grow min-h-[100px]">
                {todosForSelectedDatePersonal.length > 0 ? (
                  todosForSelectedDatePersonal.map(todo => (
                    <div key={todo.id} className="group bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-violet-200">
                      <div className="flex items-start gap-3">
                        {/* <button
                          onClick={() => toggleTodo('personal', todo.id)}
                          className={`mt-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            todo.completed
                              ? 'bg-violet-500 border-violet-500 text-white shadow-md'
                              : 'border-gray-300 hover:border-violet-500 hover:shadow-sm'
                          }`}
                        >
                          {todo.completed && <CheckSquare className="w-3 h-3" />}
                        </button> */}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {todo.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {todo.dueDate}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">선택된 날짜에 개인 할일이 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TodoListTemplate>
  );
}
