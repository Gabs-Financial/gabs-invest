import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { Anchor_createAccountQueue, Anchor_createDepositAccountQueue, Anchor_verifyCustomerKycQueue } from "./queue-list";
import { Express } from "express"


const serverAdapter = new ExpressAdapter();

const basePath = "/api/v1/ui";

const { addQueue, removeQueue, replaceQueues, setQueues } = createBullBoard({
    queues: [
        new BullMQAdapter(Anchor_createAccountQueue),
        new BullMQAdapter(Anchor_createDepositAccountQueue),
        new BullMQAdapter(Anchor_verifyCustomerKycQueue),

    ],
    serverAdapter,
    options: {
        uiConfig: {
            boardTitle: "Gabs Board",
            //   boardLogo: {
            //     path: "https://cdn.my-domain.com/logo.png",
            //     width: "100px",
            //     height: 200,
            //   },
            miscLinks: [{ text: "Logout", url: "/logout" }],
            //   favIcon: {
            //     default: "static/images/logo.svg",
            //     alternative: "static/favicon-32x32.png",
            //   },
        },
    },
});

serverAdapter.setBasePath(basePath);

export const setupBullBoard = (app: Express) => {
    app.use(basePath, serverAdapter.getRouter());
};
