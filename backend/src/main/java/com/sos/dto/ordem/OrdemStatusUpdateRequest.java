package com.sos.dto.ordem;

import com.sos.model.StatusOS;
import jakarta.validation.constraints.NotNull;

public record OrdemStatusUpdateRequest(
        @NotNull StatusOS status
) {
}
