// src/models/auth/AuthResponse.ts
export interface AuthResponse {
  token: string
  user: {
    id: string
    username: string
    email: string
    roles: string[]
  }
}
