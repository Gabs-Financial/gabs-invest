import {app, server} from "./app";
import dotenv from "dotenv"
import chalk from "chalk"




dotenv.config();
const PORT = process.env.PORT || 3000;


server.listen(PORT, () => {
    console.log(
        `${chalk.green.bold("Connected")} Server tupac shakur running on ${chalk.yellow.bold(
            process.env.NODE_ENV
        )} on ${chalk.blue.bold(PORT)}`
    )
    // systemLogger.info(`Server running on ${PORT}`);
})


