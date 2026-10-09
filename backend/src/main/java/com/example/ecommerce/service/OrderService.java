package com.example.ecommerce.service;

import com.example.ecommerce.dto.OrderRequest;
import com.example.ecommerce.dto.OrderResponse;
import com.example.ecommerce.entity.*;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.exception.UnauthorizedException;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse createOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Shopping cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot place order with an empty shopping cart");
        }

        // Validate stock for all cart items before making changes
        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + cartItem.getProduct().getName()));

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product '" + product.getName() + "'. Available: " + product.getStockQuantity());
            }
        }

        Order order = new Order();
        String orderNumber = "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        order.setOrderNumber(orderNumber);
        order.setUser(user);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "DEMO_CARD");
        order.setPaymentStatus("PAID");

        // Shipping details snapshot
        var address = request.getShippingAddress();
        order.setShippingName(address.getFullName().trim());
        order.setShippingPhone(address.getPhone().trim());
        order.setShippingStreet(address.getStreetAddress().trim());
        order.setShippingCity(address.getCity().trim());
        order.setShippingState(address.getState().trim());
        order.setShippingZip(address.getZipCode().trim());
        order.setShippingCountry(address.getCountry() != null ? address.getCountry().trim() : "India");

        BigDecimal originalSubtotal = BigDecimal.ZERO;
        BigDecimal finalSubtotal = BigDecimal.ZERO;

        // Process items, deduct inventory safely, and attach to order
        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId()).get();

            // Deduct stock safely
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            BigDecimal unitOrigPrice = product.getPrice().setScale(2, RoundingMode.HALF_UP);
            BigDecimal unitFinalPrice = product.getDiscountedPrice().setScale(2, RoundingMode.HALF_UP);
            BigDecimal itemTotal = unitFinalPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())).setScale(2, RoundingMode.HALF_UP);

            originalSubtotal = originalSubtotal.add(unitOrigPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            finalSubtotal = finalSubtotal.add(itemTotal);

            OrderItem orderItem = new OrderItem(
                    order,
                    product,
                    product.getName(),
                    product.getImageUrl(),
                    unitFinalPrice,
                    unitOrigPrice,
                    cartItem.getQuantity(),
                    itemTotal
            );

            order.addItem(orderItem);
        }

        // Calculate order financials strictly on server
        BigDecimal discountTotal = originalSubtotal.subtract(finalSubtotal).setScale(2, RoundingMode.HALF_UP);
        BigDecimal shippingFee = (finalSubtotal.compareTo(BigDecimal.valueOf(500)) >= 0) ? BigDecimal.ZERO : BigDecimal.valueOf(40.00);
        BigDecimal orderTotal = finalSubtotal.add(shippingFee).setScale(2, RoundingMode.HALF_UP);

        order.setSubtotalAmount(originalSubtotal.setScale(2, RoundingMode.HALF_UP));
        order.setDiscountAmount(discountTotal);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(orderTotal);

        Order savedOrder = orderRepository.save(order);

        // Clear user's shopping cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return OrderResponse.fromEntity(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have access to view this order");
        }

        return OrderResponse.fromEntity(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to cancel this order");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot cancel an order that has already been " + order.getStatus().name().toLowerCase());
        }

        // Restore inventory for all items
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus("REFUNDED");
        Order saved = orderRepository.save(order);
        return OrderResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(OrderResponse::fromEntity);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED && newStatus != OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot change status of a cancelled order");
        }

        // If transitioning to cancelled from an active state, restore inventory
        if (newStatus == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    Product product = item.getProduct();
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
            order.setPaymentStatus("REFUNDED");
        } else if (newStatus == OrderStatus.DELIVERED) {
            order.setPaymentStatus("PAID");
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        return OrderResponse.fromEntity(saved);
    }
}
