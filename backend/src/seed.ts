import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    "Hardware",
    "Health",
    "Education",
    "Personal Progress",
    "Software",
    "Food",
    "Travel",
    "Photography",
    "Business"
  ];

  for (const category of categories) {
    // Check if the category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: category }
    });

    // If it doesn't exist, create it
    if (!existingCategory) {
      await prisma.category.create({
        data: {
          name: category
        }
      });
    }
  }

  console.log("Predefined categories added!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
