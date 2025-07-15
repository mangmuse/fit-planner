# Fit Planner

운동 루틴 관리와 기록을 위한 Progressive Web App

## 주요 기능

- **운동 루틴 관리**: 나만의 운동 루틴 생성 및 관리
- **운동 기록**: 세트별 무게, 횟수, 휴식 시간 기록
- **PWA**: 모바일 앱처럼 설치 가능

### 🎬 기능 시연

<details>
<summary>운동 세션 추가</summary>

![운동 세션 추가](./gifs/add-session.gif)

</details>

<details>
<summary>이전 운동 기록 불러오기</summary>

![이전 운동 불러오기](./gifs/load-prev-workout.gif)

</details>

<details>
<summary>루틴 관리</summary>

![루틴 관리](./gifs/routine.gif)

</details>

## 💡 주요 기술 결정 및 트러블슈팅

- **오프라인 지원을 위한 아키텍처 설계**: (문제/해결 요약)
- **서비스 계층 리팩토링**: (문제/해결 요약)
- **(기타 1~2가지)**

## 🏛️ 아키텍처

<details>
<summary>전체 시스템 아키텍처</summary>

```mermaid
graph TB
    subgraph "사용자 환경 (Client)"
        PWA[Browser / PWA]
        LocalDB[IndexedDB - Dexie.js]
    end

    subgraph "서버 (Next.js / Vercel)"
        AppRouter[App Router & API Routes]
        Auth[NextAuth.js]
    end

    subgraph "외부 서비스"
        Supabase[(Database - Supabase)]
        Google[(Google OAuth)]
    end

    PWA -->|로컬 DB에 우선 저장| LocalDB
    PWA -->|서버에 동기화 요청| AppRouter

    AppRouter -->|데이터 쿼리| Supabase
    AppRouter -->|인증| Auth
    Auth -->|OAuth| Google
```

</details>

<details>
<summary>데이터 흐름 다이어그램</summary>

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Service
    participant Repository
    participant IndexedDB
    participant API
    participant PostgreSQL

    User->>UI: 운동 기록 입력
    UI->>Service: 데이터 저장 요청
    Service->>Repository: 로컬 저장
    Repository->>IndexedDB: 데이터 저장
    IndexedDB-->>Repository: 저장 완료
    Repository-->>Service: 결과 반환

    Service->>API: 서버 동기화 (비동기)
    API->>PostgreSQL: 데이터 저장
    PostgreSQL-->>API: 저장 완료
    API-->>Service: 동기화 완료

    Service-->>UI: UI 업데이트
    UI-->>User: 저장 완료 표시
```

</details>

<details>
<summary>계층 구조 다이어그램</summary>

```mermaid
graph TD
    subgraph "Presentation Layer"
        Pages[Pages/Routes]
        Components[UI Components]
        Hooks[Custom Hooks]
    end

    subgraph "Business Logic Layer"
        Services[Services - Exercise, Workout, Routine, WorkoutDetail, RoutineDetail, SyncAll]
        Adapters[Adapters - 데이터 변환]
    end

    subgraph "Data Access Layer"
        Repositories[Repositories - BaseRepository, ExerciseRepo, WorkoutRepo, RoutineRepo, DetailRepos]
        APIs[API Clients - HTTP 요청]
    end

    subgraph "Storage Layer"
        LocalDB[IndexedDB - Dexie.js]
        RemoteDB[PostgreSQL - Supabase]
    end

    Pages --> Components
    Components --> Hooks
    Hooks --> Services

    Services --> Adapters
    Services --> Repositories
    Services --> APIs

    Repositories --> LocalDB
    APIs --> RemoteDB

    style Services fill:#e8f5e9
    style Repositories fill:#fff3e0
    style LocalDB fill:#e3f2fd
    style RemoteDB fill:#f3e5f5
```

</details>

## 🛠️ 기술 스택

### 주요 기술 (Core)

- **Framework**: Next.js (App Router), React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **ORM & Database**: Prisma, Supabase (PostgreSQL)
- **Authentication**: NextAuth.js (Google OAuth)

### 상태 관리 및 데이터 처리

- **Client-Side State**: Zustand, Context API
- **Local Database**: Dexie.js (IndexedDB)
- **Data Validation**: Zod

### 테스트 및 품질 관리

- **Testing Framework**: Jest, React Testing Library
- **API Mocking**: MSW (Mock Service Worker)

### PWA & 배포

- **PWA**: Next-PWA
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
