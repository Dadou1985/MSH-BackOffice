import express from "express";
import { PORT } from "./config/env.js";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/errorMiddelware.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerAppSocketHandlers, registerChatSocketHandlers } from "./utils/sockets.js";
import { startApolloServer } from "./graphql/server.js";
import helmet from "helmet";
import cors from "cors";
const app = express();
const allowedOrigins = [
  "https://mysweethotelpro.web.app",
  // ton front MSH-Pro en production
  "https://mysweethotel.eu",
  // ton front MSH en production
  "http://localhost:3000"
  // ton front en dev local
];
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});
registerAppSocketHandlers(io);
registerChatSocketHandlers(io);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(errorMiddleware);
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.get("/", (_, res) => {
  res.send("\u{1F7E2} MSH Back Office API is running");
});
await startApolloServer(app, io);
httpServer.listen(PORT, async () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`Server is running in development mode`);
  } else {
    console.log(`Server is running in production mode`);
  }
});
var app_default = app;
export {
  app_default as default,
  io
};
