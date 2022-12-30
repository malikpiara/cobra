import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, BaseEntity } from "typeorm";

@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number

    @Column({default: "test"})
    post_id?: string

    // Storing user_id fetched from Auth0
    @Column()
    user_id?: string

    @Column()
    author?: string

    @Column("text")
    content?: string

    @Column({default: false})
    isDeleted?: boolean

    @CreateDateColumn()
    createdAt?: Date
}