import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';

export class AuthController {
  public static signup = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.signup(req.body);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  });

  public static login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });
}
