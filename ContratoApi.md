# API Documentation

Este documento describe los contratos para los microservicios de `inventory_service` y `product_service`. Todas las rutas están protegidas mediante autenticación JWT.

## Autenticación

Todas las rutas requieren un token de autenticación JWT en el encabezado de la solicitud.

### Headers:

## **Inventory Service**

### 1. Obtener la cantidad de un producto en el inventario

- **URL:** `/inventory/:id`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <token>`
- **URL Params:**
  - `id` (int): ID del producto.
- **Response:**
  - **200 OK:**
    ```json
    { 
      "cantidad": int
    }
    ```
  - **404 Not Found:**
    ```json
    { 
      "error": "Producto no encontrado"
    }
    ```
  - **500 Internal Server Error:**
    ```json
    { 
      "error": "Error al obtener la cantidad del producto"
    }
    ```

### 2. Actualizar la cantidad de un producto en el inventario

- **URL:** `/inventory/:id`
- **Method:** `PUT`
- **Headers:**
  - `Authorization: Bearer <token>`
- **URL Params:**
  - `id` (int): ID del producto.
- **Body:**
    ```json
    {
      "cantidad": int
    }
    ```
- **Response:**
  - **200 OK:**
    ```json
    {
      "producto_id": int,
      "cantidad": int
    }
    ```
  - **400 Bad Request:**
    ```json
    {
      "error": "La cantidad es obligatoria"
    }
    ```
  - **404 Not Found:**
    ```json
    {
      "error": "Producto no encontrado"
    }
    ```
  - **500 Internal Server Error:**
    ```json
    {
      "error": "Error al actualizar la cantidad del producto"
    }
    ```

## **Product Service**

### 1. Obtener todos los productos

- **URL:** `/products`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  - **200 OK:**
    ```json
    [
      {
        "id_produ": int,
        "nombre_pro": string,
        "descri_pro": string,
        "precio_pro": float
      },
      ...
    ]
    ```
  - **500 Internal Server Error:**
    ```json
    {
      "error": "Error al obtener los productos"
    }
    ```

### 2. Obtener un producto por ID

- **URL:** `/products/:id`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <token>`
- **URL Params:**
  - `id` (int): ID del producto.
- **Response:**
  - **200 OK:**
    ```json
    {
      "id_produ": int,
      "nombre_pro": string,
      "descri_pro": string,
      "precio_pro": float
    }
    ```
  - **404 Not Found:**
    ```json
    {
      "error": "Producto no encontrado"
    }
    ```
  - **500 Internal Server Error:**
    ```json
    {
      "error": "Error al obtener el producto"
    }
    ```

### 3. Crear un nuevo producto

- **URL:** `/products`
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Body:**
    ```json
    {
      "nombre_pro": string,
      "descri_pro": string,
      "precio_pro": float
    }
    ```
- **Response:**
  - **201 Created:**
    ```json
    {
      "id_produ": int,
      "nombre_pro": string,
      "descri_pro": string,
      "precio_pro": float
    }
    ```
  - **500 Internal Server Error:**
    ```json
    {
      "error": "Error al crear el producto"
    }
    ```

### 4. Actualizar un producto

- **URL:** `/products/:id`
- **Method:** `PUT`
- **Headers:**
  - `Authorization: Bearer <token>`
- **URL Params:**
  - `id` (int): ID del producto.
- **Body:**
    ```json
    {
      "nombre_pro": string,
      "descri_pro": string,
      "precio_pro": float
    }
    ```
- **Response:**
  - **200 OK:**
    ```json
    {
      "id_produ": int,
      "nombre_pro": string,
      "descri_pro": string,
      "precio_pro": float
    }
    ```
  - **404 Not Found:**
    ```json
    {
      "error": "Producto no encontrado"
    }
    ```
  - **500 Internal Server Error:**
    ```json
    {
      "error": "Error al actualizar el producto"
    }
    ```



## **Requisitos de autenticación**

Todas las rutas deben contener el header `Authorization` con un token JWT válido:
```http
Authorization: Bearer <token>
