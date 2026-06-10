export const rolesMiddleware = (rolesRequeridos = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (rolesRequeridos.length === 0) {
      return next();
    }

    if (!rolesRequeridos.includes(req.user.rol)) {
      return res
        .status(403)
        .json({ error: "Acceso denegado: permiso insuficiente" });
    }

    next();
  };
};
