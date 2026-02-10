# Despliegue en Kubernetes (Minikube) - Windows, Ubuntu Desktop y Kali Linux

Este documento explica como levantar el proyecto en Minikube usando las imagenes de Docker Hub (anvillarreal) y los manifests en k8s/.

## Requisitos

- Docker Desktop (Windows/macOS) o Docker Engine (Linux)
- Minikube
- kubectl

Versiones recomendadas:
- Docker >= 24
- Minikube >= 1.31
- kubectl >= 1.27

## 1) Instalacion por sistema operativo

### Windows 10/11

1. Instala Docker Desktop y habilita WSL2.
2. Instala Minikube.
3. Instala kubectl.

En Windows puedes usar:
- https://docs.docker.com/desktop/install/windows-install/
- https://minikube.sigs.k8s.io/docs/start/
- https://kubernetes.io/docs/tasks/tools/

### Ubuntu Desktop

```bash
sudo apt update
sudo apt install -y curl ca-certificates

# Docker Engine
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
chmod +x minikube-linux-amd64
sudo mv minikube-linux-amd64 /usr/local/bin/minikube
```

### Kali Linux

```bash
sudo apt update
sudo apt install -y curl ca-certificates

# Docker Engine
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
chmod +x minikube-linux-amd64
sudo mv minikube-linux-amd64 /usr/local/bin/minikube
```

Reinicia sesion para aplicar el grupo docker:
```bash
newgrp docker
```

## 1.1) Descargar el proyecto (si la VM no tiene nada)

En la VM donde vas a levantar Minikube, instala git y clona el repo:

```bash
sudo apt update
sudo apt install -y git

# reemplaza <REPO_URL> por tu URL (GitHub, GitLab, etc.)
git clone <REPO_URL>
cd Examen-3P-SoftwareSeguro
```

Si no tienes el repo en remoto, copia la carpeta del proyecto a la VM y ejecuta los comandos desde la raiz.

## 2) Iniciar Minikube

```bash
minikube start
```

Opcional (Ingress):
```bash
minikube addons enable ingress
```

## 3) Desplegar manifiestos

Desde la raiz del repo:

```bash
kubectl apply -f k8s/1-namespace.yml
kubectl apply -f k8s/2-deployment.yml
kubectl apply -f k8s/3-service.yml
kubectl apply -f k8s/4-ingress.yml
```

Verifica:
```bash
kubectl get pods -n cooperativa
kubectl get svc -n cooperativa
kubectl get ingress -n cooperativa
```

## 4) Acceso con Port-Forward (recomendado para pruebas)

Abre tres terminales y ejecuta:

```bash
kubectl port-forward -n cooperativa svc/frontend 8085:80
kubectl port-forward -n cooperativa svc/microservicio-cuentas 3000:3000
kubectl port-forward -n cooperativa svc/socios 8080:8080
```

URLs:
- Frontend: http://localhost:8085/
- Socios API: http://localhost:8080/api/socios
- Cuentas API: http://localhost:3000/api-docs

Si el puerto 8080 esta ocupado, cambia el port-forward y luego ajusta las variables del frontend (ver seccion 6).

## 5) Acceso con Ingress (opcional)

Obtiene la IP de Minikube:
```bash
minikube ip
```

Agrega el host en tu archivo hosts.

Windows:
- C:\Windows\System32\drivers\etc\hosts

Linux:
- /etc/hosts

Linea a agregar (reemplaza <MINIKUBE_IP>):
```
<MINIKUBE_IP> cooperativa.local
```

URLs:
- http://cooperativa.local/
- http://cooperativa.local/cuentas/api-docs
- http://cooperativa.local/socios/swagger-ui.html

## 6) Cambiar URLs del frontend (si cambias puertos)

El frontend ahora detecta el entorno en runtime:

- Si se abre en `localhost` o `127.0.0.1`, usa:
  - http://localhost:8080/api/socios
  - http://localhost:3000/cuentas
  - http://localhost:3000/api/cuentas/validaciones
- Si se abre en otro host (ej. `cooperativa.local`), usa rutas del Ingress:
  - /socios
  - /cuentas
  - /cuentas/validaciones

Si necesitas forzar otra URL, puedes usar variables Vite en el build:
- VITE_API_SOCIOS
- VITE_API_CUENTAS
- VITE_API_CUENTAS_VALIDACION

Si necesitas otros puertos, debes reconstruir la imagen del frontend con estos args y volver a subirla.

Ejemplo (local):
```bash
docker build \
  --build-arg VITE_API_SOCIOS=http://localhost:8081/api/socios \
  --build-arg VITE_API_CUENTAS=http://localhost:3000/cuentas \
  --build-arg VITE_API_CUENTAS_VALIDACION=http://localhost:3000/api/cuentas/validaciones \
  -t anvillarreal/frontend:latest \
  -f frontend/Dockerfile frontend
```

## 7) Troubleshooting rapido

- Si ves `ERR_CONNECTION_REFUSED` revisa que el port-forward correcto este activo.
- Si hay 500 en cuentas, revisa logs:
  ```bash
  kubectl logs -n cooperativa deploy/microservicio-cuentas --tail=200
  kubectl logs -n cooperativa deploy/mysql-cuentas --tail=200
  ```
- Si `kubectl get ingress` falla por TLS handshake timeout, usa port-forward o reinicia Minikube:
  ```bash
  minikube stop
  minikube start
  ```

## 8) Dos VMs (Kali y Ubuntu) en la misma red

Recomendado: levantar Minikube solo en UNA VM (Ubuntu) y consumir desde Kali.

### 8.1) Red de VirtualBox

Ambas VMs deben estar en la misma red (NAT Network o Host-Only). La red NAT por defecto (10.0.2.x) no permite comunicacion directa entre VMs.

- Ubuntu Desktop: 10.0.2.15
- Kali Linux: 10.0.2.6

Prueba conectividad desde Kali:
```bash
ping 10.0.2.15
```

### 8.2) Levantar el cluster en Ubuntu (10.0.2.15)

En Ubuntu:
```bash
minikube start
minikube addons enable ingress

kubectl apply -f k8s/1-namespace.yml
kubectl apply -f k8s/2-deployment.yml
kubectl apply -f k8s/3-service.yml
kubectl apply -f k8s/4-ingress.yml
```

### 8.3) Acceso desde Kali

Opcion A (Ingress):
1) En Ubuntu, obtiene la IP del cluster:
```bash
minikube ip
```
2) En Kali, edita `/etc/hosts`:
```
<MINIKUBE_IP> cooperativa.local
```
3) Prueba en Kali:
- http://cooperativa.local/
- http://cooperativa.local/cuentas/api-docs
- http://cooperativa.local/socios/swagger-ui.html

Opcion B (port-forward):
En Ubuntu, expone los puertos a toda la red:
```bash
kubectl port-forward -n cooperativa svc/frontend 8085:80 --address 0.0.0.0
kubectl port-forward -n cooperativa svc/microservicio-cuentas 3000:3000 --address 0.0.0.0
kubectl port-forward -n cooperativa svc/socios 8080:8080 --address 0.0.0.0
```

Desde Kali, usa la IP de Ubuntu:
- http://10.0.2.15:8085/
- http://10.0.2.15:3000/api-docs
- http://10.0.2.15:8080/api/socios

Si no abre, revisa firewall en Ubuntu:
```bash
sudo ufw allow 8085/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
```
