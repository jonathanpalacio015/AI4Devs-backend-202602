# Ejemplos para probar frontend (kanban)

## 1) Alta de candidato desde UI
1. Ir a `http://localhost:3000/add-candidate`.
2. Completar:
   - Nombre: `Lucia`
   - Apellido: `Gomez`
   - Email: `lucia.gomez.demo1@example.com`
   - Telefono: `+34 612 345 678`
   - Direccion: `Madrid`
3. Enviar formulario.
4. Resultado esperado:
   - Mensaje: `Candidato añadido con éxito`.

## 2) Cargar candidatos por posicion en kanban
1. Ir a `http://localhost:3000/kanban`.
2. En `Position ID`, ingresar `1`.
3. Click en `Cargar candidatos`.
4. Resultado esperado:
   - Si hay datos: aparecen columnas por etapa (`Etapa X`) y cards de candidatos.
   - Si no hay datos: `No hay candidatos para la posicion seleccionada.`

## 3) Actualizar etapa de un candidato
1. En una card del kanban, ingresar nuevo valor en `Nueva etapa` (ejemplo: `2`).
2. Click en `Actualizar etapa`.
3. Resultado esperado:
   - Mensaje: `Etapa actualizada para <Nombre>`.
   - La card se refresca y se mueve al grupo de etapa correspondiente.

## 4) Casos de error para validar frontend

### Caso A: positionId invalido
1. En `/kanban`, escribir `abc` (o dejar vacio).
2. Click en `Cargar candidatos`.
3. Resultado esperado: `Ingresa un positionId valido`.

### Caso B: etapa invalida
1. En una card, escribir `abc` en `Nueva etapa`.
2. Click en `Actualizar etapa`.
3. Resultado esperado: `La etapa debe ser un numero valido`.

### Caso C: etapa inexistente en BD
1. En una card, usar un id de etapa no existente (ejemplo: `9999`).
2. Click en `Actualizar etapa`.
3. Resultado esperado: mensaje de error backend propagado por frontend.

## 5) Ejemplos API de apoyo (si necesitas preparar datos)

### GET candidatos por posicion

```http
GET http://localhost:3010/positions/1/candidates
```

### PUT actualizar etapa

```http
PUT http://localhost:3010/candidates/1/stage
Content-Type: application/json

{
  "positionId": 1,
  "currentInterviewStep": 2
}
```

### POST crear candidato

```http
POST http://localhost:3010/candidates
Content-Type: application/json

{
  "firstName": "Lucia",
  "lastName": "Gomez",
  "email": "lucia.gomez.demo2@example.com",
  "phone": "+34 612 345 678",
  "address": "Madrid",
  "educations": [],
  "workExperiences": [],
  "cv": null
}
```
