import supertest from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import createServer from '../utils/server';
import mongoose from 'mongoose';
import { createProduct } from '../service/product.service';
import { signJwt } from '../utils/jwt.utils';

const app = createServer();

const userId = new mongoose.Types.ObjectId().toString();

export const productPayload = {
  user: userId,
  title: 'Canon EOS 1500D DSLR Camera with 18-55mm Lens',
  description:
    'Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.',
  price: 879.99,
  image: 'https://i.imgur.com/QlRphfQ.jpg',
};

export const userPayload = {
  _id: userId,
  email: 'jane.doe@example.com',
  name: 'Jane Doe',
};

describe('product', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe('get product route', () => {
    describe('given the product does not exist', () => {
      it('should return 404', async () => {
        const productId = 'product-id';

        await supertest(app).get(`/api/products/${productId}`).expect(404);
      });
    });

    describe('given the product does', () => {
      it('should return 200 status and the product', async () => {
        const product = await createProduct(productPayload);

        const { body, statusCode } = await supertest(app)
          .get(`/api/products/${product.productId}`)
          .expect(200);

        expect(statusCode).toBe(200);

        expect(body.productId).toBe(product.productId);
      });
    });
  });

  describe('create product route', () => {
    describe('given the user is not authenticated', () => {
      it('should return 403', async () => {
        const { statusCode } = await supertest(app).post('/api/products');

        expect(statusCode).toBe(403);
      });
    });

    describe('given the user is authenticated', () => {
      it('should return a 200 status and create the product', async () => {
        const jwt = signJwt(userPayload);

        const { body, statusCode } = await supertest(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${jwt}`)
          .send(productPayload);

        expect(statusCode).toBe(200);

        expect(body).toEqual({
          __v: 0,
          _id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          description: productPayload.description,
          image: productPayload.image,
          price: productPayload.price,
          productId: expect.any(String),
          title: productPayload.title,
          user: expect.any(String),
        });
      });
    });
  });
});
