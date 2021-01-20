export interface IUserJWTPayload {
  sub: string; // email address
  name: string;
  role: 'admin' | 'normal' | 'anonymous';
}

export const isUserJWTPayload = (obj: any) => {
  try {
    return (
      typeof obj.sub === 'string' &&
      (obj.role === 'admin' || obj.role === 'normal')
    );
  } catch {
    return false;
  }
};
