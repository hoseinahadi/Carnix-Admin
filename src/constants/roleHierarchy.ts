// src/constants/roleHierarchy.ts
export const ROLE_HIERARCHY: Record<string, string[]> = {
  SuperAdmin: ['SuperAdmin', 'Admin', 'Manager', 'User', 'Guest', 'Seller'],
  Admin: ['Admin', 'Manager', 'User', 'Guest', 'Seller'],
  Manager: ['Manager', 'User', 'Guest', 'Seller'],
  User: ['User'],
  Guest: ['Guest'],
  Seller: ['Seller'],
};
