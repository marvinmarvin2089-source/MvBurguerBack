const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET não configurado nas variáveis de ambiente');
}

export default {
  secret,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
