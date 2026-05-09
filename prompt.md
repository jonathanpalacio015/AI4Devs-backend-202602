# Prompts utilizados

## Prompts del usuario (Sesión 1)

1. levantar todo
2. quitar mensaje hola lti del backend
3. Eres un experto analista-desarrollador. necesito que accedas al archivo readme.md y analices el sistema base del cual vamos a desarrollar desde esa posición crear dos nuevos endpoints que nos permitirán manipular la lista de candidatos de una aplicación en una interfaz tipo kanban.
   1-GET /positions/:id/candidates Recogerá todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Proporcionando:
    -Nombre completo del candidato (de la tabla candidate).
    -current_interview_step: en qué fase del proceso  (de la tabla application).
    -La puntuación media del candidato. (interview) realizada por el candidato tiene un score

   2-PUT /candidates/:id/stage
   Actualizará la etapa del candidato movido. Permite modificar la fase actual en la que se encuentra un candidato específico.
4. ok
5. perfecto crea ademas un archivo prompt.md y agrega en el mismo los prompt utilizados
6. necesito que revises el backend y te conectes a la base  del readme.md, y levanta todo nuevamente

## Análisis del primer prompt solicitado

Primer prompt analizado: `levantar todo`.

Estado actual:
- Backend levantado y respondiendo en `http://localhost:3010`.
- Frontend levantado y compilando correctamente en `http://localhost:3000`.
- Endpoints kanban implementados y conectados en frontend:
  - `GET /positions/:id/candidates`
  - `PUT /candidates/:id/stage`

Falta por crear o reforzar:
1. Datos funcionales de negocio (applications/interviews) para ver kanban con volumen real.
2. Flujo UI de mover etapa por drag and drop (actualmente la actualizacion es por input + boton).
3. E2E automatizado entre frontend y backend (actualmente hay pruebas unitarias/contrato, no prueba punta a punta).

## Prompts del usuario (Sesión 2)

7. Crea tests para los dos endpoints nuevos siguiendo el patrón de testing existente en el proyecto
   Para cada endpoint necesito:
   - Test tdd, casos 404,400,
   - Mock de Prisma Client para no depender de la base de datos real
   -Revisa la implementación de ambos endpoints y dime si hay casos no cubiertos.
   -Propón soluciones para cada caso e impleméntalas si suponen un cambio en el código
   -Aplica candidatos en bd
   -levanta todo nuevamente para realizar pruebas desde el frontend
   -Agrega la solicitud prompt md

## Prompts del usuario (Sesion 3)

8. Error al añadir candidato: Datos inválidos: Error: Teléfono inválido, corregir
9. validar 54
10. 543512322850
11. ampliar a esta cantidad
12. el frontend no refleja los endpoints solicitados
13. ok asienta esta solicitud en el prompt, deja regitro del error, incluye pruebas en la carpeta test para que esto no suceda en futuros endpoints

## Prompts del usuario (Sesion 4)

14. Revisa nuevamente prompt.md cada entrevista necesita asinar un puntaje, es necesario implementar score en front, y la busqueda debe ser consecuente a la fase de entrevista, ajustar criterio de busqueda en relacion a los comentarios y css

## Prompts del usuario (Sesion 5)

15. eliminar id posicion de la busqueda y que sea solo por fase y buscador
16. continuar


### Test de integración de rutas UI
- Se agregó prueba automatizada en `frontend/src/tests/kanbanRoute.test.js` que valida:
  - El dashboard muestra el botón de navegación a Kanban.
  - Al hacer click, la página Kanban se renderiza correctamente.

## Registro de errores y acciones correctivas

### Error 1: Validacion de telefono demasiado estricta
- Sintoma: El alta de candidato fallaba con `Datos inválidos: Error: Teléfono inválido`.
- Causa raiz: La validacion solo aceptaba telefono local ES de 9 digitos sin separadores.
- Correccion aplicada: Se agrego normalizacion y soporte internacional (10 a 15 digitos), manteniendo compatibilidad con formato local.
- Evidencia: Tests backend en `backend/src/tests/validator.test.ts` y prueba real de POST /candidates.

### Error 2: Frontend no reflejaba endpoints Kanban
- Sintoma: La UI no consumia `GET /positions/:id/candidates` ni `PUT /candidates/:id/stage`.
- Causa raiz: Dashboard sin vista Kanban y sin wiring de rutas/endpoints.
- Correccion aplicada:
  1. Nueva vista Kanban en frontend conectada a ambos endpoints.
  2. Servicio frontend centralizado para endpoints de candidatos.
  3. Remplazo de axios por fetch para evitar fallo por dependencia ausente.

