import axios from "axios";
import config from "../../config/app.config";



const axiosInstance = axios.create({
    baseURL: config.ANCHOR_URL,
    headers: {
        'Content-Type': 'application/json',
        'x-anchor-key': config.ANCHOR_API_KEY,
        Accept: 'application/json',
    },
});

export abstract class AnchorBaseClass {
    protected readonly axios = axiosInstance;

    protected constructor() { }
}