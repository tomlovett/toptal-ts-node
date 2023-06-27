import { Request, Response, NextFunction } from 'express';
import debug from 'debug';

import usersService from '../services/users.service';

const log: debug.IDebugger = debug('app:users-controller');

class UsersMiddleware {
	async appendUserIdToBody(req: Request, res: Response, next: NextFunction) {
		req.body.id = req.params.userId;
		next()
	}

	async validateEmailUniqueness(req: Request, res: Response, next: NextFunction) {
		const user = await usersService.getUserByEmail(req.body.email);

		if (user) {
			res.status(400).send({ error: 'User email already exists' });
		} else {
			next();
		}
	}

	async validateSameEmail(req: Request, res: Response, next: NextFunction) {
		const user = await usersService.getUserByEmail(req.body.email);

		if (!user || user.id !== req.params.userId) {
			res.status(400).send({ error: 'User does not have permission to edit '})
		} else {
			next();
		}
	}

	// user arrow function to properly bind `this`
	validatePatchEmail = async (req: Request, res: Response, next: NextFunction) => {
		if (req.body.email) {
			log('Validating email', req.body.email);

			this.validateSameEmail(req, res, next);
		} else {
			next();
		}
	}

	async validateUserExists(req: Request, res: Response, next: NextFunction) {
		const { userId } = req.params;
		const user = await usersService.readById(userId);

		if (!user) {
			res.status(404).send({ error: `User ${userId} not found`});
		} else {
			next();
		}
	}
}

export default new UsersMiddleware();
