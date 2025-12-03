package com.aischool.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.net.URL;
import java.nio.charset.StandardCharsets; // (현재는 사용 안 하지만, 추후 인코딩 관련에 쓸 수 있는 import)
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component                         // 스프링 빈으로 등록해서 다른 곳에서 주입받아 사용하는 컴포넌트
@RequiredArgsConstructor           // final 필드/필수 필드 기반 생성자를 자동 생성
public class FileStorage {

    @Value("${storage.root-dir}")  // application 설정값(storage.root-dir)을 주입받는 필드
    private String rootDir;

    /** 공용: 디렉터리가 없으면 생성하고, 존재하도록 보장하는 메서드 */
    private File ensureDir(File dir) {
        if (!dir.exists() && !dir.mkdirs()) { // 디렉터리가 없고, mkdirs()로 생성도 실패한 경우
            throw new IllegalStateException("Cannot create directory: " + dir.getAbsolutePath()); // 예외 발생
        }
        return dir;                           // 존재(또는 성공적으로 생성)하는 디렉터리 객체 반환
    }

    /** 공용: 파일명 충돌 시 -1, -2 를 붙여서 고유한 파일명을 만들어 주는 메서드 */
    private File uniqueDest(File dir, String fileName) {
        String safe = sanitize(fileName);     // 파일명에 쓸 수 없는 문자 제거/치환
        File dest = new File(dir, safe);      // 기본 목적지 파일 객체 생성
        if (!dest.exists()) return dest;      // 동일 이름 파일이 없으면 바로 반환

        int dot = safe.lastIndexOf('.');      // 마지막 점(.) 위치 찾기 → 확장자 구분용
        String base = (dot > 0) ? safe.substring(0, dot) : safe; // 점 앞부분(확장자 제외 파일 이름)
        String ext  = (dot > 0) ? safe.substring(dot) : "";      // 점 포함 뒤부분(확장자)
        int i = 1;                            // 뒤에 붙일 번호 시작값
        File alt;
        do {
            alt = new File(dir, base + "-" + i + ext); // base-1.ext, base-2.ext ... 식으로 시도
            i++;                                       // 번호 증가
        } while (alt.exists());                        // 이미 존재하면 계속 증가시키며 탐색
        return alt;                                    // 존재하지 않는 첫 번째 파일명 반환
    }

    /** ⬇️ 루트(rootDir) 바로 아래에 파일을 저장하는 메서드(하위 폴더 없음) */
    public String downloadToRoot(String fileName, String fileUrl) throws Exception {
        File root = ensureDir(new File(rootDir));          // rootDir 디렉터리가 없으면 생성
        File dest = uniqueDest(root, fileName);            // 충돌 없는 고유 파일 경로 생성
        FileUtils.copyURLToFile(new URL(fileUrl), dest,    // URL에서 파일을 다운로드해서 dest에 저장
                30_000,                                    // 연결 타임아웃(ms)
                120_000);                                  // 읽기 타임아웃(ms)
        return buildPublicPath(null, dest);                // 공개용 경로 문자열로 변환하여 반환
    }

    /** ⬇️ 지정한 하위 폴더(subDir) 안에 파일을 저장하는 메서드 (예: subDir="contents") */
    public String downloadTo(String subDir, String fileName, String fileUrl) throws Exception {
        File base = (subDir == null || subDir.isBlank())   // subDir가 비어있으면 rootDir 그대로 사용
                ? new File(rootDir)
                : new File(rootDir, subDir);               // 있으면 rootDir/subDir 형태로 사용
        ensureDir(base);                                   // 대상 디렉터리가 없으면 생성

        File dest = uniqueDest(base, fileName);            // 충돌 없는 고유 파일 경로 생성
        FileUtils.copyURLToFile(new URL(fileUrl), dest,    // URL → 로컬 파일로 다운로드
                30_000,
                120_000);
        return buildPublicPath(subDir, dest);              // 저장된 파일의 공개용 경로 문자열 반환
    }

