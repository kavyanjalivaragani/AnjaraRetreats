import express from "express";
import { getUserData, storeRecentSearchedCities, syncUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const userRouter=express.Router();

userRouter.get('/',protect,getUserData);
userRouter.post('/store-recent-search',protect,storeRecentSearchedCities);
userRouter.post('/sync', protect, syncUser);

export default userRouter;