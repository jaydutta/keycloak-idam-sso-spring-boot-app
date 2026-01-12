# IDAM Application - Identity and Access Management(keycloak-v26.4.7)

	A complete Identity and Access Management application built with Spring Boot 3.2, React 18, and Keycloak 26.4.7, featuring OAuth 2.0 and OpenID Connect authentication.

## 🚀 Features

- **Secure Authentication**: OAuth 2.0 and OpenID Connect
- **User Management**: Complete user lifecycle with role-based access
- **Authorization**: Fine-grained access control with realm and resource roles
- **Modern Stack**: Spring Boot 3.2, React 18, Java 21, Keycloak 26.4.7
- **Responsive UI**: Beautiful, modern interface with React
- **Protected Routes**: Route-level security based on user roles
- **Token Management**: Automatic token refresh and session management

## 📋 Prerequisites

- **Java 21** (JDK 21)
- **Maven 3.8+**
- **Node.js 18+** and npm
- **Keycloak 26.4.7** (or compatible version)

## 🔧 Keycloak Setup

### 1. Download and Start Keycloak

```bash
# Download Keycloak 26.4.7
wget https://github.com/keycloak/keycloak/releases/download/23.0.3/keycloak-23.0.3.tar.gz

# Extract
tar -xzf keycloak-23.0.3.tar.gz
cd keycloak-23.0.3

# Start Keycloak in development mode
./bin/kc.sh start-dev
```

Keycloak will start on `http://localhost:8081`

### 2. Create Admin Account

- Navigate to `http://localhost:8081`
- Create admin username and password (e.g., admin/admin)

### 3. Create Realm: `idamrealm`

# idam-keycloak-sso-app