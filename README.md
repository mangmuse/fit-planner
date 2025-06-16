# Fit Planner

운동 루틴 관리와 기록을 위한 Progressive Web App

## 주요 기능

- 🏋️ **운동 루틴 관리**: 나만의 운동 루틴 생성 및 관리
- 📝 **운동 기록**: 세트별 무게, 횟수, 휴식 시간 기록
- 📊 **운동 분석**: 캘린더 뷰로 운동 기록 확인
- 🔄 **오프라인 지원**: 로컬 우선 아키텍처로 오프라인에서도 사용 가능
- 📱 **PWA**: 모바일 앱처럼 설치 가능

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma
- **Database**: PostgreSQL
- **Auth**: NextAuth.js (Google OAuth)
- **Local Storage**: Dexie.js (IndexedDB)
- **Deployment**: Vercel

## 로컬 개발

```bash
# 의존성 설치
yarn install

# Prisma 클라이언트 생성
yarn prisma:generate

# 개발 서버 실행
yarn dev
```

## 환경 변수

`.env` 파일에 다음 변수들이 필요합니다:

```
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 배포

Vercel에 자동 배포되도록 설정되어 있습니다.

## 라이선스

MIT