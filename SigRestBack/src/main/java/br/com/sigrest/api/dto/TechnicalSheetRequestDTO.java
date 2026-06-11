package br.com.sigrest.api.dto; import java.util.List; public record TechnicalSheetRequestDTO(Long id, String name, Long finalProductId, List<TechnicalSheetItemRequestDTO> items) {}
