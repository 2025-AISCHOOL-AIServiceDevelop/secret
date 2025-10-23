# Design System

이 디자인 시스템은 "두근두근 지구말" 애플리케이션의 일관된 UI 컴포넌트를 제공합니다.

## 설치 및 사용법

```jsx
import {
  Button,
  Card,
  Input,
  Badge,
  Text
} from '@/design-system'
```

## 컴포넌트 목록

### Buttons (버튼)

#### 기본 사용법
```jsx
import { Button, PrimaryButton, SecondaryButton } from '@/design-system'

<Button variant="primary">기본 버튼</Button>
<PrimaryButton>프라이머리 버튼</PrimaryButton>
<SecondaryButton>세컨더리 버튼</SecondaryButton>
```

#### 버튼 종류
- `Button` - 기본 버튼 (variant prop으로 스타일 지정)
- `PrimaryButton` - 메인 액션 버튼
- `SecondaryButton` - 세컨더리 액션 버튼
- `OutlineButton` - 테두리만 있는 버튼
- `PlayButton` - 재생 버튼
- `KakaoButton` - 카카오 로그인 버튼
- `GoogleButton` - 구글 로그인 버튼
- `TagButton` - 태그 버튼
- `SpeedButton` - 속도 조절 버튼

#### Props
- `variant`: 버튼 스타일 (`primary`, `secondary`, `outline`, `play`, `kakao`, `google`, `tag`, `speed`)
- `size`: 버튼 크기 (`small`, `medium`, `large`)
- `rounded`: 테두리 radius (`none`, `small`, `medium`, `large`, `full`, `xl`)
- `disabled`: 비활성화 상태
- `to`: React Router Link 경로 (링크로 사용시)

### Cards (카드)

#### 기본 사용법
```jsx
import { Card, StoryCard, SidebarCard } from '@/design-system'

<Card>
  <h3>카드 제목</h3>
  <p>카드 내용</p>
</Card>

<StoryCard>동화 카드</StoryCard>
```

#### 카드 종류
- `Card` - 기본 카드
- `StoryCard` - 동화 카드
- `SidebarCard` - 사이드바 카드
- `PlayerCard` - 플레이어 카드
- `LoginCard` - 로그인 카드
- `FormCard` - 폼 카드

### Inputs (입력)

#### 기본 사용법
```jsx
import { Input, SearchInput } from '@/design-system'

<Input placeholder="기본 입력" />
<SearchInput placeholder="검색" />
```

#### 입력 종류
- `Input` - 기본 입력
- `SearchInput` - 검색 입력
- `FileInput` - 파일 입력

### Badges (뱃지)

#### 기본 사용법
```jsx
import { Badge, AgeBadge, LanguageBadge, DotIndicator } from '@/design-system'

<Badge>기본 뱃지</Badge>
<AgeBadge>2-4세</AgeBadge>
<LanguageBadge>한국어</LanguageBadge>
<DotIndicator active={true} />
```

### Typography (타이포그래피)

#### 기본 사용법
```jsx
import { Text, Heading1, StoryTitle, Caption } from '@/design-system'

<Heading1>메인 제목</Heading1>
<StoryTitle>동화 제목</StoryTitle>
<Text>본문 텍스트</Text>
<Caption>캡션 텍스트</Caption>
```

#### 텍스트 종류
- `Text` - 기본 텍스트
- `Heading1`, `Heading2`, `Heading3`, `Heading4` - 제목
- `BodyText` - 본문
- `Caption` - 캡션
- `Label` - 라벨
- `AppTitle` - 앱 제목
- `StoryTitle` - 동화 제목
- `StoryDescription` - 동화 설명
- `SectionTitle` - 섹션 제목
- `PlayerText` - 플레이어 텍스트
- `PlayerSubText` - 플레이어 서브 텍스트

### Layout (레이아웃)

#### 기본 사용법
```jsx
import { Container, Grid, Flex, Spacer } from '@/design-system'

<Container>
  <Grid cols={3} gap={4}>
    <div>아이템 1</div>
    <div>아이템 2</div>
    <div>아이템 3</div>
  </Grid>

  <Flex justify="between" align="center">
    <div>왼쪽</div>
    <div>오른쪽</div>
  </Flex>

  <Spacer size="large" />
</Container>
```

### Media (미디어)

#### 기본 사용법
```jsx
import { Image, Avatar, ProgressBar, AudioControls } from '@/design-system'

<Image src="/path/to/image.jpg" variant="cover" />
<Avatar src="/path/to/avatar.jpg" fallback="U" />
<ProgressBar value={75} max={100} />
<AudioControls
  isPlaying={true}
  progress={45}
  duration="08:30"
  currentTime="02:45"
/>
```

## 색상 시스템

프로젝트에서 사용하는 색상 변수들:

### 기본 색상
- `--color-bg`: #DFE9F6 (배경색)
- `--color-header`: #F0D98B (헤더색)
- `--color-headerBorder`: #9E8C66 (헤더 테두리)
- `--color-textMain`: #3A4B63 (메인 텍스트)
- `--color-muted`: #8A99B2 (뮤트 텍스트)
- `--color-accent`: #6B7CFF (액센트색)
- `--color-panel`: #FFFFFF (패널색)

### 추가 색상
- `--border-radius-lgx`: 18px
- `--border-radius-mdx`: 14px
- `--box-shadow-soft`: 부드러운 그림자

## CSS 클래스

### 버튼 관련
- `.scrollbar-soft`: 부드러운 스크롤바 스타일

## 사용 예시

```jsx
import {
  Container,
  Grid,
  StoryCard,
  StoryTitle,
  StoryDescription,
  PrimaryButton,
  Badge
} from '@/design-system'

function StoryList({ stories }) {
  return (
    <Container>
      <Grid cols={3} gap={4}>
        {stories.map(story => (
          <StoryCard key={story.id}>
            <Image src={story.image} variant="cover" />
            <div className="p-3">
              <StoryTitle>{story.title}</StoryTitle>
              <StoryDescription>{story.description}</StoryDescription>
              <div className="flex justify-between items-center mt-3">
                <Badge>{story.ageGroup}</Badge>
                <PrimaryButton to={`/player/${story.id}`}>
                  재생
                </PrimaryButton>
              </div>
            </div>
          </StoryCard>
        ))}
      </Grid>
    </Container>
  )
}
```
