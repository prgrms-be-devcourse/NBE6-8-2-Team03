"use client";
import React, { useState, useEffect } from 'react';

// Mock components - 실제 프로젝트에서는 별도 파일로 분리
const NotificationButton = ({ unreadCount, onClick }) => (
  <button className="notification-btn" onClick={onClick}>
    🔔
    {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
  </button>
);

const UserProfileButton = ({ onClick }) => (
  <button className="profile-btn" onClick={onClick}>
    👤
  </button>
);

const NotificationDropdown = ({ isOpen, onClose }) => (
  <div className="dropdown-menu notification-dropdown">
    <div className="dropdown-header">알림</div>
    <div className="dropdown-content">알림이 없습니다.</div>
  </div>
);

const UserProfileDropdown = ({ isOpen, onClose, userName, userInfo }) => (
  <div className="dropdown-menu profile-dropdown">
    <div className="dropdown-header">{userName}</div>
    <div className="dropdown-content">
      <button onClick={onClose}>프로필 수정</button>
      <button onClick={onClose}>로그아웃</button>
    </div>
  </div>
);

const ProfileEditPage = () => {
  // 기본 템플릿 상태
  const [activeNavItem, setActiveNavItem] = useState('inbox');
  const [activeProject, setActiveProject] = useState('');
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // 프로필 수정 상태
  const [profileData, setProfileData] = useState({
    nickname: '개발자님',
    email: 'developer@example.com',
    profileImgUrl: 'https://via.placeholder.com/150',
    createdAt: '2024-01-15 09:30:00',
    updatedAt: '2024-07-28 14:20:00'
  });

  const [formData, setFormData] = useState({
    nickname: profileData.nickname,
    email: profileData.email,
    profileImgUrl: profileData.profileImgUrl
  });

  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(profileData.profileImgUrl);
  const [imageLoading, setImageLoading] = useState(false); // 이미지 로딩 상태
  const [imageError, setImageError] = useState(false); // 이미지 에러 상태

  // 기본 템플릿 함수들
  const toggleDropdown = (dropdownType) => {
    if (dropdownType === 'notification') {
      setShowNotificationDropdown(!showNotificationDropdown);
      setShowProfileDropdown(false);
    } else {
      setShowProfileDropdown(!showProfileDropdown);
      setShowNotificationDropdown(false);
    }
  };

  const selectNavItem = (itemId) => {
    setActiveNavItem(itemId);
    setActiveProject('');
  };

  const selectProject = (projectId) => {
    setActiveProject(projectId);
    setActiveNavItem('');
  };

  const handleOutsideClick = (event) => {
    const target = event.target;
    if (!target.closest('.dropdown')) {
      setShowNotificationDropdown(false);
      setShowProfileDropdown(false);
    }
  };

  // 프로필 수정 함수들
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleImageUrlChange = (value) => {
    setFormData({
      ...formData,
      profileImgUrl: value
    });
    setPreviewImage(value);
    setImageError(false); // 에러 상태 초기화
  };

  // 이미지 로드 성공/실패 핸들러
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // 파일 업로드 처리 (Base64 방식)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result;
      setFormData({
        ...formData,
        profileImgUrl: base64Image
      });
      setPreviewImage(base64Image);
    };
    reader.readAsDataURL(file);
  };

  // 실제 서버 업로드 방식
  const handleFileUploadToServer = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 파일 크기 및 타입 체크
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append('profileImage', file);

      setImageLoading(true); // 로딩 시작

      // 실제 API 호출
      const response = await fetch('http://localhost:8080/api/v1/user/profile-image', {
        method: 'POST',
        credentials: 'include',
        body: formDataForUpload
      });

      if (response.ok) {
        const result = await response.json();
        const imageUrl = result.data.imageUrl; // 서버에서 반환한 이미지 URL
        
        setFormData({
          ...formData,
          profileImgUrl: imageUrl
        });
        setPreviewImage(imageUrl);
        setImageLoading(false);
        
        alert('이미지가 성공적으로 업로드되었습니다.');
      } else {
        throw new Error('이미지 업로드 실패');
      }
      
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      setImageLoading(false);
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      nickname: profileData.nickname,
      email: profileData.email,
      profileImgUrl: profileData.profileImgUrl
    });
    setPreviewImage(profileData.profileImgUrl);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      // 실제 API 호출 대신 mock 처리
      console.log('프로필 업데이트:', formData);
      
      // 성공 시 데이터 업데이트
      setProfileData({
        ...profileData,
        ...formData,
        updatedAt: new Date().toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\. /g, '-').replace('.', '').replace(', ', ' ')
      });
      
      setIsEditing(false);
      alert('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필 업데이트에 실패했습니다.');
    }
  };

  // ESC 키 처리
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowNotificationDropdown(false);
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  return (
    <div className="todo-app" onClick={handleOutsideClick} style={styles.app}>
      {/* 헤더 */}
      <header style={styles.header}>
        <div style={styles.logo}>TodoList</div>
        <div style={styles.headerActions}>
          {/* 알림 드롭다운 */}
          <div className="dropdown" style={styles.dropdown}>
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
          <div className="dropdown" style={styles.dropdown}>
            {showProfileDropdown ? (
              <UserProfileDropdown 
                isOpen={showProfileDropdown}
                onClose={() => setShowProfileDropdown(false)}
                userName={profileData.nickname}
                userInfo={profileData}
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
      <div style={styles.mainContainer}>
        {/* 사이드바 */}
        <aside style={styles.sidebar}>
          {/* 개인 리스트 섹션 */}
          <div style={styles.sidebarSection}>
            <div style={styles.sectionTitle}>개인 리스트</div>
            <nav style={styles.sidebarNav}>
              <button 
                style={{...styles.navItem, ...(activeNavItem === 'inbox' ? styles.activeNavItem : {})}}
                onClick={() => selectNavItem('inbox')}
              >
                <div style={styles.itemLeft}>
                  <span>📥</span>
                  <span>개인 업무</span>
                </div>
                <span style={styles.itemCount}>5</span>
              </button>
              <button 
                style={{...styles.navItem, ...(activeNavItem === 'project-a' ? styles.activeNavItem : {})}}
                onClick={() => selectNavItem('project-a')}
              >
                <div style={styles.itemLeft}>
                  <span>📋</span>
                  <span>프로젝트 A</span>
                </div>
                <span style={styles.itemCount}>8</span>
              </button>
              <button 
                style={{...styles.navItem, ...(activeNavItem === 'activities' ? styles.activeNavItem : {})}}
                onClick={() => selectNavItem('activities')}
              >
                <div style={styles.itemLeft}>
                  <span>⚡</span>
                  <span>취미 활동</span>
                </div>
                <span style={styles.itemCount}>3</span>
              </button>
            </nav>
          </div>

          {/* 팀 리스트 섹션 */}
          <div style={styles.sidebarSection}>
            <div style={styles.sectionTitle}>팀 리스트</div>
            <div style={styles.sidebarNav}>
              <div 
                style={{...styles.projectItem, ...(activeProject === 'sprint24' ? styles.activeProject : {})}}
                onClick={() => selectProject('sprint24')}
              >
                <div style={styles.projectInfo}>
                  <span style={styles.projectIcon}>🚀</span>
                  <span style={styles.projectName}>개발팀 - Sprint 24</span>
                </div>
                <span style={styles.projectCount}>12</span>
              </div>
              <div 
                style={{...styles.projectItem, ...(activeProject === 'marketing-q2' ? styles.activeProject : {})}}
                onClick={() => selectProject('marketing-q2')}
              >
                <div style={styles.projectInfo}>
                  <span style={styles.projectIcon}>📊</span>
                  <span style={styles.projectName}>마케팅 - Q2</span>
                </div>
                <span style={styles.projectCount}>7</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 - 프로필 수정 */}
        <main style={styles.content}>
          <div style={styles.profileContainer}>
            <div style={styles.profileHeader}>
              <h1 style={styles.profileTitle}>프로필 설정</h1>
              <div style={styles.profileActions}>
                {!isEditing ? (
                  <button style={styles.editButton} onClick={handleEdit}>
                    수정하기
                  </button>
                ) : (
                  <div style={styles.actionButtons}>
                    <button style={styles.cancelButton} onClick={handleCancel}>
                      취소
                    </button>
                    <button style={styles.saveButton} onClick={handleSave}>
                      저장
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.profileForm}>
              {/* 프로필 이미지 */}
              <div style={styles.formGroup}>
                <label style={styles.label}>프로필 이미지</label>
                <div style={styles.imageSection}>
                  <div style={styles.imagePreview}>
                    {/* 로딩 스피너 */}
                    {imageLoading && (
                      <div style={styles.imageLoading}>
                        <div style={styles.spinner}>⏳</div>
                        <span style={styles.loadingText}>업로드 중...</span>
                      </div>
                    )}
                    
                    {/* 프로필 이미지 */}
                    {!imageLoading && (
                      <>
                        <img 
                          src={previewImage || 'https://via.placeholder.com/150'} 
                          alt="프로필 이미지" 
                          style={{
                            ...styles.profileImage,
                            ...(imageError ? styles.imageError : {})
                          }}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                        
                        {/* 이미지 에러 시 오버레이 */}
                        {imageError && (
                          <div style={styles.errorOverlay}>
                            <span style={styles.errorIcon}>❌</span>
                            <span style={styles.errorText}>이미지 로드 실패</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* 이미지 크기 정보 */}
                    {isEditing && !imageLoading && (
                      <div style={styles.imageMeta}>
                        <span style={styles.imageSize}>권장: 500×500px</span>
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div style={styles.imageControls}>
                      {/* 파일 업로드 */}
                      <div style={styles.uploadSection}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUploadToServer} // 서버 업로드 방식 사용
                          style={styles.fileInput}
                          id="profileImageUpload"
                        />
                        <label htmlFor="profileImageUpload" style={styles.uploadButton}>
                          📁 파일 선택
                        </label>
                        <span style={styles.uploadHint}>또는</span>
                      </div>
                      
                      {/* URL 입력 */}
                      <div style={styles.urlSection}>
                        <input
                          type="url"
                          placeholder="이미지 URL을 입력하세요"
                          value={typeof formData.profileImgUrl === 'string' && !formData.profileImgUrl.startsWith('data:') ? formData.profileImgUrl : ''}
                          onChange={(e) => handleImageUrlChange(e.target.value)}
                          style={styles.input}
                        />
                      </div>
                      
                      <div style={styles.imageHints}>
                        <p style={styles.hint}>• 파일 크기: 최대 5MB</p>
                        <p style={styles.hint}>• 지원 형식: JPG, PNG, GIF</p>
                        <p style={styles.hint}>• 권장 크기: 500x500px</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 닉네임 */}
              <div style={styles.formGroup}>
                <label style={styles.label}>닉네임</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    style={styles.input}
                    placeholder="닉네임을 입력하세요"
                  />
                ) : (
                  <div style={styles.displayValue}>{profileData.nickname}</div>
                )}
              </div>

              {/* 이메일 */}
              <div style={styles.formGroup}>
                <label style={styles.label}>이메일</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={styles.input}
                    placeholder="이메일을 입력하세요"
                  />
                ) : (
                  <div style={styles.displayValue}>{profileData.email}</div>
                )}
              </div>

              {/* 생성일 (읽기 전용) */}
              <div style={styles.formGroup}>
                <label style={styles.label}>가입일</label>
                <div style={styles.displayValue}>{profileData.createdAt}</div>
              </div>

              {/* 수정일 (읽기 전용) */}
              <div style={styles.formGroup}>
                <label style={styles.label}>최근 수정일</label>
                <div style={styles.displayValue}>{profileData.updatedAt}</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 푸터 */}
      <footer style={styles.footer}>
        <p>&copy; 2025 TodoList. All rights reserved.</p>
      </footer>
    </div>
  );
};

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e1e5e9',
    padding: '0 20px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  dropdown: {
    position: 'relative'
  },
  mainContainer: {
    display: 'flex',
    minHeight: 'calc(100vh - 120px)'
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e1e5e9',
    padding: '20px 0'
  },
  sidebarSection: {
    marginBottom: '30px',
    paddingLeft: '20px',
    paddingRight: '20px'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#495057',
    transition: 'all 0.2s ease'
  },
  activeNavItem: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2'
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  itemCount: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '12px',
    minWidth: '20px',
    textAlign: 'center'
  },
  projectItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#495057',
    transition: 'all 0.2s ease'
  },
  activeProject: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32'
  },
  projectInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  projectIcon: {},
  projectName: {},
  projectCount: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '12px',
    minWidth: '20px',
    textAlign: 'center'
  },
  content: {
    flex: 1,
    padding: '30px',
    backgroundColor: '#f8f9fa'
  },
  profileContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '800px',
    margin: '0 auto'
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #e1e5e9',
    paddingBottom: '20px'
  },
  profileTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#2c3e50',
    margin: 0
  },
  profileActions: {},
  editButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px'
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  saveButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  profileForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#495057',
    marginBottom: '5px'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #ced4da',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#495057',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s ease',
    outline: 'none'
  },
  displayValue: {
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#495057'
  },
  imageSection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '25px',
    flexWrap: 'wrap'
  },
  imagePreview: {
    flexShrink: 0,
    position: 'relative',
    display: 'inline-block'
  },
  profileImage: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #e9ecef',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    display: 'block'
  },
  imageError: {
    opacity: '0.5',
    filter: 'grayscale(100%)'
  },
  imageLoading: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '3px solid #e9ecef',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    gap: '8px'
  },
  spinner: {
    fontSize: '24px',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: '500'
  },
  errorOverlay: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px'
  },
  errorIcon: {
    fontSize: '24px'
  },
  errorText: {
    fontSize: '10px',
    color: 'white',
    fontWeight: '500'
  },
  imageMeta: {
    position: 'absolute',
    bottom: '-25px',
    left: '50%',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap'
  },
  imageSize: {
    fontSize: '11px',
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    padding: '2px 8px',
    borderRadius: '12px',
    border: '1px solid #e9ecef'
  },
  imageControls: {
    flex: 1,
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  uploadSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  fileInput: {
    display: 'none'
  },
  uploadButton: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    border: 'none'
  },
  uploadHint: {
    color: '#6c757d',
    fontSize: '14px',
    fontStyle: 'italic'
  },
  urlSection: {
    width: '100%'
  },
  imageHints: {
    marginTop: '5px'
  },
  hint: {
    margin: '2px 0',
    fontSize: '12px',
    color: '#6c757d'
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e1e5e9',
    padding: '20px',
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '14px'
  }
};

export default ProfileEditPage;