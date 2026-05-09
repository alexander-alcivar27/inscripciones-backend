export async function seedPastaza(prisma) {
  const provincia = await prisma.provincia.upsert({
    where: { nombre: "Pastaza" },
    update: {},
    create: { nombre: "Pastaza" },
  });

  const cantones = [
    "Puyo",
    "Arajuno",
    "Mera",
    "Santa Clara"
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