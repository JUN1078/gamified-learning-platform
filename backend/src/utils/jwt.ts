import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const secret: string = process.env.JWT_SECRET || 'secret';
  const expiresIn: string = process.env.JWT_EXPIRE || '7d';

  return jwt.sign({ id: userId }, secret, { expiresIn } as jwt.SignOptions);
};
