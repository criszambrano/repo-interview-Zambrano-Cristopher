# Prueba Técnica Frontend Angular - Junior

Buenas trades, en este readme detallo las tecnologías, funcionalidades y requisitos implementados en el proyecto.

## Tecnologías utilizadas
- Angular 20
- TypeScript + Jest
- Responsive con CSS
- Clean code y buenas prácticas

## Funcionalidades implementadas
- F1 Listado de productos con paginación y búsqueda
- F2 Búsqueda con debounce
- F3 Selector de registros por página
- F4 Formulario crear/editar con todas las validaciones
- F5 Editar desde menú contextual
- F6 Eliminar con modal de confirmación

## Validaciones completas
- ID: 3-10 caracteres + verificación contra backend
- Nombre: de 5 a 10 caracteres
- logo: Requerido
- Descripción: 10-200 caracteres
- Fecha liberación ≥ hoy
- Fecha revisión = liberación + 1 año (automática)

## Cobertura de pruebas
```
npm test -- --coverage
Resultado: 74.15%
15 tests unitarios aprobados
```
## Cómo ejecutar

Node.js: 
```
npm install
npm run start:dev
```
Angular: 
```
npm install
ng serve
```
