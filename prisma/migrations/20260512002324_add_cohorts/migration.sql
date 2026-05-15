-- CreateTable
CREATE TABLE "Cohort" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "courseName" TEXT,
    "moodleUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohortStudent" (
    "id" SERIAL NOT NULL,
    "cohortId" INTEGER NOT NULL,
    "inscriptionId" INTEGER,
    "cedula" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT,
    "correo" TEXT,
    "moodleUsername" TEXT NOT NULL,
    "moodlePassword" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CohortStudent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CohortStudent" ADD CONSTRAINT "CohortStudent_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortStudent" ADD CONSTRAINT "CohortStudent_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
