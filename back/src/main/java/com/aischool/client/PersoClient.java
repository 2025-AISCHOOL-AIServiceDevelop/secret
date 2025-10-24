package com.aischool.client;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PersoClient {

    private final RestClient rest;

    @Value("${perso.base-url}")
    private String baseUrl;

    @Value("${perso.api-key}")
    private String apiKey;

    @PostConstruct
    void check() {
        log.info("[Perso] baseUrl={}", baseUrl);
        log.info("[Perso] apiKey present? {}", apiKey != null && !apiKey.isBlank());
    }

    private Map<String,String> auth() {
        Map<String,String> h = new HashMap<>();
        h.put("PersoLive-APIKey", apiKey);
        return h;
    }

    /** 프로젝트 생성: form-urlencoded 전송 */
    public Map<String, Object> createProject(String inputName,
                                             String inputUrl,
                                             String sourceLang,
                                             Integer durationSec,
                                             Integer numSpeakers) {

        if (durationSec == null) throw new IllegalArgumentException("durationSec required");

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("input_file_name", inputName);
        form.add("input_file_url", inputUrl);
        form.add("source_language", sourceLang);
        form.add("input_file_video_duration_sec", String.valueOf(durationSec));
        if (numSpeakers != null) form.add("input_number_of_speakers", String.valueOf(numSpeakers));

        log.debug("[Perso] createProject form={}", form);

        try {
            return rest.post()
                    .uri(baseUrl + "/api/video_translator/v2/project/")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .headers(h -> auth().forEach(h::set))
                    .body(form)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException ex) {
            log.error("[Perso] createProject error {} {}", ex.getRawStatusCode(), ex.getResponseBodyAsString());
            throw ex;
        }
    }

    /** EXPORT 생성: form-urlencoded 전송 */
    public Map<String, Object> createExport(String projectId,
                                            String targetLang,
                                            String exportType,
                                            boolean lipsync,
                                            boolean watermark,
                                            String serverLabel) {

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("project", projectId);
        form.add("export_type", exportType);         // "INITIAL_EXPORT" / "PROOFREAD_EXPORT"
        form.add("target_language", targetLang);
        form.add("server_label", serverLabel == null ? "" : serverLabel);
        form.add("priority", "0");
        form.add("lipsync", String.valueOf(lipsync));
        form.add("watermark", String.valueOf(watermark));

        log.debug("[Perso] createExport form={}", form);

        try {
            return rest.post()
                    .uri(baseUrl + "/api/video_translator/v2/export/")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .headers(h -> auth().forEach(h::set))
                    .body(form)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException ex) {
            log.error("[Perso] createExport error {} {}", ex.getRawStatusCode(), ex.getResponseBodyAsString());
            throw ex;
        }
    }

    public Map<String, Object> getExport(String exportId) {
        return rest.get()
                .uri(baseUrl + "/api/video_translator/v2/export/{id}/", exportId)
                .headers(h -> auth().forEach(h::set))
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> getProject(String projectId) {
        return rest.get()
                .uri(baseUrl + "/api/video_translator/v2/project/{id}/", projectId)
                .headers(h -> auth().forEach(h::set))
                .retrieve()
                .body(Map.class);
    }
}
