# Informe de Pruebas y Seguridad

Fecha: 2026-02-10

## 1) Alcance y entorno

- Proyecto desplegado en Kubernetes (Minikube) con servicios: frontend, microservicio-cuentas, socios, mysql-cuentas y postgres-socios.
- Evidencia de despliegue y endpoints documentados en [README-k8s.md](README-k8s.md).
- El presente informe resume evidencias locales encontradas en el repositorio.

## 2) Pruebas unitarias

### 2.1 Socios (Spring Boot)

- Total tests: 64
- Fallos: 0
- Errores: 0
- Skipped: 0
- Fuente: reportes JUnit en [socios/target/surefire-reports](socios/target/surefire-reports).

### 2.2 Microservicio Cuentas (NestJS)

- Cobertura global (Istanbul): 100% statements, 100% branches, 100% functions, 100% lines.
- Fuente: reporte de cobertura en [microservicio-cuentas/coverage/lcov-report/index.html](microservicio-cuentas/coverage/lcov-report/index.html).

## 3) Pruebas E2E (Cypress)

- Especificaciones existentes:
  - [frontend/cypress/e2e/cuentas.cy.js](frontend/cypress/e2e/cuentas.cy.js)
  - [frontend/cypress/e2e/integracion.cy.js](frontend/cypress/e2e/integracion.cy.js)
  - [frontend/cypress/e2e/socios.cy.js](frontend/cypress/e2e/socios.cy.js)
- Evidencia de ejecucion: video en [frontend/cypress/videos/cuentas.cy.js.mp4](frontend/cypress/videos/cuentas.cy.js.mp4).
- Resultado: no se encontraron reportes automatizados adicionales (junit/html) en el repositorio.

## 4) Pruebas de seguridad (pentesting basico)

- Herramientas sugeridas: OWASP ZAP (baseline), Nmap, Nikto.
- Resultado: no se encontraron reportes de seguridad generados en el repositorio.
- Recomendacion: ejecutar un escaneo baseline y adjuntar el reporte al repositorio.

Comandos de referencia:
```bash
# OWASP ZAP baseline (pasivo)
docker run --rm -t owasp/zap2docker-stable zap-baseline.py -t http://<HOST_FRONTEND> -r zap-report.html

# Nmap sobre puertos expuestos
nmap -sV -p 8085,8080,3000 <HOST>

# Nikto (servidor web)
nikto -h http://<HOST_FRONTEND>
```

## 5) Hallazgos relevantes

- Validacion cross-service en socios depende de disponibilidad del microservicio de cuentas.
- La conectividad interna debe usar el service de Kubernetes (no localhost) para evitar errores 500.
- Se requiere politica CORS que incluya el host/IP desde donde se consume el frontend.

## 6) Evidencias y trazabilidad

- Cobertura de cuentas: [microservicio-cuentas/coverage/lcov-report/index.html](microservicio-cuentas/coverage/lcov-report/index.html)
- Reportes JUnit socios: [socios/target/surefire-reports](socios/target/surefire-reports)
- Video E2E cuentas: [frontend/cypress/videos/cuentas.cy.js.mp4](frontend/cypress/videos/cuentas.cy.js.mp4)
