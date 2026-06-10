import prisma from "../../config/prisma.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import config from "../../config/env.js";

export const loginService = async (email, password) => {
  const admin = await prisma.administrador.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new Error("Credenciales inválidas");
  }

  const validPassword = await bcryptjs.compare(password, admin.passwordHash);
  if (!validPassword) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    {
      id: admin.id,
      nombre: admin.nombre,
      email: admin.email,
      rol: "ADMIN",
    },
    config.jwt.secret,
    { expiresIn: "7d" },
  );

  return {
    token,
    usuario: {
      id: admin.id,
      nombre: admin.nombre,
      email: admin.email,
      rol: "ADMIN",
    },
  };
};

export const getMeService = async (userId) => {
  const admin = await prisma.administrador.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nombre: true,
      email: true,
    },
  });

  if (!admin) {
    throw new Error("Usuario no encontrado");
  }

  return admin;
};
