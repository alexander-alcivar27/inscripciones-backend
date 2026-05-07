-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "usuario" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_usuario_key" ON "admins"("usuario");
