import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  Root,
  InputType
} from 'type-graphql';
import { MyContext } from '../types';
import { User, UserRole } from '../entities/User';
import { Any, getConnection } from 'typeorm';
import argon2 from 'argon2';

@InputType()
export class UserRegisterInput {
  @Field()
  email: string;
  
  @Field()
  password: string;

  @Field()
  username:string;
}

@InputType()
export class UserLoginInput{
  @Field()
  email:string;

  @Field()
  password:string;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class Alluser {
  @Field(() => [User], { nullable: true })
  user?: User[];

}

@Resolver(User)
export class UserResolver {

  // Create User
  @Mutation(()=> UserResponse)
  async register(
    @Arg('options') options: UserRegisterInput,
    @Ctx() { req }: MyContext,
  ):Promise<UserResponse> {
              try{
                let user;
                const hashedPassword = await argon2.hash(options.password);
                try {
                  const result = await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(User)
                    .values({
                      email: options.email,
                      password:hashedPassword,
                      username:options.username,
                      role: UserRole.USER,
                    })
                    .returning('*')
                    .execute();
                    user = result.raw[0];
                    console.log("result" , result)
                } catch (err) {
                  if (err.code === '23505') {
                    return {
                      errors: [
                        {
                          field: 'email',
                          message: 'email already taken',
                        },
                      ],
                    };
                  }
                }

                return  { user }
              }
              catch (err) {
                console.error(err, "user", req.ip)
                return err
              }
  }

  


  // All Users
  @Query(() => Alluser, { nullable: true })
  async alluser(@Ctx() { req }: MyContext): Promise<Alluser> {
    try {
      const user = await getConnection().query(
        ` select u.*
      from public.user u
      `
      );
      console.log("user" , user)
      return { user }
    }
    catch (err) {
      console.log(err, "user", req.ip)
      return err
    }
  };
  
  // login user with credentials
  @Mutation(()=> UserResponse)
  async loginuser(
    @Arg('options') options: UserLoginInput,
    @Ctx() { req }: MyContext,
  ):Promise<UserResponse>{
    try{
      const user  = await User.findOne({email:options.email})
      if(user?.email){
        const matched = await argon2.verify(user.password,options.password)
        if(!matched){
          return {
            errors : [
              {
                field:'Password',
                message:'Password is incorrect'
              }
            ]
          }
        }
      }
      else if(!user?.email){
        return {
          errors:[
            {
              field:'Email',
              message:'Email is not valid'
            }
          ]
        }
      }
      console.log(req.session)
      req.session.userId=user.id
      console.log(req.session)

      return {user}
    }
    catch (err) {
      console.log(err, "user", req.ip)
      return err
    }
  }
}
