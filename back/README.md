# Backend - Secret Project

## 필수 요구사항

### FFmpeg 설치

음성 녹음 분석 기능을 사용하려면 FFmpeg가 필요합니다.

#### Windows 설치 방법

**방법 1: 프로젝트 로컬 설치 (권장)**

```bash
cd back
mkdir -p tools
cd tools
curl -L -o ffmpeg.zip "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
unzip ffmpeg.zip
mv ffmpeg-master-latest-win64-gpl ffmpeg
```

이미 `application.properties`에 `ffmpeg.path=./tools/ffmpeg/bin/ffmpeg.exe`로 설정되어 있습니다.

**방법 2: Chocolatey 사용**

```bash
choco install ffmpeg
```

**방법 3: 수동 설치**

1. https://github.com/BtbN/FFmpeg-Builds/releases 접속
2. `ffmpeg-master-latest-win64-gpl.zip` 다운로드
3. 압축 해제 후 `bin` 폴더를 적절한 위치에 배치
4. `application.properties`에서 `ffmpeg.path` 설정 또는 시스템 PATH에 추가

#### macOS/Linux 설치

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

### 설치 확인

```bash
ffmpeg -version
```

FFmpeg가 정상적으로 설치되면 음성 녹음 분석 기능(`/api/tutor/analyze`)이 작동합니다.

## 실행

```bash
./mvnw spring-boot:run
```

## 주요 API 엔드포인트

- `POST /api/tutor/analyze` - 음성 파일 발음 분석 (FFmpeg 필요)
- `GET /api/translate/{contentsId}/scripts` - 스크립트 조회
- `GET /api/media/{contentsId}` - 영상 스트리밍
- `GET /api/contents/search?query=` - 콘텐츠 검색

