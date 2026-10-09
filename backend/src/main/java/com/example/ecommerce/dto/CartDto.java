package com.example.ecommerce.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartDto {
    private Long id;
    private List<CartItemDto> items = new ArrayList<>();
    private int totalItems = 0;
    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal totalDiscount = BigDecimal.ZERO;
    private BigDecimal shippingFee = BigDecimal.ZERO;
    private BigDecimal totalAmount = BigDecimal.ZERO;

    public CartDto() {
    }

    public CartDto(Long id, List<CartItemDto> items) {
        this.id = id;
        this.items = items != null ? items : new ArrayList<>();
        calculateTotals();
    }

    public void calculateTotals() {
        int count = 0;
        BigDecimal originalSubtotal = BigDecimal.ZERO;
        BigDecimal finalSubtotal = BigDecimal.ZERO;

        for (CartItemDto item : items) {
            count += item.getQuantity();
            BigDecimal origPrice = item.getOriginalPrice() != null ? item.getOriginalPrice() : item.getPrice();
            originalSubtotal = originalSubtotal.add(origPrice.multiply(BigDecimal.valueOf(item.getQuantity())));
            finalSubtotal = finalSubtotal.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        this.totalItems = count;
        this.subtotal = originalSubtotal;
        this.totalDiscount = originalSubtotal.subtract(finalSubtotal);
        // Free shipping if total >= 500, else 40
        if (finalSubtotal.compareTo(BigDecimal.valueOf(500)) >= 0 || finalSubtotal.compareTo(BigDecimal.ZERO) == 0) {
            this.shippingFee = BigDecimal.ZERO;
        } else {
            this.shippingFee = BigDecimal.valueOf(40);
        }
        this.totalAmount = finalSubtotal.add(this.shippingFee);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<CartItemDto> getItems() {
        return items;
    }

    public void setItems(List<CartItemDto> items) {
        this.items = items;
        calculateTotals();
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTotalDiscount() {
        return totalDiscount;
    }

    public void setTotalDiscount(BigDecimal totalDiscount) {
        this.totalDiscount = totalDiscount;
    }

    public BigDecimal getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(BigDecimal shippingFee) {
        this.shippingFee = shippingFee;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