### Error 3: Riesgo de regresion en futuros endpoints frontend
- Riesgo detectado: No habia pruebas en frontend para validar wiring de URL/metodo/payload.
- Prevencion aplicada: Se crearon pruebas de contrato en carpeta `frontend/src/tests` para verificar consumo de endpoints y manejo de errores API.

### Error 4: Falta de asignacion de puntaje por entrevista en frontend
- Sintoma: El kanban solo mostraba promedio, pero no permitia asignar score por entrevista.
- Causa raiz: No existia endpoint de actualizacion de score ni controles UI para guardar puntajes.
- Correccion aplicada:
  1. Nuevo endpoint backend `PUT /candidates/:id/score`.
  2. Integracion frontend con formulario `Asignar puntaje (0-100)` por candidato.
  3. Prueba de contrato frontend para endpoint de score.

### Ajuste de criterio de busqueda por fase
- Criterio aplicado en Kanban:
  1. Filtro por `Fase de entrevista` basado en `current_interview_step`.
  2. Busqueda por nombre (`fullName`) dentro de la fase seleccionada.
  3. Resultado agrupado por fase con estilos consistentes al formulario de alta de candidato (cards con `shadow`, inputs `shadow-sm`, botones alineados al mismo estilo).
  4. Se eliminó el campo `Position ID` de la búsqueda UI; el tablero trabaja con posición fija y filtros de fase + buscador.

## Endpoints HTTP probados

### GET /positions/:id/candidates
- Método: GET
- Parámetro: id (position ID)
- Respuesta esperada: Array de objetos con:
  - applicationId: number
  - candidateId: number
  - fullName: string
  - current_interview_step: number (ID del paso actual)
  - averageScore: number | null (promedio de scores de entrevistas)

### PUT /candidates/:id/stage
- Método: PUT
- Parámetro: id (candidate ID)
- Body requerido:
  ```json
  {
    "positionId": number,
    "currentInterviewStep": number (ID del nuevo paso)
  }
  ```
- Respuesta esperada:
  ```json
  {
    "message": "Candidate stage updated successfully",
    "data": { ... updated application object ... }
  }
  ```

### PUT /candidates/:id/score
- Método: PUT
- Parámetro: id (candidate ID)
- Body requerido:
  ```json
  {
    "positionId": number,
    "score": number (0-100)
  }
  ```
- Respuesta esperada:
  ```json
  {
    "message": "Candidate interview score updated successfully",
    "data": { ... updated/created interview object ... }
  }
  ```

## Tests implementados

### candidateService.test.ts (24 tests)
- getCandidatesInProcessByPosition:
  - Retorna array vacío para posición sin aplicaciones
  - Retorna candidatos con average score calculado
  - Retorna null para average score si no hay scores
  - Maneja múltiples candidatos por posición
  - Maneja nombres nulos con fallback N/A
  - Recorta whitespace de nombres
  
- updateCandidateStage:
  - Retorna null cuando no encuentra aplicación
  - Actualiza etapa correctamente
  - Maneja múltiples aplicaciones (usa la más reciente)
  - Rechaza steps de entrevista inválidos (FK constraint P2003)

### candidateController.test.ts (14 tests)
- getCandidatesByPositionController:
  - 200 con lista de candidatos válida
  - 400 cuando ID de posición no es número
  - 200 con array vacío para posición sin candidatos
  - 500 en errores de servicio

- updateCandidateStageController:
  - 200 cuando se actualiza exitosamente
  - 400 cuando candidate ID no es válido
  - 400 cuando falta positionId
  - 400 cuando falta currentInterviewStep
  - 400 cuando positionId no es número
  - 400 cuando currentInterviewStep no es número
  - 404 cuando no existe aplicación
  - 400 cuando interview step inválido (FK constraint)
  - 500 en errores inesperados

## Mejoras implementadas

1. Actualización de schema.prisma para usar env("DATABASE_URL") en lugar de credenciales hardcodeadas
2. Manejo robusto de nombres nulos en getCandidatesInProcessByPosition (fallback a "N/A")
3. Configuración de prisma.seed en package.json para seeding
4. Tests con mocks completos de Prisma Client sin dependencia de BD real
5. Validación de tipos de entrada (400 errors para parámetros inválidos)
6. Validación de constraints de FK (400 errors para IDs inválidos)
