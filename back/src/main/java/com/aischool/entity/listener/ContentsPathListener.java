package com.aischool.entity.listener;

import com.aischool.entity.Contents;
import com.aischool.util.ContentsPathUtil;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

public class ContentsPathListener {

    @PrePersist
    @PreUpdate
    public void normalize(Contents entity) {
        entity.setContentsPath(ContentsPathUtil.normalize(entity.getContentsPath()));
    }
}
