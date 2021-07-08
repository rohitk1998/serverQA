import { ObjectType, Field } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';


@ObjectType()
@Entity()
export class Subs extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Field()
    @Column()
    name!: string;
  
    @Field()
    @Column()
    email!: string;
  
    @Field()
    @Column()
    unsubscribeToken!: string;
  
    @Field()
    @Column()
    subscribed!: boolean;
  
    @Field()
    @Column({nullable:true})
    creatorId: number;
  
    @Field()
    @Column()
    frequency: number;
  
    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}
