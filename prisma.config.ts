import { defineConfig } from '@prisma/config'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'mysql://root:secretdatabase@localhost:3306/simantik_database',
  },
})