# PI-GestionReserva
Se subirá el proyecto gestión de reservas realizada por Antonio Valverde y Raúl Marín 

# 🏢 Sistema de Gestión de Reservas - IES Al-Mudeyne

# Estructura del Proyecto
## 📋 Tabla de Contenidos
1. [Descripción del Proyecto](#-descripción-del-proyecto)
2. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
3. [Requisitos del Sistema](#-requisitos-del-sistema)  
4. [Instalación y Configuración](#-instalación-y-configuración)
5. [Estructura del Proyecto](#-estructura-del-proyecto)
6. [Funcionalidades](#-funcionalidades)


---

## 🏫 Descripción del Proyecto
Aplicación web para la gestión centralizada de reservas de espacios (aulas) y recursos (materiales) en el centro educativo, desarrollada como Proyecto Integrado  (Curso 2024-2025).

**Características principales:**
- Dos perfiles de usuario (Profesor/Equipo Directivo)
- Reservas recurrentes y puntuales
- Validación de solapamientos
- Exportación de informes en PDF

## ✨ Funcionalidades ##
Perfil Profesor
📅 Reserva de espacios/recursos

🔄 Reservas recurrentes (semanal/mensual)

📊 Visualización de:

 -Mis reservas (futuras)

 -Histórico (pasadas)

 -Reservas de hoy

🖨️ Exportación a PDF

Perfil Administrador
🛠️ Gestión CRUD completa de:

Espacios (aulas)

Recursos (materiales)

Usuarios

🔍 Filtrado avanzado de reservas

📈 Informes estadísticos

---

## 🛠️ Tecnologías Utilizadas

### Frontend
| Tecnología | Uso |
|------------|-----|
| Angular 17 | Framework principal |
| Angular Material | Componentes UI |
| PrimeNG | Componentes avanzados |
| RxJS | Gestión de estados |

### Backend
| Tecnología | Uso |
|------------|-----|
| Spring Boot 3 | Framework principal |
| Spring Security | Autenticación y autorización |
| JPA/Hibernate | Persistencia de datos |
| JWT | Tokens de autenticación |

### DevOps
| Tecnología | Uso |
|------------|-----|
| Docker | Contenedorización |
| Docker Compose | Orquestación |
| GitHub Actions | CI/CD |

---

## ⚙️ Requisitos del Sistema

**Mínimos:**
- Docker 24.0+
- Docker Compose 2.20+
- Node.js 20.x
- Java 17
- 4GB RAM

**Recomendados:**
- 8GB RAM
- SSD
- Conexión a internet estable

---

## 🚀 Instalación y Configuración

```bash
# 1. Clonar repositorio
git clone [https://github.com/tu-usuario/gestion-reservas.git](https://github.com/Valverde-Antonio/PI-GestionReserva.git)

# 2. Iniciar servicios
cd gestion-reservas
docker-compose up -d --build

# 3. Acceder a la aplicación
echo "Frontend: http://localhost:4200"
echo "Backend: http://localhost:8080/api"
echo "MySQL: http://localhost:8081"
