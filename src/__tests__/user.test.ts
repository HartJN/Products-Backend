import mongoose from 'mongoose';
import supertest from 'supertest';
import createServer from '../utils/server';
import * as UserService from '../service/user.service';
import * as SessionService from '../service/session.service';
import { createUserSessionHandler } from '../controller/session.controller';

const app = createServer();

const userId = new mongoose.Types.ObjectId().toString();

const userPayload = {
  _id: userId,
  email: 'jane.doe@example.com',
  name: 'Jane Doe',
};

const userInput = {
  email: 'test@example.com',
  name: 'Jane Doe',
  password: 'Password123',
  passwordConfirmation: 'Password123',
};

const sessionPayload = {
  _id: new mongoose.Types.ObjectId().toString(),
  user: userId,
  valid: true,
  userAgent: 'PostmanRuntime/7.28.4',
  createdAt: new Date('2021-09-30T13:31:07.674Z'),
  updatedAt: new Date('2021-09-30T13:31:07.674Z'),
  __v: 0,
};

describe('user', () => {
  describe('user registration', () => {
    describe('given the username and password are valid', () => {
      it('should return the user payload', async () => {
        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          // @ts-ignore
          .mockReturnValueOnce(userPayload);
        const { statusCode, body } = await supertest(app)
          .post('/api/users')
          .send(userInput);

        expect(statusCode).toBe(200);

        expect(body).toEqual(userPayload);

        expect(createUserServiceMock).toBeCalledWith(userInput);
      });
    });

    describe('given the username and password are invalid', () => {
      it('should return a 400 status code', async () => {
        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          // @ts-ignore
          .mockReturnValueOnce(userPayload);

        const { statusCode } = await supertest(app)
          .post('/api/users')
          .send({
            ...userInput,
            passwordConfirmation: 'doesnotmatchthispassword',
          });

        expect(statusCode).toBe(400);

        expect(createUserServiceMock).not.toBeCalledWith();
      });
    });

    describe('given the user service throws', () => {
      it('should handle the error and return a 409 error', async () => {
        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          .mockRejectedValueOnce('Rejected request');

        const { statusCode } = await supertest(createServer())
          .post('/api/users')
          .send(userInput);

        expect(statusCode).toBe(409);

        expect(createUserServiceMock).toHaveBeenCalled();
      });
    });
  });

  describe('create user session', () => {
    describe('given the username and password are valid', () => {
      it('should return a signed accessToken and a refreshToken', async () => {
        jest
          .spyOn(UserService, 'validatePassword')
          // @ts-ignore
          .mockReturnValueOnce(userPayload);

        jest
          .spyOn(SessionService, 'createSession')
          // @ts-ignore
          .mockReturnValue(sessionPayload);

        const req = {
          get: () => {
            return 'user agent';
          },
          body: {
            email: userInput.email,
            password: userInput.password,
          },
        };

        const send = jest.fn();
        const cookie = jest.fn();

        const res = {
          send,
          cookie,
        };

        //@ts-ignore
        await createUserSessionHandler(req, res);

        expect(send).toHaveBeenCalledWith({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });
      });
    });
  });
});
