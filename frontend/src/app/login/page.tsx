'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const LoginPage: React.FC = () => {
  const router = useRouter();

  // 쿠키 기반 로그인 체크
  useEffect(() => {
    // 로그아웃으로 인한 리다이렉트인지 확인
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogout = urlParams.get('logout') === 'true';
    
    // 로그아웃으로 온 경우에는 로그인 체크를 더 오래 지연시키고, URL 파라미터 정리
    if (fromLogout) {
      console.log('로그아웃으로 인한 리다이렉트 - 로그인 체크 지연');
      
      // URL에서 logout 파라미터 제거
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // 로그아웃 직후이므로 더 오랜 지연 시간 적용
      setTimeout(checkLoginStatus, 2000); // 2초 지연으로 증가
      return;
    }

    // 일반적인 경우 즉시 체크
    checkLoginStatus();
    
    async function checkLoginStatus() {
      try {
        // 네트워크 연결 상태 확인
        if (!navigator.onLine) {
          console.log('오프라인 상태 - 로그인 체크 스킵');
          return;
        }

        // AbortController로 타임아웃 설정
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

        const res = await fetch('http://localhost:8080/api/v1/user/me', {
          method: 'GET',
          credentials: 'include', // 쿠키 포함해서 요청
          signal: controller.signal,
          // 캐시 방지를 위한 헤더 추가
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        clearTimeout(timeoutId);
        
        if (res.ok) {
          // 응답이 성공적이면 사용자 데이터도 확인
          const userData = await res.json();
          if (userData && userData.resultCode === "200-1" && userData.data) {
            console.log('이미 로그인된 상태:', userData);
            
            // 로그아웃 직후가 아닌 경우에만 리다이렉트
            if (!fromLogout) {
              // 로그인 되어 있음 → 메인 페이지로 이동
              router.push('/');
              // 백업으로 window.location도 사용
              if (typeof window !== 'undefined') {
                window.location.href = 'http://localhost:3000';
              }
            }
          }
        } else {
          console.log('로그인 상태 아님 - 상태코드:', res.status);
        }
        // res.ok가 false거나 데이터가 없으면 로그인 안 된 상태이므로 아무것도 안 함
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('로그인 상태 확인 타임아웃');
        } else if (error.message.includes('Failed to fetch')) {
          console.log('서버 연결 실패 - 백엔드 서버가 꺼져있거나 CORS 문제일 수 있습니다');
        } else {
          console.error('로그인 상태 확인 에러:', error.message);
        }
        // 네트워크 에러 등의 경우 → 로그인 페이지에 그대로 있음
        // 에러가 발생해도 페이지는 정상 작동하도록 함
      }
    }
  }, [router]);

  const [currentPage, setCurrentPage] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/user/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.resultCode === '200-1') {
          // 로그인 성공 시 쿠키 설정 (백엔드에서 설정하므로 프론트엔드에서는 설정하지 않음)
          console.log('로그인 성공, 백엔드에서 쿠키 설정됨');
          
          alert('로그인 성공!');
          
          // 잠시 대기 후 리다이렉트 (쿠키 설정 시간 확보)
          setTimeout(() => {
            router.push('/teams');
          }, 1000);
        } else {
          alert(result.msg || '로그인에 실패했습니다.');
        }
      } else {
        alert('로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            팀 관리 시스템
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            로그인하여 팀을 관리하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              이메일
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.25rem',
                height: '1.25rem',
                color: '#9ca3af'
              }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                placeholder="이메일을 입력하세요"
                required
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              비밀번호
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.25rem',
                height: '1.25rem',
                color: '#9ca3af'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                placeholder="비밀번호를 입력하세요"
                required
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '0.25rem'
                }}
              >
                {showPassword ? (
                  <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} />
                ) : (
                  <Eye style={{ width: '1.25rem', height: '1.25rem' }} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '0.75rem',
              background: isLoading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = '#3b82f6';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            테스트 계정: <br />
            <strong>dev@test.com</strong> / <strong>password123</strong> <br />
            <strong>coding@test.com</strong> / <strong>password123</strong> <br />
            <strong>server@test.com</strong> / <strong>password123</strong> <br />
            <strong>daran2@gmail.com</strong> / <strong>password123</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;