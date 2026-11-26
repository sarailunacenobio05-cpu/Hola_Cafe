package com.holacafe.service;

import com.holacafe.dto.GuardarProductoRequest;
import com.holacafe.dto.CategoriaResponse;
import com.holacafe.dto.ProductoResponse;
import com.holacafe.exception.ResourceNotFoundException;
import com.holacafe.model.CategoriaMenu;
import com.holacafe.model.OpcionProducto;
import com.holacafe.model.ProductoMenu;
import com.holacafe.repositories.CategoriaMenuRepository;
import com.holacafe.repositories.ProductoMenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductoService {
        private final ProductoMenuRepository productoMenuRepository;
        private final CategoriaMenuRepository categoriaMenuRepository;

        @Transactional(readOnly = true)
        public List<ProductoResponse> listarTodos() {
                return productoMenuRepository.findAll()
                                .stream()
                                .filter(p -> !"ELIMINADO".equalsIgnoreCase(p.getEstado()))
                                .map(this::mapearProducto)
                                .toList();
        }
        @Transactional(readOnly = true)
        public List<ProductoResponse> listarFiltrados(String search, String categoria, String estado) {
                return productoMenuRepository.findAll()
                                .stream()
                                .filter(p -> !"ELIMINADO".equalsIgnoreCase(p.getEstado()))
                                .filter(p -> {
                                        if (search == null || search.isBlank()) return true;
                                        String q = search.trim().toLowerCase();
                                        return p.getNombre().toLowerCase().contains(q)
                                                        || (p.getDescripcion() != null && p.getDescripcion().toLowerCase().contains(q));
                                })
                                .filter(p -> {
                                        if (categoria == null || categoria.isBlank() || "Todas".equalsIgnoreCase(categoria)) return true;
                                        return p.getCategoria() != null
                                                        && p.getCategoria().getNombre().trim().equalsIgnoreCase(categoria.trim());
                                })
                                .filter(p -> {
                                        if (estado == null || estado.isBlank() || "Todos".equalsIgnoreCase(estado)) return true;
                                        return p.getEstado().equalsIgnoreCase(estado.trim());
                                })
                                .map(this::mapearProducto)
                                .toList();
        }
        @Transactional(readOnly = true)
        public java.util.Map<String, Object> listarPaginado(int page, int size, String search, String categoria, String estado) {
                List<ProductoResponse> filtrados = listarFiltrados(search, categoria, estado);
                int totalElements = filtrados.size();
                int totalPages = Math.max(1, (int) Math.ceil((double) totalElements / size));
                int paginaSegura = Math.max(1, Math.min(page, totalPages));
                int inicio = (paginaSegura - 1) * size;
                int fin = Math.min(inicio + size, totalElements);
                List<ProductoResponse> content = (inicio < totalElements) ? filtrados.subList(inicio, fin) : Collections.emptyList();
                java.util.Map<String, Object> res = new java.util.HashMap<>();
                res.put("content", content);
                res.put("totalElements", totalElements);
                res.put("totalPages", totalPages);
                res.put("number", paginaSegura);
                return res;
        }


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
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Producto no encontrado con ID: " + id));
                return mapearProducto(producto);
        }

        @Transactional(readOnly = true)
        public List<CategoriaResponse> listarCategorias() {
                return categoriaMenuRepository.findAll()
                                .stream()
                                .map(this::mapearCategoria)
                                .toList();
        }

        @Transactional
        public ProductoResponse crearProducto(GuardarProductoRequest request) {
                CategoriaMenu categoria = resolverCategoria(request.getCategoriaNombre());
                ProductoMenu nuevo = new ProductoMenu();
                nuevo.setId("prod-" + UUID.randomUUID().toString().substring(0, 8));
                nuevo.setNombre(request.getNombre());
                nuevo.setDescripcion(request.getDescripcion());
                nuevo.setPrecio(request.getPrecio());
                nuevo.setEstado(request.getEstado() != null ? request.getEstado().toUpperCase() : "DISPONIBLE");
                nuevo.setPermiteNotasCocina(
                                request.getPermiteNotasCocina() != null ? request.getPermiteNotasCocina() : true);
                nuevo.setCategoria(categoria);
                aplicarOpciones(nuevo, request.getOpciones());
                return mapearProducto(productoMenuRepository.save(nuevo));
        }

        @Transactional
        public ProductoResponse actualizarProducto(String id, GuardarProductoRequest request) {
                ProductoMenu producto = productoMenuRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Producto no encontrado con ID: " + id));
                if (request.getCategoriaNombre() != null) {
                        producto.setCategoria(resolverCategoria(request.getCategoriaNombre()));
                }
                producto.setNombre(request.getNombre());
                producto.setDescripcion(request.getDescripcion());
                producto.setPrecio(request.getPrecio());
                if (request.getEstado() != null) {
                        producto.setEstado(request.getEstado().toUpperCase());
                }
                if (request.getPermiteNotasCocina() != null) {
                        producto.setPermiteNotasCocina(request.getPermiteNotasCocina());
                }
                if (request.getOpciones() != null) {
                        aplicarOpciones(producto, request.getOpciones());
                }
                return mapearProducto(productoMenuRepository.save(producto));
        }

        private void aplicarOpciones(ProductoMenu producto, List<String> nombresOpciones) {
                if (nombresOpciones == null) return;
                producto.getOpciones().clear();
                for (String nombre : nombresOpciones) {
                        if (nombre == null || nombre.isBlank()) continue;
                        OpcionProducto opcion = new OpcionProducto();
                        opcion.setProducto(producto);
                        opcion.setNombre(nombre.trim());
                        opcion.setPrecioExtra(BigDecimal.ZERO);
                        producto.getOpciones().add(opcion);
                }
        }

        @Transactional
        public void eliminarProducto(String id) {
                ProductoMenu producto = productoMenuRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Producto no encontrado con ID: " + id));
                producto.setEstado("ELIMINADO");
                productoMenuRepository.save(producto);
        }

        private CategoriaMenu resolverCategoria(String nombreCategoria) {
                if (nombreCategoria == null || nombreCategoria.isBlank()) {
                        return categoriaMenuRepository.findById(1)
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Categoría base no encontrada"));
                }
                return categoriaMenuRepository.findByNombreIgnoreCase(nombreCategoria.trim())
                                .orElseGet(() -> categoriaMenuRepository.findById(1)
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Categoría no encontrada")));
        }

        private ProductoResponse mapearProducto(ProductoMenu producto) {
                List<ProductoResponse.OpcionResponse> opciones = (producto.getOpciones() == null)
                                ? Collections.emptyList()
                                : producto.getOpciones()
                                                .stream()
                                                .map(o -> new ProductoResponse.OpcionResponse(
                                                                o.getId(),
                                                                o.getNombre(),
                                                                o.getPrecioExtra()))
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
                                opciones);
        }

        private CategoriaResponse mapearCategoria(CategoriaMenu categoria) {
                return new CategoriaResponse(
                                categoria.getId(),
                                categoria.getNombre(),
                                categoria.getDescripcion());
        }
}