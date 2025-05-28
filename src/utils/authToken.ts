export const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJpYXQiOjE2OTg3OTIwMDB9.DX9eN58JlVUzCZKn0T_C2Y8Jv2dfOgpI9dVJ2UXN4Qs";

export const getAuthHeader = () => {
  return `Bearer ${AUTH_TOKEN}`;
};
