"use client";
import React, { useState, useEffect } from 'react';
import './TodoListTemplate.css';
import NotificationDropdown, { NotificationButton } from './NotificationDropdown';
import UserProfileDropdown, { UserProfileButton } from './UserProfileDropdown';

interface ContentItem {
  title: string;
  description: string;
}

interface PropsWithChildren {
  children: React.ReactNode;
  contentClassName?: string; 
}
interface PropsWithChildren {
  children: React.ReactNode;
  contentClassName?: string; // 추가된 prop
}

const TodoListTemplate: React.FC<PropsWithChildren> = ({ 
  children, 
  contentClassName = '' 
}) => {

const TodoListTemplate: React.FC<PropsWithChildren> = ({ 
  children, 
  contentClassName = '' 
}) => {
  const [activeNavItem, setActiveNavItem] = useState<string>('project-a');
  const [activeProject, setActiveProject] = useState<string>('');
  const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  
  // 읽지 않은 알림 개수 (NotificationButton용)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);

  // 사용자 정보
  const userInfo = {
    name: "개발자님",
    email: "developer@example.com", 
    joinDate: "2024.01.15",
    role: "Frontend Developer",
    department: "개발팀"
  };

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

  // 읽지 않은 알림 개수 업데이트 (초기 로드용)
  const updateUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/notifications');
      if (response.ok) {
        const result = await response.json();
        if (result.resultCode === '200-1') {
          const unreadCount = result.data.filter((n: any) => !n.isRead).length;
          setUnreadNotificationCount(unreadCount);
        }
      }
    } catch (error) {
      console.error('알림 개수 가져오기 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 읽지 않은 알림 개수 가져오기
  useEffect(() => {
    updateUnreadCount();
  }, []);

  const toggleDropdown = (dropdownType: 'notification' | 'profile') => {
    if (dropdownType === 'notification') {
      setShowNotificationDropdown(!showNotificationDropdown);
      setShowProfileDropdown(false);
      // 알림 드롭다운을 열 때 개수 업데이트
      if (!showNotificationDropdown) {
        updateUnreadCount();
      }
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
            {showNotificationDropdown ? (
              <NotificationDropdown 
                isOpen={showNotificationDropdown}
                onClose={() => setShowNotificationDropdown(false)}
              />
            ) : (
              <NotificationButton 
                unreadCount={unreadNotificationCount}
                onClick={() => toggleDropdown('notification')}
              />
            )}
          </div>

          {/* 유저 프로필 드롭다운 */}
          <div className="dropdown">
            {showProfileDropdown ? (
              <UserProfileDropdown 
                isOpen={showProfileDropdown}
                onClose={() => setShowProfileDropdown(false)}
                userName={userInfo.name}
                userInfo={userInfo}
              />
            ) : (
              <UserProfileButton 
                onClick={() => toggleDropdown('profile')}
              />
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

        {/* 메인 콘텐츠 - contentClassName prop 적용 */}
        <main className={`content ${contentClassName}`}>
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