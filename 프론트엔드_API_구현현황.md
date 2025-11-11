Feat: 프론트엔드 영상 재생페이지 기능 및 디자인 수정 & 에러 시스템 구현
- 피드백 히스토리 영속화 (localStorage persist)
- 번역 요청 UI 구현 (TranslationModal)
- Grouped-search API 활용
- 자막 싱크 기능
- 전역 에러 토스트 시스템
- scriptId 파라미터 전달 수정


### ✅ 1. 피드백 히스토리 영속화
```javascript
// front/src/stores/tutorStore.js
import { persist } from 'zustand/middleware';

const useTutorStore = create(
  persist(
    (set, get) => ({ /* ... */ }),
    {
      name: 'tutor-storage',
      partialize: (state) => ({
        feedbackHistory: state.feedbackHistory,
        currentFeedback: state.currentFeedback,
      }),
    }
  )
);
```

- ✅ localStorage에 자동 저장
- ✅ 새로고침 후에도 학습 기록 유지
- ✅ Mypage에서 히스토리 정상 표시

---

### ✅ 2. 번역 요청 UI 구현
1. **TranslationModal 컴포넌트 신규 생성**
   - 7개 언어 선택 (한국어, 영어, 중국어, 일본어, 베트남어, 태국어, 러시아어)
   - 번역 요청 상태 표시 (로딩, 성공, 에러)
   - 토스트 알림 통합

2. **Player 페이지에 버튼 추가**
   - "🌍 다른 언어로 번역 요청" 버튼
   - 모달 팝업으로 번역 언어 선택

- ✅ 사용자가 새로운 언어로 번역 요청 가능
- ✅ Perso.ai 웹훅을 통한 비동기 번역 지원
- ✅ 번역 완료 후 콘텐츠 목록에 자동 표시

---

### ✅ 3. Grouped-Search API 활용
```javascript
// front/src/services/api.js
export const contentsAPI = {
  searchContents: (query) => api.get('/api/contents/search', { params: { query } }),
  groupedSearch: (query) => api.get('/api/contents/grouped-search', { params: { query } }),
};

// front/src/stores/contentsStore.js
searchContents: async (query, useGrouped = true) => {
  const response = await (useGrouped 
    ? contentsAPI.groupedSearch(query) 
    : contentsAPI.searchContents(query));
  // 그룹화된 결과 처리
}
```

- ✅ 원본 + 번역본 그룹화 검색 지원
- ✅ 검색 결과에서 언어별 버전 확인 가능
- ✅ 하위 호환성 유지 (기존 flat list도 지원)

---

### ✅ 4. 자막 싱크 기능 구현
```javascript
// front/src/pages/Player.jsx
const handleTimeUpdate = () => {
  if (videoRef.current) {
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    
    // 자막 싱크: 현재 시간에 해당하는 스크립트 자동 선택
    const currentMs = time * 1000;
    const activeScript = scripts.find(s => 
      currentMs >= s.startMs && currentMs < s.endMs
    );
    
    if (activeScript && (!selectedScript || selectedScript.scriptId !== activeScript.scriptId)) {
      setSelectedScript(activeScript);
    }
  }
};
```

- ✅ 비디오 재생 시간에 맞춰 스크립트 자동 하이라이트
- ✅ 시청자가 현재 재생 중인 문장을 쉽게 파악
- ✅ 따라 말하기 연습 편의성 향상

---

### ✅ 5. 전역 에러 토스트 시스템
1. **Toast 컴포넌트 및 Store 생성**
```javascript
// front/src/components/Toast.jsx
export const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (message, type, duration) => { /* ... */ },
  success: (message, duration) => { /* ... */ },
  error: (message, duration) => { /* ... */ },
  warning: (message, duration) => { /* ... */ },
  info: (message, duration) => { /* ... */ },
}));
```

2. **에러 핸들러 통합**
```javascript
// front/src/services/errorHandler.js
import { useToastStore } from '../components/Toast';

export const withErrorHandling = async (apiCall, options = {}) => {
  try {
    return await apiCall();
  } catch (error) {
    if (showToast) {
      const toast = useToastStore.getState();
      toast.error(getErrorMessage(error), 4000);
    }
    throw error;
  }
};
```

3. **App.jsx에 ToastContainer 추가**

