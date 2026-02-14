import express from 'express';
import { activateUser, deleteUser, getAllUsersAdmin, getUserInfo, loginUser, logoutUser, registerUser, socialAuth, updateAccessToken, updateAvtar, updatePassword, updateUserInfo, updateUserRole } from '../controllers/userController.js';
import { isAuthenticated, authenticateRole } from '../middleware/authentictedUser.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/activate-account',activateUser);
userRouter.post('/login',loginUser);
userRouter.get('/logout',isAuthenticated,logoutUser);
userRouter.get('/refresh',updateAccessToken);
userRouter.get('/me',isAuthenticated,getUserInfo);
userRouter.post('/social-auth',socialAuth);
userRouter.put('/update-user-info',isAuthenticated,updateUserInfo);
userRouter.put('/update-user-password',isAuthenticated,updatePassword);
userRouter.put('/update-user-avatar',isAuthenticated,updateAvtar);
userRouter.get('/get-all-users',isAuthenticated,authenticateRole('admin'),getAllUsersAdmin);
userRouter.put('/update-user-role',isAuthenticated,authenticateRole('admin'),updateUserRole);
userRouter.delete('/delete-user/:id',isAuthenticated,authenticateRole('admin'),deleteUser);


export default userRouter;