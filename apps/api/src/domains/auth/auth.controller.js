import { loginService, meService } from "./auth.service.js";

export const login = async (req, res, next) => {
  try {
    const result = await loginService(req.body);

    res.json({
      success: true,
      message: "Login berhasil",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await meService(req.user.id);

    res.json({
      success: true,
      message: "Data user login",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};