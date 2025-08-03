'use client';

import React, { useState } from 'react';
import { Calendar, CheckSquare, Users, User, Plus, Clock, ChevronLeft, ChevronRight, Target, TrendingUp } from 'lucide-react';
import TodoListTemplate from "../_components/TodoList/TodoListTemplate";

interface TeamTodo {
  id: number;
  title: string;
  completed: boolean;
  assignee: string;
  dueDate: string;
}

interface PersonalTodo {
  id: number;
  title: string;
  completed: boolean;
  dueDate: string;
}

//main page
export default function MainPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(today);

  const [teamTodos, setTeamTodos] = useState<TeamTodo[]>([
    { id: 1, title: '프로젝트 기획서 검토', completed: false, assignee: '김철수', dueDate: '2025-07-31' },
    { id: 2, title: '디자인 시안 피드백', completed: false, assignee: '이영희', dueDate: '2025-07-30' },
    { id: 3, title: '개발 일정 조율', completed: false, assignee: '박민수', dueDate: '2025-08-02' },
    { id: 4, title: '데모 준비', completed: false, assignee: '최영수', dueDate: '2025-07-31' },
    { id: 5, title: '문서화 작업', completed: true, assignee: '김철수', dueDate: '2025-07-29' },
    { id: 6, title: '백엔드 API 연동 테스트', completed: false, assignee: '박민수', dueDate: '2025-08-05' },
    { id: 7, title: '프론트엔드 컴포넌트 개발', completed: false, assignee: '이영희', dueDate: '2025-08-03' },
  ]);

  const [personalTodos, setPersonalTodos] = useState<PersonalTodo[]>([
    { id: 1, title: '일일 리포트 작성', completed: false, dueDate: '2025-07-31' },
    { id: 2, title: '회의 자료 준비', completed: false, dueDate: '2025-08-01' },
    { id: 3, title: '코드 리뷰', completed: true, dueDate: '2025-07-30' },
    { id: 4, title: '문서 업데이트', completed: false, dueDate: '2025-08-02' },
    { id: 5, title: '자기계발 학습', completed: false, dueDate: '2025-07-31' },
    { id: 6, title: '운동하기', completed: false, dueDate: '2025-07-31' },
    { id: 7, title: '블로그 글 작성', completed: false, dueDate: '2025-08-04' },
  ]);

  const generateCalendar = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getTodoSummaryForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
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

  const toggleTodo = (type: 'team' | 'personal', id: number) => {
    if (type === 'team') {
      setTeamTodos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } else {
      setPersonalTodos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
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
    todo.dueDate === selectedDate.toISOString().split('T')[0]
  );
  const todosForSelectedDatePersonal = personalTodos.filter(todo =>
    todo.dueDate === selectedDate.toISOString().split('T')[0]
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
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm">
                  <Plus className="w-4 h-4" />
                  추가
                </button>
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
                        <button
                          onClick={() => toggleTodo('team', todo.id)}
                          className={`mt-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            todo.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                              : 'border-gray-300 hover:border-emerald-500 hover:shadow-sm'
                          }`}
                        >
                          {todo.completed && <CheckSquare className="w-3 h-3" />}
                        </button>
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
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm">
                  <Plus className="w-4 h-4" />
                  추가
                </button>
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
                        <button
                          onClick={() => toggleTodo('personal', todo.id)}
                          className={`mt-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            todo.completed
                              ? 'bg-violet-500 border-violet-500 text-white shadow-md'
                              : 'border-gray-300 hover:border-violet-500 hover:shadow-sm'
                          }`}
                        >
                          {todo.completed && <CheckSquare className="w-3 h-3" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {todo.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {todo.dueDate}
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