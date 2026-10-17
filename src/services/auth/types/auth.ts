export interface LoginSchema {
  id?: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  token?: string;
  expiresAt?: string;
}

export interface GoogleAuthSchema {
  idToken: string;
}

export interface FaceBookAuthSchema {
  accessToken: string;
}