- ✅ 모든 API 에러 자동으로 토스트 표시
- ✅ 성공 메시지도 토스트로 표시 (번역 요청 등)
- ✅ 4가지 타입 지원 (success, error, warning, info)
- ✅ 자동 사라짐 + 수동 닫기 지원
- ✅ 우아한 슬라이드 애니메이션

---

### ✅ 6. scriptId 파라미터 전달 수정
```javascript
// front/src/stores/tutorStore.js (수정 전)
analyzePronunciation: async (audioFile, userId, contentsId, lang) => {
  const response = await tutorAPI.analyzePronunciation(audioFile, userId, contentsId, lang);
  // ❌ scriptId 누락
}

// (수정 후)
analyzePronunciation: async (audioFile, userId, contentsId, scriptId, lang) => {
  const response = await tutorAPI.analyzePronunciation(audioFile, userId, contentsId, scriptId, lang);
  // ✅ scriptId 추가
}
```

- ✅ 백엔드 API와 매칭
- ✅ 발음 평가 시 어떤 스크립트를 연습했는지 정확히 기록
- ✅ 피드백 데이터 정확성 향상

---

## 백엔드 API 사용 현황

| 카테고리 | 엔드포인트 | 메서드 | 프론트 구현 | 상태 |
|---------|-----------|--------|-----------|------|
| **Auth** | `/api/me` | GET | ✅ authStore | ✅ |
| | `/oauth2/authorization/google` | GET | ✅ Login | ✅ |
| | `/oauth2/authorization/kakao` | GET | ✅ Login | ✅ |
| | `/api/logout` | GET | ✅ authStore | ✅ |
| **Contents** | `/api/contents/search` | GET | ✅ contentsStore | ✅ |
| | `/api/contents/grouped-search` | GET | ✅ contentsStore | ✅ |
| **Media** | `/api/media/{contentsId}` | GET | ✅ Player | ✅ |
| **Translation** | `/api/translate` | POST | ✅ TranslationModal | ✅ |
| | `/api/translate/{contentsId}/scripts` | GET | ✅ translationStore | ✅ |
| **Tutor** | `/api/tutor/analyze` | POST | ✅ VoiceRecordingBanner | ✅ |
| | `/api/tutor/feedback/latest` | GET | ✅ tutorStore (persist 대체) | ✅ |

**백엔드 전용 API** (프론트에서 직접 호출 불필요):
- `/api/translations/perso/webhook` (POST) - Perso.ai 웹훅
- `/api/tutor/feedback` (POST) - 레거시, analyze로 대체
- `/api/tutor/feedback-test` (POST) - 테스트 전용

---

## 구현된 주요 기능

### 1. 인증 및 사용자 관리
- ✅ Google OAuth2 로그인
- ✅ Kakao OAuth2 로그인
- ✅ 세션 기반 인증 (withCredentials: true)
- ✅ 자동 로그인 상태 확인
- ✅ 로그아웃 (백엔드 세션 + 프론트 상태 초기화)

### 2. 콘텐츠 검색 및 재생
- ✅ 콘텐츠 검색 (일반 + 그룹화)
- ✅ 검색 결과 그리드 표시
- ✅ 썸네일 + 제목 + 언어 + 재생시간
- ✅ 비디오 스트리밍
- ✅ 재생/일시정지 컨트롤
- ✅ 재생 바 (시간 이동)
- ✅ 재생 속도 조절 (1x, 0.75x, 0.5x)

### 3. 다국어 스크립트
- ✅ 7개 언어 지원
- ✅ 스크립트 목록 표시
- ✅ 스크립트 선택
- ✅ **자막 싱크** (비디오 시간에 따라 자동 하이라이트) - 🆕
- ✅ 선택된 스크립트 하이라이트 표시

### 4. 번역 요청
- ✅ **번역 요청 UI** (TranslationModal) - 🆕
- ✅ 7개 언어 선택
- ✅ 번역 진행 상태 표시
- ✅ 성공/에러 피드백
- ✅ Perso.ai API 연동

### 5. 발음 평가 및 피드백
- ✅ 음성 녹음 (WebRTC MediaRecorder)
- ✅ 실시간 오디오 시각화 (주파수 그래프)
- ✅ 음성 크기에 따른 색상 변화
- ✅ webm 파일 백엔드 전송
- ✅ Azure Speech Service 분석
- ✅ 점수 표시 (finalScore, accuracy, fluency, completeness)
- ✅ 메달 등급 (GOLD, SILVER, BRONZE)
- ✅ AI 피드백 메시지
- ✅ **피드백 히스토리 영속화** (localStorage) - 🆕

