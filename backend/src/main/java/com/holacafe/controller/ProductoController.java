package com.holacafe.controller;

import com.holacafe.dto.CategoriaResponse;
import com.holacafe.dto.GuardarProductoRequest;
import com.holacafe.dto.ProductoResponse;
import com.holacafe.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/productos")
@RequiredArgsConstructor
public class ProductoController {
    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listarTodos(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(productoService.listarFiltrados(search, categoria, estado));
    }
    @GetMapping("/paginado")
    public ResponseEntity< java.util.Map<String, Object> > listarPaginado(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(productoService.listarPaginado(page, size, search, categoria, estado));
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<ProductoResponse>> listarPorCategoria(@PathVariable Integer categoriaId) {
        return ResponseEntity.ok(productoService.listarPorCategoria(categoriaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtenerPorId(@PathVariable String id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<CategoriaResponse>> listarCategorias() {
        return ResponseEntity.ok(productoService.listarCategorias());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody GuardarProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crearProducto(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<ProductoResponse> actualizar(
            @PathVariable String id,
            @Valid @RequestBody GuardarProductoRequest request) {
        return ResponseEntity.ok(productoService.actualizarProducto(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }
}