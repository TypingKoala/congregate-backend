export interface IUserJWTPayload {
  sub: string;
  name: string;
  role: 'admin' | 'normal';
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
