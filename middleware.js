import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 로그인 토큰 확인 (쿠키에서 refreshToken이 있는지 확인)
  const refreshToken = request.cookies.get('refreshToken')?.value;
  
  // 로그인 불필요한 공개 경로
  const publicPaths = ['/', '/login', '/register', '/community'];
  
  // 로그인 필요한 경로들
  const protectedPaths = [
    '/script',
    '/community/create',
    '/dashboard',
    '/site',
    '/site/create'
  ];
  
  // 현재 경로가 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  // 로그인이 안 되어 있고 보호된 경로에 접근하려면 로그인 페이지로 리다이렉트
  if (isProtectedPath && !refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 그 외의 경우는 요청 계속 진행
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