### 6. 마이페이지
- ✅ 사용자 정보 표시
- ✅ 학습 통계 (총 연습 횟수, 평균 점수, 학습 언어 수)
- ✅ 발음 연습 기록 목록
- ✅ **새로고침 후에도 데이터 유지** - 🆕
- ✅ 다시 연습 버튼

### 7. 에러 처리 및 UX
- ✅ **전역 토스트 시스템** - 🆕
- ✅ 로딩 상태 (스켈레톤 UI)
- ✅ 에러 메시지 표시
- ✅ 빈 상태 처리
- ✅ ErrorBoundary

---


### 1. 컴포넌트 구조
```
front/src/
├── @design-system/          ✅ 재사용 가능한 디자인 시스템
│   └── components/
├── components/              ✅ 핵심 기능 컴포넌트
│   ├── ErrorBoundary
│   ├── FollowRecorder
│   ├── VoiceRecordingBanner
│   ├── TranslationModal     🆕 번역 요청 모달
│   └── Toast                🆕 전역 토스트
├── pages/                   ✅ 페이지 컴포넌트
│   ├── Home (검색)
│   ├── Login (OAuth2)
│   ├── Mypage (학습 기록)
│   └── Player (재생 + 녹음)
├── services/                ✅ API 및 유틸리티
│   ├── api.js (11개 API)
│   ├── errorHandler.js (토스트 통합) 🆕
│   └── mockData.js
└── stores/                  ✅ Zustand 상태 관리
    ├── authStore
    ├── contentsStore (grouped 지원) 🆕
    ├── translationStore
    └── tutorStore (persist) 🆕
```

### 2. 상태 관리
- ✅ Zustand 기반 (경량, 간단)
- ✅ Persist 미들웨어 활용 (tutorStore)
- ✅ Store 분리 (auth, contents, translation, tutor)
- ✅ 명확한 액션 정의

### 3. API 계층
- ✅ Axios 인스턴스 (baseURL, withCredentials)
- ✅ API별 모듈 분리 (authAPI, contentsAPI, etc.)
- ✅ 에러 핸들링 래퍼 (withErrorHandling)
- ✅ 토스트 통합

---


### 1. 디자인 일관성
- ✅ 통일된 색상 팔레트
- ✅ 귀여운 브랜드 아이덴티티 ("두근두근 지구말")
- ✅ 둥근 모서리 (rounded-[18px])
- ✅ 그라디언트 활용
- ✅ 이모지 적절히 사용

### 2. 반응형 디자인
- ✅ 모바일/태블릿/데스크톱 대응
- ✅ Grid 레이아웃 (lg:grid-cols)
- ✅ 동적 높이 조절

### 3. 사용자 피드백
- ✅ 로딩 상태 (스켈레톤, 스피너)
- ✅ 에러 메시지 (토스트, 인라인)
- ✅ 성공 메시지 (토스트)
- ✅ 빈 상태 (empty state)
- ✅ 애니메이션 (슬라이드, 펄스, 바운스)

### 4. 접근성
- ⚠️ aria-label 일부 적용
- ⚠️ 키보드 네비게이션 개선 필요
- ⚠️ 스크린 리더 최적화 필요

---

## 📈 성능 최적화

### 완료
- ✅ localStorage persist (불필요한 API 호출 감소)
- ✅ 조건부 렌더링
- ✅ 로딩 상태 최적화

### 권장 개선사항
- ⚠️ React.memo, useMemo, useCallback 활용
- ⚠️ 가상 스크롤 (react-window) - 스크립트 100개 이상일 때
- ⚠️ 이미지 최적화 (lazy loading)
- ⚠️ Code splitting (React.lazy)

---

## 🧪 테스트 현황

### 현재
- ✅ errorHandler.test.js (기본 테스트)
- ✅ Jest + Testing Library 환경 구성

### 권장
- ⚠️ Store 테스트 (authStore, contentsStore, etc.)
- ⚠️ 컴포넌트 테스트 (VoiceRecordingBanner, TranslationModal)
- ⚠️ API 테스트 (Mock Service Worker)
- ⚠️ E2E 테스트 (Cypress, Playwright)
