# Titleist - AI Video Editor

**Precision Editing, Algorithmic Excellence**

Titleist는 AI 기반 영상 편집 플랫폼으로, 수학적 정밀함과 AI의 창의성이 만나 완벽한 결과물을 만들어냅니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-22.13-green)

## ✨ 주요 기능

### 🎬 영상 관리
- **대용량 파일 지원**: 최대 5GB까지 영상 업로드 (청크 업로드 방식)
- **실시간 진행률 표시**: 업로드 및 처리 상태를 실시간으로 확인
- **자동 메타데이터 추출**: 해상도, 길이, 포맷 정보 자동 추출
- **클라우드 저장**: AWS S3 기반 안전한 파일 저장

### 🤖 AI 기능
- **LLM 영상 분석**: Gemini 2.5 Flash를 활용한 영상 내용 분석
  - 장면 감지 및 하이라이트 추출
  - 최적의 편집 포인트 추천
  - 자동 컷 편집 제안
- **AI 썸네일 생성**: 영상 내용 기반 맞춤형 썸네일 자동 생성
- **화질 향상**: 저화질 영상을 고화질로 업스케일링 (메타데이터 기반)

### 🎙️ 음성 기능
- **TTS (Text-to-Speech)**: Web Speech API 기반 텍스트 음성 변환
- **다양한 목소리 옵션**: 여러 음성 스타일 지원
- **타임라인 통합**: 생성된 음성을 영상 타임라인에 추가

### 🎨 편집 도구
- **타임라인 인터페이스**: 직관적인 타임라인 기반 편집
- **영상 자르기/분할/병합**: 기본 편집 기능
- **트랜지션 및 이펙트**: 다양한 전환 효과
- **텍스트 오버레이**: 자막 및 텍스트 추가
- **실행 취소/다시 실행**: 편집 히스토리 관리

### 📊 프로젝트 관리
- **프로젝트 생성/수정/삭제**: 완전한 CRUD 기능
- **상태 관리**: DRAFT, IN_PROGRESS, COMPLETED 상태 추적
- **사용자 인증**: Manus OAuth 기반 안전한 로그인
- **권한 관리**: 사용자별 프로젝트 접근 제어

## 🛠️ 기술 스택

### Frontend
- **React 19.2**: 최신 React 기능 활용
- **TypeScript 5.9**: 타입 안전성 보장
- **Tailwind CSS 4**: 유틸리티 우선 스타일링
- **shadcn/ui**: 고품질 UI 컴포넌트
- **tRPC 11**: End-to-end 타입 안전 API
- **Wouter**: 경량 라우팅
- **Framer Motion**: 부드러운 애니메이션

### Backend
- **Node.js 22.13**: 최신 LTS 버전
- **Express 4**: 웹 서버 프레임워크
- **tRPC 11**: 타입 안전 RPC
- **Drizzle ORM**: 타입 안전 데이터베이스 ORM
- **MySQL/TiDB**: 관계형 데이터베이스

### AI & Cloud Services
- **Gemini 2.5 Flash**: LLM 기반 영상 분석
- **AI Image Generation**: 썸네일 자동 생성
- **AWS S3**: 파일 저장소
- **Web Speech API**: TTS 음성 생성

### DevOps & Tools
- **Vite 7**: 빠른 빌드 도구
- **Vitest**: 단위 테스트
- **pnpm**: 효율적인 패키지 관리
- **ESBuild**: 고속 번들링

## 🚀 시작하기

### 필수 요구사항
- Node.js 22.13 이상
- pnpm 10.4.1 이상
- MySQL 8.0 이상 (또는 TiDB)

### 설치

1. **저장소 클론**
```bash
git clone https://github.com/hdongug/AI-video-editing.git
cd AI-video-editing
```

2. **의존성 설치**
```bash
pnpm install
```

3. **환경 변수 설정**
`.env` 파일을 생성하고 다음 변수를 설정하세요:
```env
DATABASE_URL=mysql://user:password@localhost:3306/titleist
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=your-app-id
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
```

4. **데이터베이스 마이그레이션**
```bash
pnpm db:push
```

5. **개발 서버 실행**
```bash
pnpm dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 프로덕션 빌드

```bash
pnpm build
pnpm start
```

### 테스트 실행

```bash
pnpm test
```

## 📁 프로젝트 구조

```
titleist/
├── client/                 # 프론트엔드 코드
│   ├── public/            # 정적 파일
│   └── src/
│       ├── components/    # 재사용 가능한 컴포넌트
│       ├── pages/         # 페이지 컴포넌트
│       ├── contexts/      # React 컨텍스트
│       ├── hooks/         # 커스텀 훅
│       └── lib/           # 유틸리티 함수
├── server/                # 백엔드 코드
│   ├── _core/            # 핵심 서버 로직
│   ├── db.ts             # 데이터베이스 쿼리
│   ├── routers.ts        # tRPC 라우터
│   └── storage.ts        # S3 저장소 헬퍼
├── drizzle/              # 데이터베이스 스키마 및 마이그레이션
├── shared/               # 공유 타입 및 상수
└── package.json          # 프로젝트 메타데이터
```

## 🎨 디자인 철학

Titleist는 **수학적 청사진** 디자인을 채택합니다:

- **그리드 기반 레이아웃**: 정밀한 배치와 일관성
- **기하학적 패턴**: 와이어프레임 스타일의 도형
- **타이포그래피 대비**: 굵은 산세리프 헤드라인 + 섬세한 모노스페이스 라벨
- **파스텔 컬러**: 시안과 핑크의 조화로운 배색
- **알고리즘적 분위기**: 과학적이고 기술적인 느낌

## 🔒 보안

- **OAuth 인증**: Manus OAuth를 통한 안전한 로그인
- **JWT 세션**: 토큰 기반 세션 관리
- **환경 변수 보호**: 민감한 정보는 환경 변수로 관리
- **HTTPS 전용**: 프로덕션 환경에서 HTTPS 강제

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. 이 저장소를 포크합니다
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📧 문의

프로젝트에 대한 질문이나 제안이 있으시면 이슈를 생성해 주세요.

---

**Made with ❤️ by Titleist Team**
