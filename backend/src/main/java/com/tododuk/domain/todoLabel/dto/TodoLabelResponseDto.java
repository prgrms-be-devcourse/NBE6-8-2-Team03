package com.tododuk.domain.todoLabel.dto;

import java.util.List;

public record TodoLabelResponseDto(
        int todoId,
        List<Integer> labelIds)
{}
