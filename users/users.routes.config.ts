import express from 'express';
import { body } from 'express-validator';

import BodyValidationMiddleware from '../common/middleware/body.validation.middleware.ts';
import { CommonRoutesConfig } from '../common/common.routes.config';
import UsersController from './controllers/users.controller';
import UsersMiddleware from './middleware/users.middleware';

export class UsersRoutes extends CommonRoutesConfig {
	constructor(app: express.Application) {
		super(app, 'UsersRoutes')
	}

	configureRoutes() {
		this.app.route('/users')
			.get(UsersController.listUsers)
			.post(
				body('email').isEmail(),
				body('password').isLength({ min: 5}).withMessage('Must include a password greater than 5 characters long'),
				BodyValidationMiddleware.verifyBodyFieldsErrors,
				UsersMiddleware.validateEmailUniqueness,
				UsersController.createUser
			)


		this.app.param('userId', UsersMiddleware.appendUserIdToBody);
		this.app.route('/users/:userId')
			.all(UsersMiddleware.validateUserExists)
			.get(UsersController.getUserById)
			.delete(UsersController.removeUser)

		this.app.put('/users/:userId', [
			body('email').isEmail(),
			body('password').isLength({ min: 5}).withMessage('Must include a password greater than 5 characters long'),
			body('firstName').isString(),
			body('lastName').isString(),
			body('permissionFlags').isInt(),
			BodyValidationMiddleware.verifyBodyFieldsErrors,
			UsersMiddleware.validatePatchEmail,
			UsersController.put
		])

		this.app.patch('users/:userId', [
			body('email').isEmail(),
			body('password').isLength({ min: 5}).withMessage('Must include a password greater than 5 characters long'),
			body('firstName').isString(),
			body('lastName').isString(),
			body('permissionFlags').isInt().optional(),
			BodyValidationMiddleware.verifyBodyFieldsErrors,
			UsersController.patch
		]);

		return this.app;
	}
}
