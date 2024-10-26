declare namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET : string;
      MAILTRAP_TOKEN : string;
      MAILTRAP_ENDPOINT : string;
    }
  }