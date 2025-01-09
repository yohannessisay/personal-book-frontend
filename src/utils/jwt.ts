import {jwtDecode} from 'jwt-decode';

const getTokenExpirationTime = (token: string) => {
  try {
    const decoded = jwtDecode<any>(token);
    return decoded.exp * 1000;
  } catch (error) {
    return 0;
  }
};

const isTokenExpired = (token: string) => {
  const expirationTime = getTokenExpirationTime(token);
  return expirationTime < Date.now();
};

export { isTokenExpired, getTokenExpirationTime };
