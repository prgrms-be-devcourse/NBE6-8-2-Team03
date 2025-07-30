"use client";
import React, { useState, useEffect } from 'react';
import TodoListTemplate from "../_components/TodoList/TodoListTemplate";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  todoListId: number;
  todoListName: string;
}

interface TodoList {
  id: number;
  name: string;
  color: string;
  todos: Todo[];
}

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);

  // 샘플 데이터
  useEffect(() => {
    const sampleTodoLists: TodoList[] = [
      {
        id: 1,
        name: '개인 업무',
        color: '#4f46e5',
        todos: [
          { id: 1, title: '프로젝트 기획서 작성', completed: false, priority: 'high', todoListId: 1, todoListName: '개인 업무' },
          { id: 2, title: '회의 준비', completed: true, priority: 'medium', todoListId: 1, todoListName: '개인 업무' },
        ]
      },
      {
        id: 2,
        name: '프로젝트 A',
        color: '#059669',
        todos: [
          { id: 3, title: 'UI 디자인 리뷰', completed: false, priority: 'high', todoListId: 2, todoListName: '프로젝트 A' },
          { id: 4, title: '데이터베이스 설계', completed: false, priority: 'medium', todoListId: 2, todoListName: '프로젝트 A' },
        ]
      },
      {
        id: 3,
        name: '취미 활동',
        color: '#dc2626',
        todos: [
          { id: 5, title: '책 읽기', completed: true, priority: 'low', todoListId: 3, todoListName: '취미 활동' },
        ]
      }
    ];
    setTodoLists(sampleTodoLists);
  }, []);

  // 달력 관련 함수들
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return formatDate(date1) === formatDate(date2);
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  // 특정 날짜의 할일 가져오기 (실제 날짜별 데이터로 수정 예정)
  const getTodosForDate = (date: Date) => {
    // TODO: 실제 API 연동 시 날짜별 필터링 구현
    // 현재는 샘플 데이터로 모든 날짜에 동일하게 표시
    return todoLists;
  };

  // 특정 날짜의 할일 개수 가져오기
  const getTodoCountForDate = (date: Date) => {
    const todosForDate = getTodosForDate(date);
    return todosForDate.reduce((total, list) => total + list.todos.length, 0);
  };

  // 특정 날짜의 TodoList별 색상 정보 가져오기
  const getTodoColorsForDate = (date: Date) => {
    const todosForDate = getTodosForDate(date);
    return todosForDate.map(list => ({
      color: list.color,
      count: list.todos.length
    }));
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  // 월 이동
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // 할일 완료 토글
  const toggleTodoComplete = (todoId: number) => {
    setTodoLists(prev => 
      prev.map(list => ({
        ...list,
        todos: list.todos.map(todo => 
          todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
        )
      }))
    );
  };

  // 달력 렌더링
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // 빈 날짜들 (이전 달)
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // 실제 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const todoColors = getTodoColorsForDate(date);
      const totalTodos = todoColors.reduce((sum, item) => sum + item.count, 0);
      const isSelected = isSameDay(date, selectedDate);
      const todayClass = isToday(date) ? 'today' : '';
      const selectedClass = isSelected ? 'selected' : '';

      // TodoList별 색상 인디케이터 생성
      const colorIndicators = [];
      let remainingCount = 0;
      
      todoColors.forEach((item, index) => {
        for (let i = 0; i < item.count; i++) {
          if (colorIndicators.length < 3) {
            colorIndicators.push(
              <div 
                key={`${index}-${i}`} 
                className="todo-indicator" 
                style={{ backgroundColor: item.color }}
              />
            );
          } else {
            remainingCount++;
          }
        }
      });

      days.push(
        <div
          key={day}
          className={`calendar-day ${todayClass} ${selectedClass}`}
          onClick={() => handleDateClick(day)}
        >
          <div className="day-number">{day}</div>
          {totalTodos > 0 && (
            <div className="todo-indicators">
              {colorIndicators}
              {remainingCount > 0 && (
                <div className="todo-more">+{remainingCount}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const selectedDateTodos = getTodosForDate(selectedDate);

  return (
    <TodoListTemplate contentClassName="calendar-content">
      <div className="calendar-page">
        {/* 캘린더 섹션 */}
        <div className="calendar-section">
          <div className="calendar-header">
            <button 
              className="nav-button" 
              onClick={() => navigateMonth('prev')}
            >
              ←
            </button>
            <h2 className="calendar-title">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </h2>
            <button 
              className="nav-button" 
              onClick={() => navigateMonth('next')}
            >
              →
            </button>
          </div>
          
          <div className="calendar-grid">
            <div className="weekdays">
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            <div className="calendar-days">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* 할일 목록 섹션 */}
        <div className="todos-section">
          <div className="todos-header">
            <h3 className="todos-title">
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일의 할일
            </h3>
            <div className="todos-date">
              {selectedDate.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>

          <div className="todo-lists">
            {selectedDateTodos.length === 0 ? (
              <div className="no-todos">
                선택한 날짜에 할일이 없습니다.
              </div>
            ) : (
              selectedDateTodos.map(todoList => (
                <div key={todoList.id} className="todo-list-group">
                  <div className="todo-list-header">
                    <div 
                      className="todo-list-color" 
                      style={{ backgroundColor: todoList.color }}
                    ></div>
                    <h4 className="todo-list-name">{todoList.name}</h4>
                    <span className="todo-count">
                      {todoList.todos.filter(t => !t.completed).length} / {todoList.todos.length}
                    </span>
                  </div>
                  
                  <div className="todos">
                    {todoList.todos.map(todo => (
                      <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                        <label className="todo-checkbox">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodoComplete(todo.id)}
                          />
                          <span className="checkmark"></span>
                        </label>
                        <div className="todo-content">
                          <div className="todo-title">{todo.title}</div>
                          <div className={`todo-priority priority-${todo.priority}`}>
                            {todo.priority === 'high' ? '높음' : 
                             todo.priority === 'medium' ? '보통' : '낮음'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* 템플릿 강제 오버라이드 */
        .content {
          padding: 0.5rem !important;
          max-width: none !important;
          width: 100% !important;
        }
        
        .welcome-message {
          width: 100% !important;
          max-width: none !important;
        }
        
        .calendar-page {
          display: flex;
          gap: 1.5rem;
          height: calc(100vh - 120px);
          width: 100%;
          max-width: none;
          padding: 0;
          margin: 0;
        }

        .calendar-section {
          flex: 3;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f1f5f9;
          height: 100%;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f8fafc;
        }

        .nav-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.4rem;
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .nav-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .nav-button:active {
          transform: translateY(0);
        }

        .calendar-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center;
        }

        .calendar-grid {
          width: 100%;
        }

        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          margin-bottom: 1.5rem;
          padding: 0 4px;
        }

        .weekday {
          text-align: center;
          padding: 1rem 0;
          font-weight: 700;
          color: #475569;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 8px;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          padding: 4px;
        }

        .calendar-day {
          background: white;
          min-height: 120px;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          border: 2px solid transparent;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .calendar-day:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          border-color: #e0e7ff;
        }

        .calendar-day.today {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-color: #3b82f6;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .calendar-day.selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #4f46e5;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          transform: translateY(-3px);
        }

        .calendar-day.selected .day-number {
          color: white;
          font-weight: 700;
        }

        .calendar-day.empty {
          cursor: default;
          background: #f8fafc;
          opacity: 0.3;
          box-shadow: none;
        }

        .calendar-day.empty:hover {
          background: #f8fafc;
          transform: none;
          box-shadow: none;
        }

        .day-number {
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .todo-indicators {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-top: auto;
        }

        .todo-indicator {
          height: 4px;
          border-radius: 2px;
          opacity: 0.8;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          /* 색상은 인라인 스타일로 동적 적용 */
        }

        .calendar-day.selected .todo-indicator {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 1px 3px rgba(255, 255, 255, 0.3);
        }

        .todo-more {
          font-size: 0.75rem;
          color: #64748b;
          text-align: center;
          margin-top: 4px;
          font-weight: 600;
          background: rgba(100, 116, 139, 0.1);
          padding: 2px 6px;
          border-radius: 8px;
        }

        .calendar-day.selected .todo-more {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.2);
        }

        .todos-section {
          flex: 2;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f1f5f9;
          overflow-y: auto;
          height: 100%;
        }

        .todos-header {
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #f8fafc;
        }

        .todos-title {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.75rem;
        }

        .todos-date {
          color: #64748b;
          font-size: 0.9rem;
        }

        .todo-lists {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .no-todos {
          text-align: center;
          color: #64748b;
          padding: 2rem;
          font-style: italic;
        }

        .todo-list-group {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .todo-list-group:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .todo-list-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .todo-list-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }

        .todo-list-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          flex: 1;
        }

        .todo-count {
          font-size: 0.85rem;
          color: #64748b;
          background: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-weight: 500;
        }

        .todos {
          padding: 0.5rem;
        }

        .todo-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .todo-item:hover {
          background: #f8fafc;
        }

        .todo-item.completed {
          opacity: 0.6;
        }

        .todo-item.completed .todo-title {
          text-decoration: line-through;
        }

        .todo-checkbox {
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .todo-checkbox input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .checkmark {
          height: 20px;
          width: 20px;
          background-color: white;
          border: 2px solid #cbd5e1;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .todo-checkbox:hover .checkmark {
          border-color: #4f46e5;
        }

        .todo-checkbox input:checked ~ .checkmark {
          background-color: #4f46e5;
          border-color: #4f46e5;
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }

        .todo-checkbox input:checked ~ .checkmark:after {
          display: block;
        }

        .todo-checkbox .checkmark:after {
          left: 6px;
          top: 2px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .todo-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .todo-title {
          font-size: 0.9rem;
          color: #1e293b;
          font-weight: 500;
        }

        .todo-priority {
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-weight: 500;
        }

        .priority-high {
          background: #fef2f2;
          color: #dc2626;
        }

        .priority-medium {
          background: #fffbeb;
          color: #d97706;
        }

        .priority-low {
          background: #f0fdf4;
          color: #16a34a;
        }

        @media (max-width: 1024px) {
          .calendar-page {
            flex-direction: column;
            height: auto;
          }
          
          .calendar-section,
          .todos-section {
            flex: none;
          }
        }

        @media (max-width: 768px) {
          .calendar-page {
            gap: 1rem;
          }
          
          .calendar-section,
          .todos-section {
            padding: 1rem;
          }
          
          .calendar-day {
            min-height: 60px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </TodoListTemplate>
  );
};

export default CalendarPage;