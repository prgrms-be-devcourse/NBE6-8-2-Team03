"use client";
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';



const LoginPage = () => {


    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // 토큰이 있으면 메인 페이지로 리다이렉트
          window.location.href = 'http://localhost:3000';
        }
      }, []);

      
  const [currentPage, setCurrentPage] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState('');
  const [apiKey, setApiKey] = useState('');

  // 이메일 유효성 검사
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 폼 데이터 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 실시간 유효성 검사
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 폼 유효성 검사
  const validateForm = (isRegister = false) => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    if (isRegister) {
      if (!formData.name) {
        newErrors.name = '이름을 입력해주세요.';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
        const response = await fetch('http://localhost:8080/api/v1/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });
      
        const result = await response.json();
        
        if (result.resultCode === "200-1") {
            setUserToken(result.data.accessToken);
            setApiKey(result.data.apiKey);
            
            // 토큰을 localStorage에 저장 (선택사항)
            localStorage.setItem('accessToken', result.data.accessToken);
            localStorage.setItem('apiKey', result.data.apiKey);
            
            // localhost:3000으로 리다이렉트
            window.location.href = 'http://localhost:3000';
          } else {
          setErrors({ general: result.msg || '로그인에 실패했습니다.' });
        }
      
    } catch (error) {
      setErrors({ general: '로그인에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 처리
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm(true)) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/v1/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nickname: formData.name
        })
      });

      const result = await response.json();

      if (result.resultCode === "200-1") {
        alert(result.msg || '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        setCurrentPage('login');
        setFormData({ email: formData.email, password: '', confirmPassword: '', name: '' });
      } else {
        setErrors({ general: result.msg || '회원가입에 실패했습니다.' });
      }
      
    } catch (error) {
      setErrors({ general: '회원가입에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserToken('');
    setApiKey('');
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
    setCurrentPage('login');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {currentPage === 'login' ? '로그인' : '회원가입'}
          </h1>
          <p className="text-gray-600">
            {currentPage === 'login' 
              ? '계정에 로그인하여 시작하세요' 
              : '새 계정을 만들어 시작하세요'
            }
          </p>
        </div>

        {/* 에러 메시지 */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {errors.general}
          </div>
        )}

        <div>
          {/* 이름 필드 (회원가입시만) */}
          {currentPage === 'register' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="이름을 입력하세요"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          )}

          {/* 이메일 필드 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="이메일을 입력하세요"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* 비밀번호 필드 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="비밀번호를 입력하세요"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 필드 (회원가입시만) */}
          {currentPage === 'register' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* 로그인/회원가입 버튼 */}
          <button
            type="button"
            onClick={currentPage === 'login' ? handleLogin : handleRegister}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:transform active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                처리중...
              </div>
            ) : (
              currentPage === 'login' ? '로그인' : '회원가입'
            )}
          </button>
        </div>

        {/* 페이지 전환 버튼 */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">
            {currentPage === 'login' 
              ? '계정이 없으신가요?' 
              : '이미 계정이 있으신가요?'
            }
          </p>
          <button
            onClick={() => {
              setCurrentPage(currentPage === 'login' ? 'register' : 'login');
              setErrors({});
              setFormData({ email: '', password: '', confirmPassword: '', name: '' });
            }}
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
          >
            {currentPage === 'login' ? '회원가입' : '로그인으로 돌아가기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;