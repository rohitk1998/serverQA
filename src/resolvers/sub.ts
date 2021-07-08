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
  import { Subs } from '../entities/Subs';
  import { Any, getConnection } from 'typeorm';
import { FieldError } from './user';
import { v4 } from 'uuid';
import { User } from '../entities/User';

@InputType()
export class SubInput {
  @Field()
  name: string;
  @Field()
  email: string;
}

@ObjectType()
class SubResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Subs, { nullable: true })
  subs?: Subs;
}

  @Resolver(Subs)
  export class SubsResolver {

    //creating subs with file import
    @Mutation(() => SubResponse)
    async createSub(
      @Arg('input') input: SubInput,
      @Ctx() { req }: MyContext,
    ): Promise<SubResponse> {
      try {
        console.log("input" , input)
        const userId = req.session.userId;
        console.log("userID" , userId)
        const user = await User.findOne({ id: userId });
        console.log("user",user)
        const subs = await getConnection().query(
          `
      select s.*
      from subs s
      where "creatorId" = '47'
      `,
        );
        console.log("subs",subs)
        console.log(subs.length);
  
        console.log("user?.customerType" , user?.customerType)
  
        if (user?.customerType === 'free-trial') {
          const subLimit = 5;
          if (subs.length >= subLimit) {
            throw 'You have reached your maximum contacts';
          }
        }
        
  
        const firstname = input!.name
        const mail = input!.email
        const firstnamearray = firstname.split(',')
        const mailarray = mail.split(',')
        const sub: any = []
  
  
        console.log("Firstname , mail , firstnamearray , mailarray , sub",firstname , mail , firstnamearray , mailarray , sub)
  
        console.log("mail.length" , mailarray.length)
  
        for (let i = 0; i < mailarray.length; i++) {
          const token = v4();
          const unsubscribeToken = v4();
          const subs = await Subs.create({
            name: firstnamearray[i],
            email: mailarray[i],
            frequency: 1,
            subscribed: false,
            unsubscribeToken,
            creatorId: req.session.userId,
          }).save();
  
          return { subs };
        }
  
        return sub
      }
      catch (err) {
        console.log(err, "Subscriber", req.ip)
        return err
      }
  
    }
  }