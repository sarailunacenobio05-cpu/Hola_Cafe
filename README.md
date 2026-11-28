# ¡Hola, Café! – Sistema de Control de Comandas y Monitoreo de Mesas

Aplicación web full-stack para la gestión integral de cafeterías y restaurantes: control de comandas, monitoreo de mesas con botones de llamado IoT, pantalla de cocina (KDS), facturación/caja y comunicación multicanal (correo electrónico, SMS y WhatsApp).

---

## Datos del Equipo
* **Equipo:** 9
* **Integrantes:** Martínez Villalobos Dante, Luna Cenobio Sarai y Ortíz Peréz Gael Fernando
* **Materia:** Programación Web

---

## Tecnologías Utilizadas

* **Backend:** Java 17+, Spring Boot 3.3.x, Spring Security, Flyway, JWT, Twilio SDK, JavaMailSender.
* **Base de Datos:** MySQL
* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
* **Control de Versiones y Gestión:** Git, GitHub, GitHub Projects.
* **Pruebas de API:** Bruno CLI / GUI.
* **Diseño:** Figma.

---

## Credenciales 

| Rol | Correo Electrónico | Contraseña | Nivel de Acceso |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@holacafe.com` | `HolaCafe#2026` | Acceso total, gestión de usuarios, catálogo, cortes y métricas |
| **Mesero** | `gortiz@holacafe.com` | `HolaCafe#2026` | Comandero, asignación de mesas y atención de alertas |
| **Cocinero** | `cocina@holacafe.com` | `HolaCafe#2026` | Pantalla de producción y marcado de platillos |


---

## Modelo Entidad-Relación (Base de Datos MySQL)

El modelo cuenta con **15 tablas normalizadas**, incluyendo la relación de muchos a muchos ($N:M$) entre órdenes y productos resuelta a través de la tabla `DETALLES_ORDEN`.

```mermaid
erDiagram
    ROLES {
        int id PK
        string nombre
    }

    USUARIOS {
        string id PK
        int rol_id FK
        string nombre
        string correo
        string password_hash
        string estado
        string metodo_acceso
        datetime fecha_registro
        datetime ultimo_acceso
        string avatar_url
    }

    TOKENS_RECUPERACION {
        int id PK
        string usuario_id FK
        string token
        datetime fecha_expiracion
        boolean usado
    }

    TOKENS_REVOCADOS {
        int id PK
        string token
        datetime fecha_revocacion
    }

    MESAS {
        string id PK
        int numero
        int capacidad
        string estado
        string mesero_id FK
    }

    BOTONES {
        string id PK
        string nombre
        string mesa_id FK
        int bateria
        string estado
    }

    ALERTAS {
        int id PK
        string dispositivo_id FK
        string mesa_id FK
        string usuario_id FK
        boolean estado
        datetime fecha
    }

    CATEGORIAS_MENU {
        int id PK
        string nombre
        string descripcion
    }

    PRODUCTOS_MENU {
        string id PK
        int categoria_id FK
        string nombre
        string descripcion
        decimal precio
        string estado
        boolean permite_notas_cocina
    }

    OPCIONES_PRODUCTO {
        int id PK
        string producto_id FK
        string nombre
        decimal precio_extra
    }

    ORDENES_COMANDAS {
        string id PK
        int folio
        string mesa_id FK
        string mesero_id FK
        string corte_caja_id FK
        string estado
        decimal subtotal
        decimal descuento_porcentaje
        decimal propina
        decimal total
        string metodo_pago
        decimal monto_pagado
        decimal cambio
        string telefono
        datetime fecha
    }

    DETALLES_ORDEN {
        int id PK
        string orden_id FK
        string producto_id FK
        int opcion_id FK
        int cantidad
        decimal precio_unitario
        decimal subtotal
        string notas
        boolean completado
        datetime fecha_completado
    }

    TICKETS_COCINA {
        string id PK
        string orden_id FK
        string estado
        datetime fecha_creacion
    }

    CORTES_CAJA {
        string folio PK
        string responsable_id FK
        decimal total_ventas
        decimal monto_efectivo
        decimal monto_tarjeta
        decimal monto_transferencia_qr
        int total_tickets
        string observaciones
        datetime fecha
    }

    ESTADO_OPERATIVO {
        string clave PK
        string valor
        bigint version
        datetime actualizado_en
    }

    ROLES ||--o{ USUARIOS : "asigna perfil"
    USUARIOS ||--o{ TOKENS_RECUPERACION : "solicita"

    USUARIOS ||--o{ MESAS : "atiende"
    USUARIOS ||--o{ ORDENES_COMANDAS : "registra / cobra"
    USUARIOS ||--o{ ALERTAS : "atiende alerta"
    USUARIOS ||--o{ CORTES_CAJA : "cierra turno"

    MESAS ||--o| BOTONES : "tiene instalado"
    MESAS ||--o{ ORDENES_COMANDAS : "recibe comanda"
    MESAS ||--o{ ALERTAS : "origina evento"

    BOTONES ||--o{ ALERTAS : "transmite señal"

    CATEGORIAS_MENU ||--o{ PRODUCTOS_MENU : "agrupa"
    PRODUCTOS_MENU ||--o{ OPCIONES_PRODUCTO : "ofrece variantes"
    OPCIONES_PRODUCTO |o--o{ DETALLES_ORDEN : "personaliza"

    ORDENES_COMANDAS ||--|{ DETALLES_ORDEN : "contiene"
    PRODUCTOS_MENU ||--o{ DETALLES_ORDEN : "incluido en"

    ORDENES_COMANDAS ||--o{ TICKETS_COCINA : "envia a cocina"
    ORDENES_COMANDAS }o--o| CORTES_CAJA : "se liquida en"
```

---

## Instrucciones de Instalación y Ejecución

### 1. Base de Datos (MySQL)
1. Iniciar el servicio de **MySQL** en XAMPP o servicio local.
2. Crear la base de datos vacía:
   ```sql
   CREATE DATABASE holacafe_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *(Las tablas y los datos de prueba son creados automáticamente por Flyway al iniciar el backend).*
3. El script de respaldo SQL está disponible en: `db/respaldo_holacafe.sql`.

### 2. Backend (Spring Boot)
```bash
cd backend
# Compilar y arrancar la aplicación
mvn spring-boot:run
```
La API estará disponible en: `http://localhost:4000/api`

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
La interfaz de usuario estará disponible en: `http://localhost:3000` 

---

## Enlaces del Proyecto
* **Tablero de GitHub Projects:** [Enlace a GitHub Projects](https://github.com/users/sarailunacenobio05-cpu/projects/3)
* **Prototipo Navegable en Figma:** [Enlace a Figma](https://www.figma.com/proto/SpSkMYMPmkKvtXkX2g9LoV/PrograWeb?node-id=42-1047&p=f&t=T4PO96IxY48eLIyl-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=42%3A1047&show-proto-sidebar=1)
* **URL Base de la API (Producción VPS):** `https://holacafe.tech/api`
* **URL de la Aplicación (Producción VPS):** [Enlace al sistema](https://holacafe.tech)

---

## Capturas de Pantalla

### Inicio de Sesión
![Inicio de Sesión](Capturas%20README/login.png)

### Mapa de Mesas y Comandero (Mesero)
![Mapa de Mesas](Capturas%20README/mesas.png)

### Pantalla de Cocina (KDS)
![Cocina KDS](Capturas%20README/cocina.png)

### Panel de Administrador y Botones IoT
![Panel Administrador](Capturas%20README/admin.png)
