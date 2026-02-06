import express from 'express';
import { addAnswer, addQuestion, addReview, editCourse, getAllCourses, getCourseByUser, getSingleCourse, reviewReply, uploadCourse } from '../controllers/courseController.js';
import { authenticateRole, isAuthenticated } from '../middleware/authentictedUser.js';

const courseRouter = express.Router();


courseRouter.post('/create-course',isAuthenticated,authenticateRole('admin'),uploadCourse);
courseRouter.post('/edit-course/:id',isAuthenticated,authenticateRole('admin'),editCourse);
courseRouter.get('/get-course/:id',getSingleCourse);
courseRouter.get('/get-courses',getAllCourses);
courseRouter.get('/get-course-content/:id',isAuthenticated,getCourseByUser);
courseRouter.put('/add-question',isAuthenticated,addQuestion);
courseRouter.put('/add-answer',isAuthenticated,addAnswer);
courseRouter.put('/add-review/:id',isAuthenticated,addReview);
courseRouter.put('/add-review-reply',isAuthenticated,authenticateRole('admin'),reviewReply);


export default courseRouter;