import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import 'dotenv-safe/config';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import path from 'path';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { UserResolver } from './resolvers/user';
import cookieParser from 'cookie-parser';
import { User } from './entities/User';
import {Subs } from "./entities/Subs"
import { SubsResolver } from './resolvers/sub';

const server = async () => {
  const conn = await createConnection({
    type: 'postgres',
    logging: true,
    synchronize: true,
    url: process.env.DATABASE_URL,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [User,Subs],
  });

  const app = express();
  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);
  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        secure: false,
        httpOnly: false,
        sameSite: 'lax',
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET!,
      resave: false,
    }),
  );

  app.use(cookieParser('secret'));
 
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver,SubsResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(parseInt(process.env.PORT!), () => {
    console.log(`server started :  ${process.env.PORT}`);
  });
};

server()
