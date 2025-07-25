"use client";
import React, { useState } from 'react';
import './TodoListTemplate.css';
import { Props } from 'next/script';

interface NotificationItem {
  title: string;
  text: string;
  time: string;
}

interface ContentItem {
  title: string;
  description: string;
}

const TodoListTemplate: React.FC = ({children}: Props) => {
  const [activeNavItem, setActiveNavItem] = useState<string>('project-a');
  const [activeProject, setActiveProject] = useState<string>('');
  const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);

  const notifications: NotificationItem[] = [
    {
      title: '새로운 업무 할당',
      text: '프로젝트 A에 새로운 업무가 할당되었습니다.',
      time: '2분 전'
    },
    {
      title: '마감일 알림',
      text: '개발팀 Sprint 24의 마감일이 내일입니다.',
      time: '1시간 전'
    },
    {
      title: '팀 멤버 초대',
      text: '마케팅 Q2 프로젝트에 새로운 멤버가 참여했습니다.',
      time: '3시간 전'
    }
  ];

  const contentMap: Record<string, ContentItem> = {
    'inbox': {
      title: '개인 업무',
      description: '개인 업무 목록을 관리하는 공간입니다.\n총 5개의 할일이 있습니다.'
    },
    'project-a': {
      title: '프로젝트 A',
      description: '프로젝트 A 관련 업무를 관리합니다.\n총 8개의 할일이 진행 중입니다.'
    },
    'activities': {
      title: '취미 활동',
      description: '개인적인 취미 활동 계획을 관리합니다.\n총 3개의 활동이 예정되어 있습니다.'
    },
    'sprint24': {
      title: '개발팀 - Sprint 24',
      description: '개발팀의 스프린트 24 업무를 관리합니다.\n총 12개의 개발 태스크가 있습니다.'
    },
    'marketing-q2': {
      title: '마케팅 - Q2',
      description: '2분기 마케팅 캠페인을 관리합니다.\n총 7개의 마케팅 업무가 진행 중입니다.'
    }
  };

  const toggleDropdown = (dropdownType: 'notification' | 'profile') => {
    if (dropdownType === 'notification') {
      setShowNotificationDropdown(!showNotificationDropdown);
      setShowProfileDropdown(false);
    } else {
      setShowProfileDropdown(!showProfileDropdown);
      setShowNotificationDropdown(false);
    }
  };

  const selectNavItem = (itemId: string) => {
    setActiveNavItem(itemId);
    setActiveProject('');
  };

  const selectProject = (projectId: string) => {
    setActiveProject(projectId);
    setActiveNavItem('');
  };

  const showProfileSummary = () => {
    alert('프로필 요약: 개발자님\n이메일: developer@example.com\n가입일: 2024.01.15');
    setShowProfileDropdown(false);
  };

  const goToProfileEdit = () => {
    alert('프로필 수정 페이지로 이동합니다.');
    setShowProfileDropdown(false);
  };

  const logout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      alert('로그아웃 되었습니다.');
    }
    setShowProfileDropdown(false);
  };

  const getCurrentContent = (): ContentItem => {
    const currentId = activeNavItem || activeProject;
    return contentMap[currentId] || contentMap['project-a'];
  };

  // 외부 클릭 처리
  const handleOutsideClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      setShowNotificationDropdown(false);
      setShowProfileDropdown(false);
    }
  };

  // ESC 키 처리
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotificationDropdown(false);
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  const currentContent = getCurrentContent();

  return (
    <div className="todo-app" onClick={handleOutsideClick}>
      {/* 헤더 */}
      <header className="header">
        <div className="logo">TodoList</div>
        <div className="header-actions">
          {/* 알림 드롭다운 */}
          <div className="dropdown">
            <button 
              className="header-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('notification');
              }}
              title="알림"
            >
              🔔
            </button>
            {showNotificationDropdown && (
              <div className="dropdown-content show">
                <div className="dropdown-header">알림</div>
                {notifications.map((notification, index) => (
                  <div key={index} className="notification-item">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-text">{notification.text}</div>
                    <div className="notification-time">{notification.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 유저 프로필 드롭다운 */}
          <div className="dropdown">
            <button 
              className="header-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('profile');
              }}
              title="프로필"
            >
              👤
            </button>
            {showProfileDropdown && (
              <div className="dropdown-content show">
                <div className="dropdown-header">개발자님</div>
                <button className="dropdown-item" onClick={showProfileSummary}>
                  프로필 요약
                </button>
                <button className="dropdown-item" onClick={goToProfileEdit}>
                  프로필 수정
                </button>
                <button className="dropdown-item logout" onClick={logout}>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨테이너 */}
      <div className="main-container">
        {/* 사이드바 */}
        <aside className="sidebar">
          {/* 개인 리스트 섹션 */}
          <div className="sidebar-section">
            <div className="section-title">개인 리스트</div>
            <nav className="sidebar-nav">
              <button 
                className={`nav-item ${activeNavItem === 'inbox' ? 'active' : ''}`}
                onClick={() => selectNavItem('inbox')}
              >
                <div className="item-left">
                  <span>📥</span>
                  <span>개인 업무</span>
                </div>
                <span className="item-count">5</span>
              </button>
              <button 
                className={`nav-item ${activeNavItem === 'project-a' ? 'active' : ''}`}
                onClick={() => selectNavItem('project-a')}
              >
                <div className="item-left">
                  <span>📋</span>
                  
                  <span>프로젝트 A</span>
                </div>
                <span className="item-count">8</span>
              </button>
              <button 
                className={`nav-item ${activeNavItem === 'activities' ? 'active' : ''}`}
                onClick={() => selectNavItem('activities')}
              >
                <div className="item-left">
                  <span>⚡</span>
                  <span>취미 활동</span>
                </div>
                <span className="item-count">3</span>
              </button>
            </nav>
          </div>

          {/* 팀 리스트 섹션 */}
          <div className="sidebar-section">
            <div className="section-title">팀 리스트</div>
            <div className="sidebar-nav">
              <div 
                className={`project-item ${activeProject === 'sprint24' ? 'active-project' : ''}`}
                onClick={() => selectProject('sprint24')}
              >
                <div className="project-info">
                  <span className="project-icon">🚀</span>
                  <span className="project-name">개발팀 - Sprint 24</span>
                </div>
                <span className="project-count">12</span>
              </div>
              <div 
                className={`project-item ${activeProject === 'marketing-q2' ? 'active-project' : ''}`}
                onClick={() => selectProject('marketing-q2')}
              >
                <div className="project-info">
                  <span className="project-icon">📊</span>
                  <span className="project-name">마케팅 - Q2</span>
                </div>
                <span className="project-count">7</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="content">
          <div className="welcome-message">
          {children}
          </div>
        </main>
      </div>

      {/* 푸터 */}
      <footer className="footer">
        <p>&copy; 2025 TodoList. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TodoListTemplate;