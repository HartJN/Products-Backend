import { omit } from 'lodash';
import config from 'config';
import axios from 'axios';
import qs from 'qs';
import {
  DocumentDefinition,
  FilterQuery,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import UserModel, { UserDocument } from '../models/user.model';
import logger from '../utils/logger';

interface GoogleTokensResult {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  id_token: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export async function createUser(
  input: DocumentDefinition<
    Omit<UserDocument, 'createdAt' | 'updatedAt' | 'comparePassword'>
  >
) {
  try {
    const existingUser = await UserModel.findOne({ email: input.email });

    if (existingUser) {
      return existingUser;
    }

    const user = await UserModel.create(input);

    return omit(user.toJSON(), 'password');
  } catch (error: any) {
    logger.error(error);
    throw new Error(error);
  }
}

export async function validatePassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await UserModel.findOne({ email });

  if (!user) {
    return false;
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) {
    return false;
  }

  return omit(user.toJSON(), 'password');
}

export async function findUser(query: FilterQuery<UserDocument>) {
  return UserModel.findOne(query).lean();
}

export async function getGoogleOAuthTokens({
  code,
}: {
  code: string;
}): Promise<GoogleTokensResult> {
  const url = 'https://oauth2.googleapis.com/token';

  const values = {
    code,
    client_id: config.get('googleClientId'),
    client_secret: config.get('googleClientSecret'),
    redirect_uri: config.get('googleOAuthRedirectUri'),
    grant_type: 'authorization_code',
  };

  try {
    const response = await axios.post<GoogleTokensResult>(
      url,
      qs.stringify(values),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  } catch (err: any) {
    logger.error(`Error getting google oauth tokens: ${err}`);
    throw new Error(err.message);
  }
}

export async function getGoogleUser({
  id_token,
  access_token,
}: {
  id_token: string;
  access_token: string;
}): Promise<GoogleTokensResult> {
  try {
    const response = await axios.get<GoogleTokensResult>(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    return response.data;
  } catch (err: any) {
    logger.error(`Error getting google user: ${err}`);
    throw new Error(err.message);
  }
}

export async function findAndUpdateUser(
  query: FilterQuery<UserDocument>,
  update: UpdateQuery<UserDocument>,
  options: QueryOptions = {}
) {
  return UserModel.findOneAndUpdate(query, update, options);
}
