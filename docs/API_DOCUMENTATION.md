# API Documentation - ICS Portal

## Overview
Currently, the ICS Portal operates as a frontend-only application with localStorage-based session management. This document outlines the current data flow and provides guidelines for future backend integration.

## Current Data Flow

### Authentication
- **Method**: Frontend validation with localStorage persistence
- **Storage**: `localStorage.setItem('iitk_username', username)`
- **Validation**: Basic form validation on username and password fields

### Session Management
```typescript
// Login
localStorage.setItem('iitk_username', username);

// Check Authentication
const username = localStorage.getItem('iitk_username');

// Logout
localStorage.removeItem('iitk_username');
```

## Future Backend Integration

### Proposed API Endpoints

#### Authentication Endpoints

##### POST /api/auth/login
```json
// Request
{
  "username": "harshps23",
  "password": "user_password"
}

// Response (Success)
{
  "success": true,
  "user": {
    "username": "harshps23",
    "fullName": "Harsh Pratap Singh",
    "email": "harshps23@iitk.ac.in",
    "role": "student",
    "permissions": ["counselling_access"]
  },
  "token": "jwt_token_here"
}

// Response (Error)
{
  "success": false,
  "error": "Invalid credentials"
}
```

##### POST /api/auth/logout
```json
// Request Headers
Authorization: Bearer jwt_token_here

// Response
{
  "success": true,
  "message": "Logged out successfully"
}
```

##### GET /api/auth/me
```json
// Request Headers
Authorization: Bearer jwt_token_here

// Response
{
  "success": true,
  "user": {
    "username": "harshps23",
    "fullName": "Harsh Pratap Singh",
    "email": "harshps23@iitk.ac.in",
    "role": "student"
  }
}
```

#### Resource Endpoints

##### GET /api/resources
```json
// Request Headers
Authorization: Bearer jwt_token_here

// Response
{
  "success": true,
  "resources": [
    {
      "id": "events",
      "title": "EVENTS BY THE INSTITUTE COUNSELLING SERVICE",
      "description": "Access information about upcoming events and counselling sessions",
      "locked": false,
      "url": "/api/resources/events"
    },
    {
      "id": "ug_info",
      "title": "INFORMATION FOR PROSPECTING UG (2025) STUDENTS",
      "description": "Resources and guidance for undergraduate applicants",
      "locked": true,
      "availableDate": "2024-08-01"
    }
  ]
}
```

##### GET /api/resources/:id
```json
// Request Headers
Authorization: Bearer jwt_token_here

// Response
{
  "success": true,
  "resource": {
    "id": "events",
    "title": "Counselling Events",
    "content": [
      {
        "type": "event",
        "title": "Group Counselling Session",
        "date": "2024-07-15",
        "time": "14:00",
        "location": "Main Auditorium"
      }
    ]
  }
}
```

## Implementation Guidelines

### Adding Backend Integration

#### 1. API Client Setup
```typescript
// lib/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

export const api = new ApiClient();
```

#### 2. Authentication Hook
```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (username: string, password: string) => {
    const response = await api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.success) {
      api.setToken(response.token);
      setUser(response.user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await api.request('/auth/logout', { method: 'POST' });
    api.setToken('');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      api.setToken(token);
      // Verify token with backend
      api.request('/auth/me')
        .then(response => setUser(response.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return { user, login, logout, loading };
};
```

#### 3. Resource Management
```typescript
// hooks/useResources.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useResources = () => {
  return useQuery({
    queryKey: ['resources'],
    queryFn: () => api.request('/resources'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useResource = (id: string) => {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => api.request(`/resources/${id}`),
    enabled: !!id,
  });
};
```

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Resources Table
```sql
CREATE TABLE resources (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content JSONB,
  locked BOOLEAN DEFAULT false,
  available_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### User Sessions Table
```sql
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Considerations

### Authentication
- Use bcrypt for password hashing
- Implement JWT tokens with expiration
- Add rate limiting for login attempts
- Validate IITK email domain

### Authorization
- Role-based access control
- Resource-level permissions
- JWT token validation middleware

### Data Protection
- HTTPS only in production
- Secure cookie settings
- Input sanitization
- SQL injection prevention

## Testing

### API Testing
```bash
# Install testing dependencies
npm install --save-dev supertest jest

# Example test
describe('Auth API', () => {
  test('POST /api/auth/login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'password' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Monitoring & Logging

### API Monitoring
- Request/response logging
- Error tracking
- Performance metrics
- User activity logs

### Frontend Monitoring
- Error boundary implementation
- Performance monitoring
- User interaction tracking

## Environment Configuration

### Development
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
```

### Production
```env
REACT_APP_API_URL=https://api.counselling.iitk.ac.in
REACT_APP_ENVIRONMENT=production
```

---

This documentation will be updated as the backend integration progresses.