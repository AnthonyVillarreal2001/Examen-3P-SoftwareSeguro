# Informe de Pruebas y Seguridad

Fecha: 2026-02-10

## 1) Alcance y entorno

- Proyecto con microservicios: frontend (React/Vite), microservicio-cuentas (NestJS), socios (Spring Boot), bases de datos MySQL y PostgreSQL.
- Despliegue recomendado en Minikube con manifiestos en [k8s](k8s).
- Detalles de despliegue y endpoints en [README-k8s.md](README-k8s.md).
- Este informe consolida evidencias locales presentes en el repositorio.

## 2) Preparacion del entorno

### 2.1 Despliegue en Kubernetes (Minikube)

Ejecutar desde la raiz del repositorio:

```bash
minikube start
minikube addons enable ingress

kubectl apply -f k8s/1-namespace.yml
kubectl apply -f k8s/2-deployment.yml
kubectl apply -f k8s/3-service.yml
kubectl apply -f k8s/4-ingress.yml
```

Port-forward recomendado para pruebas locales:

```bash
kubectl port-forward -n cooperativa svc/frontend 8085:80
kubectl port-forward -n cooperativa svc/microservicio-cuentas 3000:3000
kubectl port-forward -n cooperativa svc/socios 8080:8080
```

URLs de referencia:
- Frontend: http://localhost:8085/
- Socios API: http://localhost:8080/api/socios
- Cuentas API: http://localhost:3000/api-docs

## 3) Pruebas unitarias

### 3.1 Socios (Spring Boot)

Pasos de ejecucion:

```bash
cd socios
mvn test
```

Resultados (JUnit Surefire):
- Total tests: 64
- Fallos: 0
- Errores: 0
- Skipped: 0

Evidencia: reportes JUnit en [socios/target/surefire-reports](socios/target/surefire-reports).

### 3.2 Microservicio Cuentas (NestJS)

Pasos de ejecucion:

```bash
cd microservicio-cuentas
npm install
npm run test
npm run test:cov
```

Resultados de cobertura (Istanbul):
- Statements: 100% (148/148)
- Branches: 100% (23/23)
- Functions: 100% (29/29)
- Lines: 100% (136/136)

Evidencia: reporte de cobertura en [microservicio-cuentas/coverage/lcov-report/index.html](microservicio-cuentas/coverage/lcov-report/index.html).

## 4) Pruebas E2E (Cypress)

Precondiciones:
- Servicios arriba (ver seccion 2) con port-forward activo.
- Frontend apuntando a los endpoints correctos (ver [README-k8s.md](README-k8s.md)).

Pasos de ejecucion:

```bash
cd frontend
npm install
npm run test:e2e
```

Especificaciones ejecutadas:
- [frontend/cypress/e2e/cuentas.cy.js](frontend/cypress/e2e/cuentas.cy.js)
- [frontend/cypress/e2e/integracion.cy.js](frontend/cypress/e2e/integracion.cy.js)
- [frontend/cypress/e2e/socios.cy.js](frontend/cypress/e2e/socios.cy.js)

Evidencias:
- Video de ejecucion: [frontend/cypress/videos/cuentas.cy.js.mp4](frontend/cypress/videos/cuentas.cy.js.mp4)
- No se encontraron reportes automatizados (junit/html) en el repositorio.

## 5) Pruebas de seguridad (pentesting basico)

Objetivo:
- Validar configuracion de endpoints, puertos expuestos y encabezados basicos.
- Identificar vulnerabilidades de bajo costo (baseline) antes de un pentest profundo.

Herramientas sugeridas:
- OWASP ZAP (baseline pasivo)
- Nmap (descubrimiento de servicios)
- Nikto (servidor web)

Pasos de ejecucion (plantilla):

```bash
# OWASP ZAP baseline (pasivo)
docker run --rm -t owasp/zap2docker-stable zap-baseline.py -t http://<HOST_FRONTEND> -r zap-report.html

# Nmap sobre puertos expuestos
nmap -sV -p 8085,8080,3000 <HOST>

# Nikto (servidor web)
nikto -h http://<HOST_FRONTEND>
```

Resultados:
- Sin reportes de pentesting en el repositorio.
- Se deja plantilla para adjuntar resultados (ZAP, Nmap, Nikto).

## 6) Hallazgos relevantes

- La validacion cross-service en socios depende de la disponibilidad del microservicio de cuentas.
- La conectividad interna debe usar el service de Kubernetes (no localhost) para evitar errores 500.
- La politica CORS debe incluir el host/IP desde donde se consume el frontend.

## 7) Evidencias y trazabilidad

- Cobertura de cuentas: [microservicio-cuentas/coverage/lcov-report/index.html](microservicio-cuentas/coverage/lcov-report/index.html)
- Reportes JUnit socios: [socios/target/surefire-reports](socios/target/surefire-reports)
- Video E2E cuentas: [frontend/cypress/videos/cuentas.cy.js.mp4](frontend/cypress/videos/cuentas.cy.js.mp4)
