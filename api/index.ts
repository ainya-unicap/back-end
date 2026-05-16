import express from "express";
import cors from "cors";
import "dotenv/config";
import { prisma } from "../lib/prisma";
import routes from "./routes";

//import router from "./routes/index";

const app: express.Application = express();
app.use(cors());
app.use(express.json());
//app.use(router);

app.use(express.static("src/public"));

app.use("/api", routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Teste n1 ${port}`);
});