export async function seedSucumbios(prisma) {
  const provincia = await prisma.provincia.upsert({
    where: { nombre: "Sucumbíos" },
    update: {},
    create: { nombre: "Sucumbíos" },
  });

  const cantones = [
    "Nueva Loja","Cascales","Cuyabeno",
    "Gonzalo Pizarro","Putumayo",
    "Shushufindi","Sucumbíos"
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