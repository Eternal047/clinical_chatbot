import { loginService, getMeService } from "../services/authService.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son requeridos" });
    }

    const result = await loginService(email, password);

    res.status(200).json({
      message: "Login exitoso",
      data: result,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const usuario = await getMeService(req.user.id);

    res.status(200).json({
      message: "Datos del usuario",
      data: usuario,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
