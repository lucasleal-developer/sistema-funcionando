import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeNeonDb } from "./neondb";
import { runMigrations } from "./runMigrations";
import cors from 'cors';

log("Usando banco de dados Neon PostgreSQL");

// Inicializa o banco de dados Neon e executa as migrações
(async () => {
  const dbInitialized = await initializeNeonDb();
  if (dbInitialized) {
    log("Inicialização do banco de dados Neon concluída com sucesso!");
    
    // Executa as migrações
    const migrationsSuccess = await runMigrations();
    if (migrationsSuccess) {
      log("Migrações executadas com sucesso!");
    } else {
      log("Falha ao executar migrações, verificar logs para detalhes.");
    }
  } else {
    log("Falha na inicialização do banco de dados Neon, verificando logs para detalhes.");
  }
})();

const app = express();

// Configuração do CORS
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Usa a porta fornecida pela Vercel ou a porta padrão
  const port = process.env.PORT ? parseInt(process.env.PORT) : (app.get("env") === "development" ? 3000 : 5000);

  server.listen(port, () => {
    log(`Servidor rodando na porta ${port}`);
    log(`Ambiente: ${app.get("env")}`);
    log(`DATABASE_URL definida: ${!!process.env.DATABASE_URL}`);
  });
})();