    /**
     * 저장된 실제 파일 경로를 서비스에서 노출할 형태(상대/절대 문자열)로 변환하는 메서드
     * 예: rootDir이 "contents" 이고 subDir="thumbs" 라면 "./contents/thumbs/파일명" 형식
     */
    private String buildPublicPath(String subDir, File dest) {
        String base = resolvePublicBase();                 // rootDir를 기반으로 "./contents" 같은 기본 경로 계산
        String normalizedSubDir = normalizeSubDirectory(subDir); // subDir 문자열 정규화(슬래시/.. 제거 등)

        StringBuilder path = new StringBuilder();          // 최종 경로를 조합할 StringBuilder

        if (base.equals(".")) {                            // base가 "."이면 현재 경로 의미
            path.append("./");                             // "./" 로 시작하도록 추가
        } else if (!base.isBlank()) {                      // 비어 있지 않은 base인 경우
            path.append(base);                             // 예: "./contents"
            if (!base.endsWith("/")) {                     // 마지막이 "/"가 아니면
                path.append("/");                          // "/" 추가
            }
        }

        if (!normalizedSubDir.isBlank()) {                 // 정규화된 subDir가 비어있지 않으면
            path.append(normalizedSubDir);                 // 예: "thumbs"
            if (!normalizedSubDir.endsWith("/")) {         // 마지막이 "/"가 아니면
                path.append("/");                          // "/" 추가
            }
        }

        path.append(dest.getName());                       // 마지막에 실제 파일 이름 붙이기
        return path.toString().replace("\\", "/");         // Windows 백슬래시를 슬래시("/")로 통일
    }

    /**
     * rootDir 설정값을 기준으로, 외부에 보여줄 기본 경로 문자열을 만드는 메서드
     * - 절대경로면 마지막 디렉터리 이름만 따서 "./이름" 형태로 변환
     * - 상대경로면 "./상대경로" 로 정규화
     */
    private String resolvePublicBase() {
        String configured = (rootDir == null) ? "" : rootDir.trim(); // 설정값 앞뒤 공백 제거
        if (configured.isBlank()) return ".";                         // 설정이 없으면 현재 디렉터리(".")

        Path path = Paths.get(configured);                            // 문자열을 Path로 변환
        if (path.isAbsolute()) {                                      // 절대 경로인 경우
            Path last = path.getFileName();                           // 마지막 디렉터리 이름만 추출
            String name = (last == null) ? "" : last.toString();      // 이름 문자열로 변환
            if (name.isBlank()) return ".";                           // 이름이 없으면 "."
            return "./" + name;                                       // "./마지막디렉터리" 형태로 반환
        }

        String normalized = path.normalize().toString().replace("\\", "/"); // 상대경로를 정규화하고 슬래시 통일
        if (normalized.isBlank() || ".".equals(normalized)) return ".";     // 비어있거나 "."이면 그대로 "."
        if (!normalized.startsWith("./") && !normalized.startsWith("../")) {// "./"나 "../"로 시작하지 않으면
            normalized = "./" + normalized;                                  // 앞에 "./"를 붙여 상대경로로 맞추기
        }
        return normalized;                                                   // 정규화된 기본 경로 반환
    }

    /**
     * 서브 디렉터리 문자열(subDir)을 안전하게 정규화하는 메서드
     * - 역슬래시 → 슬래시
     * - 앞/뒤 슬래시 제거
     * - ".." 제거(상위 디렉터리 탈출 방지)
     * - 중복 슬래시 정리
     */
    private static String normalizeSubDirectory(String subDir) {
        if (subDir == null) return "";                           // null이면 빈 문자열
        String normalized = subDir.replace("\\", "/").trim();    // 역슬래시를 슬래시로, 공백 제거
        if (normalized.isBlank()) return "";                     // 전부 공백이면 빈 문자열
        normalized = normalized.replace("..", "");               // 상위 디렉터리 표기("..") 제거
        normalized = normalized.replaceAll("^\\./+", "");        // 앞쪽의 "./" 연속 제거
        normalized = normalized.replaceAll("^/+", "")            // 앞쪽의 "/" 제거
                               .replaceAll("/+$", "");           // 뒤쪽의 "/" 제거
        normalized = normalized.replaceAll("/{2,}", "/");        // 중복 슬래시 "//" → "/"
        return normalized;                                       // 정리된 서브 디렉터리 이름 반환
    }

    /** 파일명에 사용할 수 없는 문자, 제어 문자, 예약어 등을 처리해서 안전한 파일명으로 만드는 메서드 */
    public static String sanitize(String name) {
        String s = (name == null) ? "" : name;                           // null이면 빈 문자열로 처리
        // 기본 금지 문자 치환 (\, /, :, *, ?, ", <, >, | → '_')
        s = s.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        // 제어 문자 제거 (보이지 않는 특수 제어 문자)
        s = s.replaceAll("[\\p{Cntrl}]", "");
        if (s.isBlank()) s = "untitled_" + UUID.randomUUID().toString().substring(0, 8);
        // Windows 예약어(CON, PRN, AUX, NUL, COM1~9, LPT1~9)를 피하기 위해 앞에 "_" 붙이기
        if (s.matches("(?i)^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$")) {
            s = "_" + s;
        }
        // 파일명이 너무 길면 앞쪽 120자로 잘라내기
        if (s.length() > 120) s = s.substring(0, 120);
        return s;                                                       // 최종 안전한 파일명 반환
    }
}
