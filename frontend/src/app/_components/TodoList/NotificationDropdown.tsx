"use client";
import React, { useState, useEffect } from 'react';

interface NotificationItem {
  id: number;
  user: any;
  title: string | null;
  description: string | null;
  url: string | null;
  isRead: boolean;
}

interface ApiResponse {
  resultCode: string;
  msg: string;
  data: NotificationItem[];
}

type NotificationFilter = 'all' | 'unread';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>('unread');
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // API 기본 URL (환경변수 사용 권장)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // 알림 데이터 가져오기
  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Authorization 헤더 제거 (쿠키로 인증하므로 불필요)
        },
        mode: 'cors',
        credentials: 'include', // 쿠키 전송을 위해 필수
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          // 인증 실패 처리
          throw new Error('로그인이 필요합니다.');
        } else if (response.status === 403) {
          // 권한 없음
          throw new Error('알림에 접근할 권한이 없습니다.');
        } else if (response.status === 404) {
          // 리소스 없음
          throw new Error('알림 서비스를 찾을 수 없습니다.');
        } else if (response.status >= 500) {
          // 서버 오류
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
  
      const result: ApiResponse = await response.json();
      
      if (result.resultCode === '200-1') {
        setNotifications(result.data || []);
      } else {
        throw new Error(result.msg || '알 수 없는 API 오류');
      }
      
    } catch (error) {
      console.error('알림을 가져오는데 실패했습니다:', error);
      
      // 에러 타입별 처리
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setError('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('알림을 가져오는데 실패했습니다.');
      }
      
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  };
  

  // 컴포넌트 마운트 시 알림 데이터 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // 필터된 알림 목록 계산
  const filteredNotifications = notifications.filter(notification => {
    if (notificationFilter === 'unread') {
      return !notification.isRead;
    }
    return true;
  });

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 알림 읽음 상태 변경 처리 (읽지 않음 -> 읽음으로만)
  const handleNotificationReadToggle = async (notification: NotificationItem) => {
    // 이미 읽은 알림은 변경하지 않음
    if (notification.isRead) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/notifications/setStatus/${notification.id}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            // 필요시 인증 헤더 추가
            // 'Authorization': `Bearer ${token}`,
          },
          mode: 'cors',
          credentials: 'include',
        }
      );
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id 
              ? { ...n, isRead: true }
              : n
          )
        );
        console.log('알림 읽음 처리 완료:', notification.id);
      } else {
        console.error('읽음 처리 실패:', response.status);
        setError(`읽음 처리 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('읽음 처리 API 호출 오류:', error);
      setError('읽음 처리 중 오류가 발생했습니다.');
    }
  };

  // 페이지 이동 처리
  const handleNotificationNavigate = (notification: NotificationItem) => {
    if (notification.url) {
      window.open(notification.url, '_blank');
    } else {
      alert('이동할 URL이 없습니다.');
    }
  };

  // 더블클릭 처리 (읽음 상태로만 변경)
  const handleNotificationDoubleClick = async (notification: NotificationItem) => {
    // 더블클릭 시 읽음 처리만
    if (!notification.isRead) {
      await handleNotificationReadToggle(notification);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <button 
        className="header-btn notification-btn"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        title="알림"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      <div className="dropdown-content notification-dropdown show">
        <div className="dropdown-header">
          <span>알림</span>
          <button 
            className="refresh-btn"
            onClick={fetchNotifications}
            disabled={isLoadingNotifications}
            title="새로고침"
          >
            🔄
          </button>
        </div>
        
        {/* 에러 메시지 표시 */}
        {error && (
          <div className="notification-error" style={{ 
            padding: '10px', 
            backgroundColor: '#fee', 
            color: '#c33', 
            margin: '5px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {error}
          </div>
        )}
        
        {/* 필터 버튼들 */}
        <div className="notification-filters">
          <button 
            className={`filter-btn ${notificationFilter === 'unread' ? 'active' : ''}`}
            onClick={() => setNotificationFilter('unread')}
          >
            읽지 않음 ({unreadCount})
          </button>
          <button 
            className={`filter-btn ${notificationFilter === 'all' ? 'active' : ''}`}
            onClick={() => setNotificationFilter('all')}
          >
            전체 ({notifications.length})
          </button>
        </div>

        {/* 알림 목록 */}
        <div className="notification-list">
          {isLoadingNotifications ? (
            <div className="notification-loading">로딩 중...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notification-empty">
              {notificationFilter === 'unread' ? '읽지 않은 알림이 없습니다.' : '알림이 없습니다.'}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationReadToggle(notification)}
                onDoubleClick={() => handleNotificationDoubleClick(notification)}
                style={{ cursor: 'pointer' }}
              >
                <div className="notification-header">
                  <div className="notification-title">
                    {notification.title || '제목 없음'}
                    {!notification.isRead && <span className="unread-dot">●</span>}
                  </div>
                  <div className="notification-actions">
                    {notification.url && (
                      <button 
                        className="navigate-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationNavigate(notification);
                        }}
                        title="페이지로 이동"
                      >
                        🔗
                      </button>
                    )}
                    {!notification.isRead && (
                      <button 
                        className="read-toggle-btn"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleNotificationReadToggle(notification);
                        }}
                        title="읽음으로 표시"
                      >
                        📧
                      </button>
                    )}
                  </div>
                </div>
                <div className="notification-text">
                  {notification.description || '내용 없음'}
                </div>
                <div className="notification-meta">
                  <span className="notification-id">ID: {notification.id}</span>
                  <span className="notification-hint">
                    더블클릭하여 읽음 처리
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

// 알림 버튼 컴포넌트 (드롭다운이 닫혀있을 때 사용)
export const NotificationButton: React.FC<{ unreadCount: number; onClick: () => void }> = ({ 
  unreadCount, 
  onClick 
}) => {
  return (
    <button 
      className="header-btn notification-btn"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title="알림"
    >
      🔔
      {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount}</span>
      )}
    </button>
  );
};

export default NotificationDropdown;