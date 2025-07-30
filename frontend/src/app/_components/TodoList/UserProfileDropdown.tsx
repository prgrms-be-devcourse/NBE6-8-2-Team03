"use client";
import React, { useState } from 'react';

interface UserInfo {
  name: string;
  email: string;
  joinDate: string;
  role?: string;
  department?: string;
}

interface UserProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userInfo?: UserInfo;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ 
  isOpen, 
  onClose, 
  userName = "개발자님",
  userInfo = {
    name: "개발자님",
    email: "developer@example.com",
    joinDate: "2024.01.15",
    role: "Frontend Developer",
    department: "개발팀"
  }
}) => {
  
  const [showProfileDetail, setShowProfileDetail] = useState<boolean>(false);

  const showProfileSummary = () => {
    setShowProfileDetail(true);
  };

  const hideProfileDetail = () => {
    setShowProfileDetail(false);
  };

  const goToProfileEdit = () => {
    alert('프로필 수정 페이지로 이동합니다.');
    onClose();
  };

  const logout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      alert('로그아웃 되었습니다.');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <button 
        className="header-btn"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        title="프로필"
      >
        👤
      </button>
      <div className="dropdown-content user-profile-dropdown show">
        {!showProfileDetail ? (
          <>
            <div className="dropdown-header">
              <div className="user-header-info">
                <div className="user-avatar">👤</div>
                <div className="user-basic-info">
                  <div className="user-name">{userName}</div>
                  <div className="user-role">{userInfo.role}</div>
                </div>
              </div>
            </div>
            <button className="dropdown-item" onClick={showProfileSummary}>
              <span className="item-icon">📋</span>
              프로필 상세보기
            </button>
            <button className="dropdown-item" onClick={goToProfileEdit}>
              <span className="item-icon">✏️</span>
              프로필 수정
            </button>
            <button className="dropdown-item logout" onClick={logout}>
              <span className="item-icon">🚪</span>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <div className="dropdown-header profile-detail-header">
              <button 
                className="back-btn"
                onClick={hideProfileDetail}
                title="뒤로가기"
              >
                ←
              </button>
              <span>프로필 상세정보</span>
            </div>
            <div className="profile-detail-content">
              <div className="profile-avatar-large">
                👤
              </div>
              <div className="profile-info-section">
                <div className="info-item">
                  <span className="info-label">이름</span>
                  <span className="info-value">{userInfo.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">이메일</span>
                  <span className="info-value">{userInfo.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">직책</span>
                  <span className="info-value">{userInfo.role}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">부서</span>
                  <span className="info-value">{userInfo.department}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">가입일</span>
                  <span className="info-value">{userInfo.joinDate}</span>
                </div>
              </div>
              <div className="profile-actions">
                <button className="profile-action-btn edit-btn" onClick={goToProfileEdit}>
                  ✏️ 프로필 수정
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

// 유저 프로필 버튼 컴포넌트 (드롭다운이 닫혀있을 때 사용)
export const UserProfileButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button 
      className="header-btn"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title="프로필"
    >
      👤
    </button>
  );
};

export default UserProfileDropdown;