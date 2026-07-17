import { loginService, getMeService } from "./auth.service.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email dan password wajib diisi." });

    const result = await loginService(email, password);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const logout = async (req, res) => {
  res.json({ success: true, message: "Logout berhasil." });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getMeService(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};
