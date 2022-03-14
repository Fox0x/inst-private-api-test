import { Router } from "express";
import InstController from "./controllers/InstController.mjs";


const router = new Router();

router.get("/followers/:uid", InstController.getFollowers);
router.get("/following/:uid", InstController.getFollowing);
router.get("/getfback/:uid", InstController.getFollowingBack);



export default router;