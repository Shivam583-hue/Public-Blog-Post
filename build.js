const { execSync } = require('child_process');

try {
  execSync('npx prisma generate');
} catch (error) {
  console.error('Error during Prisma generation:', error);
  process.exit(1);
} 