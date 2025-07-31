'use client';

import React, { useState } from 'react';
import { Calendar, CheckSquare, Users, User, Plus, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto p-6 flex flex-col h-full">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">할일 관리</h1>
          <p className="text-gray-600">오늘도 효율적인 하루를 만들어보세요</p>
        </div>

        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-blue-100 rounded-xl shadow-lg p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  {currentCalendarDate.getFullYear()}년 {currentCalendarDate.getMonth() + 1}월
                </h2>
                <div className="flex gap-2">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => handleMonthChange('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => handleMonthChange('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 flex-grow">
                {calendarDays.map((date, index) => {
                  const summary = getTodoSummaryForDate(date);
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        relative p-3 text-sm rounded-lg transition-all duration-200
                        ${!isCurrentMonth(date) ? 'text-gray-300' : 'text-gray-700'}
                        ${isToday(date) ? 'bg-blue-100 font-bold text-blue-700' : 'hover:bg-blue-50'}
                        ${isSelectedDate(date) ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                        flex flex-col items-center justify-center
                      `}
                      style={{ aspectRatio: '1/1' }}
                    >
                      <div>{date.getDate()}</div>
                      {(summary.team > 0 || summary.personal > 0) && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {summary.team > 0 && (
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          )}
                          {summary.personal > 0 && (
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-blue-100 rounded-xl shadow-lg p-6 h-full flex flex-col justify-between">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 flex-shrink-0">
                <Clock className="w-5 h-5 text-orange-600" />
                {formatDate(selectedDate)}
              </h3>

              <div className="space-y-4 flex-grow flex flex-col justify-center">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">팀 할일</span>
                  </div>
                  <span className="text-sm font-bold text-green-700">
                    {selectedDateSummary.team}개
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">개인 할일</span>
                  </div>
                  <span className="text-sm font-bold text-purple-700">
                    {selectedDateSummary.personal}개
                  </span>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500 mt-4 flex-shrink-0">
                (완료되지 않은 할일 기준)
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-blue-100 rounded-xl shadow-lg p-6 h-full flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  팀 할일
                </h3>
                <button className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                  <Plus className="w-4 h-4" />
                  추가
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-grow">
                {todosForSelectedDateTeam.length > 0 ? (
                  todosForSelectedDateTeam.map(todo => (
                    <div key={todo.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <button
                        onClick={() => toggleTodo('team', todo.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          todo.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {todo.completed && <CheckSquare className="w-3 h-3" />}
                      </button>
                      <div className="flex-1">
                        <div className={`text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {todo.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          담당: {todo.assignee} | 마감: {todo.dueDate}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-sm mt-4">선택된 날짜에 팀 할일이 없습니다.</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-blue-100 rounded-xl shadow-lg p-6 h-full flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  개인 할일
                </h3>
                <button className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                  <Plus className="w-4 h-4" />
                  추가
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-grow">
                {todosForSelectedDatePersonal.length > 0 ? (
                  todosForSelectedDatePersonal.map(todo => (
                    <div key={todo.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <button
                        onClick={() => toggleTodo('personal', todo.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          todo.completed
                            ? 'bg-purple-500 border-purple-500 text-white'
                            : 'border-gray-300 hover:border-purple-500'
                        }`}
                      >
                        {todo.completed && <CheckSquare className="w-3 h-3" />}
                      </button>
                      <div className="flex-1">
                        <div className={`text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {todo.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          마감: {todo.dueDate}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-sm mt-4">선택된 날짜에 개인 할일이 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TodoListTemplate>
  );
}