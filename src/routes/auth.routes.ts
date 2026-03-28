import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { protect } from '../middlewares/auth.middleware';
import { signupSchema, loginSchema } from '../validators/auth.schema';

const router = Router();

router.route('/signup').post(validate(signupSchema), AuthController.signup);
router.route('/login').post(validate(loginSchema), AuthController.login);

router.get('/me', protect, AuthController.getMe);

export default router;
