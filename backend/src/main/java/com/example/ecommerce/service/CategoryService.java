package com.example.ecommerce.service;

import com.example.ecommerce.dto.CategoryRequest;
import com.example.ecommerce.dto.CategoryResponse;
import com.example.ecommerce.entity.Category;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.CategoryRepository;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream().map(cat -> {
            long count = productRepository.findByCategoryId(cat.getId(), Pageable.unpaged()).getTotalElements();
            return CategoryResponse.fromEntity(cat, count);
        }).collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        long count = productRepository.findByCategoryId(cat.getId(), Pageable.unpaged()).getTotalElements();
        return CategoryResponse.fromEntity(cat, count);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Category already exists with name: " + request.getName());
        }

        Category category = new Category();
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setActive(request.isActive());

        Category saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved, 0);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (!category.getName().equalsIgnoreCase(request.getName().trim()) &&
                categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Category already exists with name: " + request.getName());
        }

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            category.setImageUrl(request.getImageUrl());
        }
        category.setActive(request.isActive());

        Category updated = categoryRepository.save(category);
        long count = productRepository.findByCategoryId(updated.getId(), Pageable.unpaged()).getTotalElements();
        return CategoryResponse.fromEntity(updated, count);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        long count = productRepository.findByCategoryId(id, Pageable.unpaged()).getTotalElements();
        if (count > 0) {
            throw new BadRequestException("Cannot delete category because it contains " + count + " products.");
        }

        categoryRepository.delete(category);
    }
}
