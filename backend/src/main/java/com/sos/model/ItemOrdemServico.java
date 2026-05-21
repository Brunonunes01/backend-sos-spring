package com.sos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "itens_ordem_servico")
public class ItemOrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordem_servico_id", nullable = false)
    private OrdemServico ordemServico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id")
    private Servico servico;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_item", nullable = false, length = 20)
    private TipoItemOS tipoItem = TipoItemOS.SERVICO;

    @Column(name = "descricao_item", length = 255)
    private String descricaoItem;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "referencia_link", length = 1000)
    private String referenciaLink;

    @Column(name = "referencia_fonte", length = 150)
    private String referenciaFonte;

    @PrePersist
    @PreUpdate
    public void calcularSubtotal() {
        if (this.quantidade != null && this.precoUnitario != null) {
            this.subtotal = this.precoUnitario.multiply(BigDecimal.valueOf(this.quantidade));
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OrdemServico getOrdemServico() {
        return ordemServico;
    }

    public void setOrdemServico(OrdemServico ordemServico) {
        this.ordemServico = ordemServico;
    }

    public Servico getServico() {
        return servico;
    }

    public void setServico(Servico servico) {
        this.servico = servico;
    }

    public TipoItemOS getTipoItem() {
        return tipoItem;
    }

    public void setTipoItem(TipoItemOS tipoItem) {
        this.tipoItem = tipoItem;
    }

    public String getDescricaoItem() {
        return descricaoItem;
    }

    public void setDescricaoItem(String descricaoItem) {
        this.descricaoItem = descricaoItem;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public BigDecimal getPrecoUnitario() {
        return precoUnitario;
    }

    public void setPrecoUnitario(BigDecimal precoUnitario) {
        this.precoUnitario = precoUnitario;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public String getReferenciaLink() {
        return referenciaLink;
    }

    public void setReferenciaLink(String referenciaLink) {
        this.referenciaLink = referenciaLink;
    }

    public String getReferenciaFonte() {
        return referenciaFonte;
    }

    public void setReferenciaFonte(String referenciaFonte) {
        this.referenciaFonte = referenciaFonte;
    }
}
