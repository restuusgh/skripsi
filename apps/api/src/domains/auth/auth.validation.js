export const validateRegister = ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error("Nama, email, dan password wajib diisi");
  }

  if (password.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }
};

export const validateLogin = ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }
};