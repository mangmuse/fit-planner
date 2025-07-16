# Fit Planner

운동 루틴 관리와 기록을 위한 Progressive Web App

🔗 **배포 링크**: https://fit-planner-kohl.vercel.app/

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

<details>
<summary>동기화</summary>

![동기화](./gifs/sync.gif)

</details>

## 💡 주요 기술 결정 및 트러블슈팅

### UX 향상을 위한 '로컬 우선(Local-first)' 아키텍처 설계

- **문제점**: 운동 기록 앱은 사용자가 빈번하게 데이터(무게, 횟수 등)를 수정합니다. 이러한 데이터 수정이 발생할 때 마다 서버와 통신하고 응답을 기다리는 것은 답답함을 유발하는 등 사용자 경험을 크게 저하시킬 수 있습니다.
- **해결책**: 이 문제를 해결하기 위해 로컬환경에 데이터를 먼저 저장하고, 이후 사용자가 수동으로 동기화를 할 수 있는 Local-first 방식을 채택했습니다

### 테스트 용이성 및 유지보수성 향상을 위한 아키텍처 개선

- **문제점**: 초기 아키텍처는 서비스 로직이 단순 함수들의 집합으로 구성되어, 비즈니스 로직과 데이터베이스 접근 로직이 강하게 결합되어 있었습니다. 이로 인해 서비스 계층의 단위 테스트를 작성할 때마다 실제 DB를 모킹해야 했고, 테스트 코드의 복잡성이 높아보이는 문제가 있었습니다.
- **해결책**: 이 문제를 해결하기 위해 Repository 패턴을 도입하여 데이터 접근 로직을 분리하고, DI 패턴을 적용한 클래스 기반 아키텍처로 전환했습니다.
  - **테스트 용이성 확보**: 의존성 주입을 통해 서비스 테스트 시 실제 DB가 아닌 mock Repository를 쉽게 주입할 수 있게 되어, 네트워크나 DB 상태에 의존하지 않는 빠르고 안정적인 단위 테스트가 가능해졌습니다.
  - **관심사 분리**: 서비스는 비즈니스 로직에, Repository는 DB 접근에만 집중하도록 역할을 명확히 분리하여 코드의 응집도와 가독성을 높였습니다.
- **결과**: 처음에는 단순히 테스트의 번거로움을 해결하자는 생각에서 시작된 리팩토링이지만, 모듈 간의 결합도를 낮추고 각 계층의 책임을 명확히 함으로써 프로젝트 전체의 유지보수성과 확장성을 크게 향상시키는 아키텍처 개선이 되었다고 생각합니다

### 순환 참조 문제 해결을 위한 테스트 환경 분리

- **문제점**: Dialog 컴포넌트(Modal, BottomSheet) 테스트 실행 시 Context와 Component 간 순환 참조로 인해 Jest 환경에서 import가 undefined로 처리되어 테스트가 실패하는 문제가 발생했습니다.
- **해결책**: 순환 참조가 있는 UI 컴포넌트들을 위한 별도의 Jest 설정 파일을 생성하여 테스트 환경을 분리했습니다. 이를 통해 기존 테스트와 독립적으로 실행할 수 있게 되었고, 향후 유사한 문제 발생 시 같은 패턴으로 해결할 수 있는 기반을 마련했습니다.

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

### 주요 기술

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
# Database (Supabase)
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 배포

Vercel에 자동 배포되도록 설정되어 있습니다.

## 라이선스

MIT
