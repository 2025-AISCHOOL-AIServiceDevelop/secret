package com.aischool.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class ContentsGroupResponse {
    ContentsDetailResponse original;
    List<ContentsDetailResponse> translations;
}
