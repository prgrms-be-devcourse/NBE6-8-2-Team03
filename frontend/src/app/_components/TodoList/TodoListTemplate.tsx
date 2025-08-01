"use client";
import React, { useState, useEffect } from 'react';
import './TodoListTemplate.css';
import NotificationDropdown, { NotificationButton } from './NotificationDropdown';
import UserProfileDropdown, { UserProfileButton } from './UserProfileDropdown';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';


interface ContentItem {
  title: string;
  description: string;
}

interface PropsWithChildren {
  children: React.ReactNode;
  contentClassName?: string; // 추가된 prop
}

const TodoListTemplate: React.FC<PropsWithChildren> = ({ 
  children, 
  contentClassName = '' 
}) => {

  useEffect(() => {
    // 로그아웃으로 인한 리다이렉트인지 확인
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogout = urlParams.get('logout') === 'true';
    
    const checkLogin = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/v1/user/me', {
          method: 'GET',
          credentials: 'include'
        });
        if (!res.ok) {
          window.location.href = 'http://localhost:3000/login';
        }
      } catch (err) {
        console.error('로그인 체크 실패:', err);
        window.location.href = 'http://localhost:3000/login';
      }
    };
    
    // 로그아웃으로 온 경우 약간 지연 후 체크
    if (fromLogout) {
      setTimeout(checkLogin, 500);
    } else {
      checkLogin();
    }
  }, []);

  
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
    // 환경변수 사용으로 하드코딩 제거
    const response = await fetch(`${API_BASE_URL}/api/v1/notifications/me`, {
      method: 'GET',
      credentials: 'include', // 쿠키 포함해서 요청
      headers: {
        'Content-Type': 'application/json',
        // 백엔드에서 api-key가 필요하다면 추가
        // 'api-key': getApiKey(), // 필요시 주석 해제
      },
      // CORS 설정 추가
      mode: 'cors',
    });
           
    if (!response.ok) {
      // HTTP 상태 코드별 세분화된 처리
      if (response.status === 401) {
        console.warn('인증이 필요합니다. 로그인을 확인해주세요.');
        setUnreadNotificationCount(0);
        return;
      } else if (response.status === 403) {
        console.warn('알림에 접근할 권한이 없습니다.');
        setUnreadNotificationCount(0);
        return;
      } else if (response.status >= 500) {
        console.warn('서버 오류가 발생했습니다:', response.status);
        setUnreadNotificationCount(0);
        return;
      } else {
        console.warn('알림 API 응답 실패:', response.status);
        setUnreadNotificationCount(0);
        return;
      }
    }

    const result: ApiResponse = await response.json();
    
    if (result.resultCode === '200-1') {
      // 타입 안전성 개선
      const notifications = result.data || [];
      const unreadCount = notifications.filter((notification: NotificationItem) => !notification.isRead).length;
      setUnreadNotificationCount(unreadCount);
      
      console.log(`읽지 않은 알림 ${unreadCount}개 확인됨`);
    } else {
      console.warn('알림 데이터 가져오기 실패:', result.msg || result.resultCode);
      setUnreadNotificationCount(0);
    }

  } catch (error) {
    console.error('알림 개수 가져오기 실패:', error);
    
    // 에러 타입별 세분화된 처리
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('네트워크 연결 오류 - 서버에 연결할 수 없습니다.');
    } else if (error instanceof SyntaxError) {
      console.error('응답 파싱 오류 - 서버에서 올바르지 않은 JSON을 반환했습니다.');
    }
    
    // 네트워크 오류나 서버 문제시 기본값 0으로 설정
    setUnreadNotificationCount(0);
  }
};

// API 키를 가져오는 헬퍼 함수 (필요시 사용)
const getApiKey = (): string => {
  return process.env.NEXT_PUBLIC_API_KEY || 
         localStorage.getItem('apiKey') || 
         getCookie('apiKey') || 
         '';
};

// 쿠키에서 값을 읽는 헬퍼 함수
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null; // SSR 환경 체크
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

  // 컴포넌트 마운트 시 읽지 않은 알림 개수 가져오기
  useEffect(() => {
    // 컴포넌트가 마운트된 후 약간의 지연을 두고 알림 개수 가져오기
    // 로그인 체크가 완료된 후 실행되도록 함
    const timer = setTimeout(() => {
      updateUnreadCount();
    }, 1000);

    return () => clearTimeout(timer);
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