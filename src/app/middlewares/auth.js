import jwt from 'jsonwebtoken';
import authconfig from '../../config/auth.js';

const authMiddleware = (request, response, next) => {
  const authToken = request.headers.authorization;

  if (!authToken) {
    return response.status(401).json({ error: 'Token not provided' });
  }

  const token = authToken.split(' ')[1];

  try {
    jwt.verify(token, authconfig.secret, (err, decoded) => {
      if (err) {
        return response.status(401).json({ error: 'Token invalid' });
      }
      request.userId = decoded.id;
      request.userName = decoded.name;
      request.userAdmin = decoded.admin;
      return next();
    });
  } catch (_err) {
    return response.status(401).json({ error: 'Token invalid' });
  }
};

export default authMiddleware;
