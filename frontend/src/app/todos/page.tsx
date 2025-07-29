'use client';

import React, { useState } from 'react';

interface Todo {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  start_date: string;
  due_date: string;
  todo_list_id: number;
  created_at: string;
  updated_at: string;
}

type TodoData = {
  [key: string]: Todo[];
};

export default function TodoPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('개인업무');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const todoData: TodoData = {
    '개인업무': [
      {
        id: 1,
        title: '개인 블로그 포스팅',
        description: '최근 학습한 React Hooks에 대한 내용을 정리하여 블로그에 포스팅하기',
        is_completed: false,
        priority: 'medium',
        start_date: '2024-01-15',
        due_date: '2024-01-20',
        todo_list_id: 1,
        created_at: '2024-01-15 09:00:00',
        updated_at: '2024-01-15 09:00:00'
      },
      {
        id: 2,
        title: '운동 계획 세우기',
        description: '새해 건강 관리를 위한 주간 운동 스케줄 작성',
        is_completed: true,
        priority: 'low',
        start_date: '2024-01-10',
        due_date: '2024-01-12',
        todo_list_id: 1,
        created_at: '2024-01-10 08:00:00',
        updated_at: '2024-01-12 20:30:00'
      },
      {
        id: 3,
        title: '독서 목록 정리',
        description: '올해 읽을 책 목록을 정리하고 우선순위 설정하기',
        is_completed: false,
        priority: 'low',
        start_date: '2024-01-18',
        due_date: '2024-01-25',
        todo_list_id: 1,
        created_at: '2024-01-18 10:15:00',
        updated_at: '2024-01-18 10:15:00'
      }
    ],
    '프로젝트 A': [
      {
        id: 4,
        title: 'API 설계 문서 작성',
        description: '사용자 인증 및 데이터 관리를 위한 REST API 설계 문서 작성',
        is_completed: false,
        priority: 'high',
        start_date: '2024-01-16',
        due_date: '2024-01-19',
        todo_list_id: 2,
        created_at: '2024-01-16 09:30:00',
        updated_at: '2024-01-16 09:30:00'
      },
      {
        id: 5,
        title: '프론트엔드 컴포넌트 구현',
        description: '로그인, 회원가입, 대시보드 페이지의 React 컴포넌트 구현',
        is_completed: false,
        priority: 'high',
        start_date: '2024-01-20',
        due_date: '2024-01-25',
        todo_list_id: 2,
        created_at: '2024-01-20 08:45:00',
        updated_at: '2024-01-20 08:45:00'
      },
      {
        id: 6,
        title: '데이터베이스 스키마 설계',
        description: 'MySQL 데이터베이스 테이블 구조 설계 및 관계 정의',
        is_completed: true,
        priority: 'high',
        start_date: '2024-01-12',
        due_date: '2024-01-15',
        todo_list_id: 2,
        created_at: '2024-01-12 14:20:00',
        updated_at: '2024-01-15 16:40:00'
      }
    ],
    '취미활동': [
      {
        id: 7,
        title: '기타 연주 연습',
        description: '새로운 곡 연주를 위한 기타 연습 - Canon in D',
        is_completed: false,
        priority: 'low',
        start_date: '2024-01-17',
        due_date: '2024-01-31',
        todo_list_id: 3,
        created_at: '2024-01-17 19:00:00',
        updated_at: '2024-01-17 19:00:00'
      },
      {
        id: 8,
        title: '사진 편집 강의 수강',
        description: 'Adobe Lightroom 기초 강의 수강 및 실습',
        is_completed: false,
        priority: 'medium',
        start_date: '2024-01-22',
        due_date: '2024-02-05',
        todo_list_id: 3,
        created_at: '2024-01-22 11:30:00',
        updated_at: '2024-01-22 11:30:00'
      }
    ]
  };

  const todos = todoData[selectedCategory] || [];

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSelectedTodo(null);
  };

  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
  };

  const handleCheckboxChange = (todoId: number) => {
    console.log(`Toggle todo ${todoId} completion status`);
  };

  const handleEdit = () => {
    if (selectedTodo) {
      console.log(`Edit todo ${selectedTodo.id}`);
    }
  };

  const handleDelete = () => {
    if (selectedTodo) {
      console.log(`Delete todo ${selectedTodo.id}`);
      setSelectedTodo(null);
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-blue-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return { label: '높음', color: 'bg-red-100 text-red-600' };
      case 'medium':
        return { label: '중간', color: 'bg-yellow-100 text-yellow-600' };
      case 'low':
        return { label: '낮음', color: 'bg-blue-100 text-blue-600' };
      default:
        return { label: '일반', color: 'bg-gray-100 text-gray-600' };
    }
  };

  return (
    <div className="bg-white text-black min-h-screen flex">
      {/* 고정 헤더 */}
      <div className="fixed top-0 right-0 p-5 flex gap-3 z-10">
        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200">
          🔔
        </div>
        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200">
          👤
        </div>
      </div>

      {/* 고정 사이드바 */}
      <aside className="w-72 bg-white border-r border-gray-200 py-6 shadow fixed h-full overflow-y-auto">
        <div className="px-6 pb-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">ToDo</h1>
        </div>
        <section className="py-6">
          <div className="text-xs font-bold text-gray-500 uppercase px-6 mb-3">개인 리스트</div>
          <div className="flex flex-col gap-1">
            <div 
              className={`flex items-center justify-between px-6 py-3 cursor-pointer rounded ${selectedCategory === '개인업무' ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-100'}`}
              onClick={() => handleCategoryClick('개인업무')}
            >
              <span className="font-medium">개인 업무</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedCategory === '개인업무' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
            </div>
            <div 
              className={`flex items-center justify-between px-6 py-3 cursor-pointer rounded ${selectedCategory === '프로젝트 A' ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-100'}`}
              onClick={() => handleCategoryClick('프로젝트 A')}
            >
              <span className="font-medium">프로젝트 A</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedCategory === '프로젝트 A' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
            </div>
            <div 
              className={`flex items-center justify-between px-6 py-3 cursor-pointer rounded ${selectedCategory === '취미활동' ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-100'}`}
              onClick={() => handleCategoryClick('취미활동')}
            >
              <span className="font-medium">취미 활동</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedCategory === '취미활동' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
            </div>
          </div>
        </section>
        <section className="py-6">
          <div className="text-xs font-bold text-gray-500 uppercase px-6 mb-3">팀 리스트</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-gray-100 rounded">
              <span className="font-medium">🚀 개발팀 - Sprint 24</span>
              <span className="bg-gray-200 text-gray-500 px-2 py-1 rounded-full text-xs font-semibold">12</span>
            </div>
            <div className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-gray-100 rounded">
              <span className="font-medium">📊 마케팅팀 - Q2</span>
              <span className="bg-gray-200 text-gray-500 px-2 py-1 rounded-full text-xs font-semibold">7</span>
            </div>
          </div>
        </section>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 ml-72 pt-16 flex">
        {/* 왼쪽: 투두 리스트 */}
        <div className="w-1/2 p-6 border-r border-gray-200">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedCategory}</h1>
            <p className="text-gray-500">{selectedCategory} 관련 할 일들을 관리합니다.</p>
          </div>
          
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${getPriorityBorder(todo.priority)} ${selectedTodo?.id === todo.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleTodoClick(todo)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={todo.is_completed}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCheckboxChange(todo.id);
                    }}
                    className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <h3 className={`font-semibold ${todo.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {todo.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {todo.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityLabel(todo.priority).color}`}>
                        {getPriorityLabel(todo.priority).label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {todo.due_date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 상세/편집 */}
        <div className="w-1/2 p-6">
          {selectedTodo ? (
            <div className="bg-white rounded-lg p-6 shadow-sm h-fit">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedTodo.is_completed}
                    onChange={() => handleCheckboxChange(selectedTodo.id)}
                    className="w-6 h-6 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <h2 className={`text-xl font-bold ${selectedTodo.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {selectedTodo.title}
                    </h2>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={handleEdit}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                  >
                    삭제
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedTodo.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                    <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${getPriorityLabel(selectedTodo.priority).color}`}>
                      {getPriorityLabel(selectedTodo.priority).label}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                    <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${selectedTodo.is_completed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {selectedTodo.is_completed ? '완료' : '진행중'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                    <p className="text-gray-600">{selectedTodo.start_date}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                    <p className="text-gray-600">{selectedTodo.due_date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">생성일</label>
                    <p className="text-gray-600 text-sm">{selectedTodo.created_at}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">수정일</label>
                    <p className="text-gray-600 text-sm">{selectedTodo.updated_at}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 shadow-sm h-96 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-4">📝</div>
                <p>할 일을 선택하면 상세 정보가 표시됩니다.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
