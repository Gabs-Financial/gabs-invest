import ms from "ms";
import AuthControllers from "./auth.controllers";
import AuthServices from "./auth.services";



const authService = new AuthServices();
 const authControllers = new AuthControllers(authService);



 export {
    authControllers,
    authService
 }


