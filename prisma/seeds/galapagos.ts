export async function seedGalapagos(prisma) {
  const provincia = await prisma.provincia.upsert({
    where: { nombre: "Galápagos" },
    update: {},
    create: { nombre: "Galápagos" },
  });

  const cantones = [
    "Puerto Baquerizo Moreno",
    "Puerto Ayora",
    "Puerto Villamil"
  ];

  for (const canton of cantones) {
    await prisma.canton.upsert({
      where: { nombre: canton },
      update: {},
      create: {
        nombre: canton,
        provinciaId: provincia.id,
      },
    });
  }
}