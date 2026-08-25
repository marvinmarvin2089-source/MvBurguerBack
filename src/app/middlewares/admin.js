const adminMiddleware = (request, response, next) => {
  const isUserAdmin = request.userAdmin;

  if (!isUserAdmin) {
    return response.status(403).json({ error: 'Acesso negado: apenas admin' });
  }

  return next();
};

export default adminMiddleware;
