import bcrypt from "bcryptjs";
import prisma from "@skripsi/db";

async function seedAdmin() {
  try {
    const email = "admin@sawit.com";

    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("Admin sudah ada");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        name: "Administrator",
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Admin berhasil dibuat");
    console.log("Email    : admin@sawit.com");
    console.log("Password : admin123");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();