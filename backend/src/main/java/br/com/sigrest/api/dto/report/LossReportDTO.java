package br.com.sigrest.api.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LossReportDTO {
    /** "PRODUCAO" (rendimento abaixo do planejado) ou "ESTOQUE" (baixa por perda). */
    private String source;
    private LocalDateTime date;
    private String productName;
    private String reason;
    private BigDecimal quantity;
    private String unit;
    private String description;
}
