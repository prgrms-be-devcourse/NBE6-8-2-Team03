"use client";
import React, { useState, useEffect } from 'react';

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


// 유저 프로필 버튼 컴포넌트 (드롭다운이 닫혀있을 때 사용)
const UserProfileButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
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
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // API 기본 설정
  const API_BASE_URL = 'http://localhost:8080';

  // 이미지 URL 처리 헬퍼 함수 (수정 페이지와 동일한 로직)
  const processImageUrl = (imageUrl: string | null | undefined): string | null => {
    console.log('processImageUrl 호출됨, 입력값:', imageUrl);
    
    if (!imageUrl) {
      console.log('이미지 URL이 null/undefined, null 반환');
      return null;
    }
    
    // 이미 완전한 URL인 경우 (http:// 또는 https://로 시작)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      console.log('완전한 URL로 판단, 그대로 반환:', imageUrl);
      return imageUrl;
    }
    
    // 상대 경로인 경우 API_BASE_URL을 앞에 붙임
    if (imageUrl.startsWith('/')) {
      const result = `${API_BASE_URL}${imageUrl}`;
      console.log('상대 경로로 판단, 변환된 URL:', result);
      return result;
    }
    
    // 기타 경우 API_BASE_URL과 조합
    const result = `${API_BASE_URL}/${imageUrl}`;
    console.log('기타 경우, 변환된 URL:', result);
    return result;
  };

  // 이미지 URL을 표시용으로 변환 (프리뷰용)
  const getDisplayImageUrl = (imageUrl: string | null | undefined): string => {
    console.log('getDisplayImageUrl 호출됨, 입력값:', imageUrl);
    const processedUrl = processImageUrl(imageUrl);
    const result = processedUrl || 'https://via.placeholder.com/150';
    console.log('getDisplayImageUrl 결과:', result);
    return result;
  };

  // 이미지 로드 성공/실패 핸들러
  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // 유저 프로필 데이터 가져오기
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/user/me', {
        method: 'GET',
        credentials: 'include' // 쿠키 포함
      });

      const result = await response.json();
      
      if (result.resultCode === "200-1") {
        console.log('프로필 데이터:', result.data);
        setUserProfileData(result.data);
        setImageError(false); // 새 데이터 로드 시 이미지 에러 상태 리셋
      }
    } catch (error) {
      console.error('프로필 정보 가져오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 프로필 데이터 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const showProfileSummary = () => {
    setShowProfileDetail(true);
  };

  const hideProfileDetail = () => {
    setShowProfileDetail(false);
  };

  const goToProfileEdit = () => {
    window.location.href = '/profile/edit';
    onClose();
  };

  const logout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      try {
        // 로그아웃 API 호출
        const response = await fetch('http://localhost:8080/api/v1/user/logout', {
          method: 'POST',
          credentials: 'include', // 쿠키 포함해서 요청
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        
        // API 응답과 관계없이 프론트엔드에서 정리 작업 수행
        // 로컬 스토리지에서 토큰 제거
        localStorage.removeItem('accessToken');
        localStorage.removeItem('apiKey');
        
        // 세션 스토리지도 정리 (혹시 사용 중이라면)
        sessionStorage.clear();
        
        if (result.resultCode === "200-1") {
          console.log('로그아웃 성공:', result.msg);
        } else {
          console.warn('로그아웃 API 응답 이상:', result);
        }
        
        // 강제로 쿠키 삭제 시도 (클라이언트 사이드에서 가능한 범위)
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        alert('로그아웃 되었습니다.');
        
        // 약간의 지연 후 로그인 페이지로 이동 (쿠키 삭제 완료 대기)
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        
      } catch (error) {
        console.error('로그아웃 오류:', error);
        
        // API 호출이 실패해도 프론트엔드에서 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('apiKey');
        sessionStorage.clear();
        
        // 강제로 쿠키 삭제
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        alert('로그아웃 되었습니다.');
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    onClose();
  };

  // 프로필 이미지 렌더링 함수
  const renderProfileImage = (size: 'small' | 'large' = 'small') => {
    const imageUrl = getDisplayImageUrl(userProfileData?.profileImageUrl);
    const sizeClass = size === 'large' ? 'profile-avatar-large' : 'user-avatar';
    
    if (imageError) {
      // 이미지 로드 실패 시 기본 아이콘 표시
      return (
        <div className={`${sizeClass} avatar-fallback`}>
          👤
        </div>
      );
    }

    return (
      <div className={sizeClass}>
        <img 
          src={imageUrl}
          alt="프로필 이미지"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      </div>
    );
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
                {isLoading ? (
                  <div className="user-avatar loading-avatar">
                    ⏳
                  </div>
                ) : (
                  renderProfileImage('small')
                )}
                <div className="user-basic-info">
                  <div className="user-name">
                    {isLoading ? '로딩 중...' : (userProfileData?.nickname || userName)}
                  </div>
                  <div className="user-role">
                    {isLoading ? '로딩 중...' : (userProfileData?.email || userInfo.email)}
                  </div>
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
              {isLoading ? (
                <div className="profile-avatar-large loading-avatar-large">
                  ⏳
                </div>
              ) : (
                renderProfileImage('large')
              )}
              <div className="profile-info-section">
                <div className="info-item">
                  <span className="info-label">닉네임</span>
                  <span className="info-value">
                    {isLoading ? '로딩 중...' : (userProfileData?.nickname || userInfo.name)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">이메일</span>
                  <span className="info-value">
                    {isLoading ? '로딩 중...' : (userProfileData?.email || userInfo.email)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">가입일</span>
                  <span className="info-value">
                    {isLoading ? '로딩 중...' : (userProfileData?.createDate ? new Date(userProfileData.createDate).toLocaleDateString('ko-KR') : userInfo.joinDate)}
                  </span>
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

      {/* 프로필 이미지 관련 CSS 스타일 추가 */}
      <style jsx>{`
        .user-avatar, .profile-avatar-large {
          position: relative;
          border-radius: 50%;
          overflow: hidden;
          background-color: #f8f9fa;
          border: 2px solid #e9ecef;
        }
        
        .user-avatar {
          width: 40px;
          height: 40px;
        }
        
        .profile-avatar-large {
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
        }
        
        .avatar-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #6c757d;
          background-color: #f8f9fa;
        }
        
        .profile-avatar-large.avatar-fallback {
          font-size: 40px;
        }
        
        .loading-avatar, .loading-avatar-large {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f9fa;
          color: #6c757d;
          animation: spin 1s linear infinite;
        }
        
        .loading-avatar {
          width: 40px;
          height: 40px;
          font-size: 16px;
        }
        
        .loading-avatar-large {
          width: 80px;
          height: 80px;
          font-size: 24px;
          margin: 0 auto 15px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export { UserProfileButton };
export default UserProfileDropdown;