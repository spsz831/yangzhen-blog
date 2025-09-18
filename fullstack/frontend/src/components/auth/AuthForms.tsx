'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  username: string;
  displayName: string;
  password: string;
  bio?: string;
}

export function AuthForms() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    email: '',
    username: '',
    displayName: '',
    password: '',
    bio: '',
  });

  const { login, register } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setError('请填写所有必填字段');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(loginData.email, loginData.password);
    } catch (error: any) {
      setError(error.message || '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.email || !registerData.username || !registerData.displayName || !registerData.password) {
      setError('请填写所有必填字段');
      return;
    }

    if (registerData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register(registerData);
    } catch (error: any) {
      setError(error.message || '注册失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? '登录' : '注册'}</CardTitle>
          <CardDescription>
            {isLogin ? '欢迎回到 YangZhen 的博客' : '创建您的账户开始写作'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="邮箱地址"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="密码"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="邮箱地址"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="用户名"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="显示名称"
                  value={registerData.displayName}
                  onChange={(e) => setRegisterData({ ...registerData, displayName: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="密码 (至少6位)"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Textarea
                  placeholder="个人简介 (可选)"
                  value={registerData.bio}
                  onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                  disabled={isLoading}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '注册中...' : '注册'}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-blue-600 hover:underline"
              disabled={isLoading}
            >
              {isLogin ? '还没有账户？立即注册' : '已有账户？立即登录'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}