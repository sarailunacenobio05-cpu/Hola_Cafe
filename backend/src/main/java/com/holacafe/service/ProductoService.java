package com.holacafe.service;

import com.holacafe.dto.CategoriaResponse;
import com.holacafe.dto.ProductoResponse;
import com.holacafe.exception.ResourceNotFoundException;
import com.holacafe.model.CategoriaMenu;
import com.holacafe.model.ProductoMenu;
import com.holacafe.repositories.CategoriaMenuRepository;
import com.holacafe.repositories.ProductoMenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoMenuRepository productoMenuRepository;
    private final CategoriaMenuRepository categoriaMenuRepository;

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarProductosDisponibles() {
        return productoMenuRepository.findByEstado("DISPONIBLE")
                .stream()
                .map(this::mapearProducto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarPorCategoria(Integer categoriaId) {
        return productoMenuRepository.findByCategoriaId(categoriaId)
                .stream()
                .map(this::mapearProducto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerPorId(String id) {
        ProductoMenu producto = productoMenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));
        return mapearProducto(producto);
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarCategorias() {
        return categoriaMenuRepository.findAll()
                .stream()
                .map(this::mapearCategoria)
                .toList();
    }

    private ProductoResponse mapearProducto(ProductoMenu producto) {
        List<ProductoResponse.OpcionResponse> opciones = producto.getOpciones()
                .stream()
                .map(o -> new ProductoResponse.OpcionResponse(
                        o.getId(),
                        o.getNombre(),
                        o.getPrecioExtra()
                ))
                .toList();

        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getEstado(),
                producto.getCategoria().getNombre(),
                producto.getCategoria().getId(),
                producto.getPermiteNotasCocina(),
                opciones
        );
    }

    private CategoriaResponse mapearCategoria(CategoriaMenu categoria) {
        return new CategoriaResponse(
                categoria.getId(),
                categoria.getNombre(),
                categoria.getDescripcion()
        );
    }
}
