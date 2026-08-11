package br.com.sigrest.api.dto;

public record ProductionOrderRequestDTO(Long id, Long finalProductId, Integer quantity, String notes) {}
