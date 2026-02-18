/**
 * Auth service: all authentication-related API calls in one place.
 * Used by Login, Register, and App to sign in, sign up, get current user, and update profile.
 */
import api from './api';

export const authService = {
  /** Send name, email, password (and optional language) to create a new worker account. Returns { token, user }. */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /** Send email and password; returns { token, user } on success. */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /** Get the currently logged-in user's data. Requires a valid token in the request. */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  /** Update the current user's profile (e.g. name, preferred language). */
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  }
};

