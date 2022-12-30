import { Entity, PrimaryGeneratedColumn, Column, Unique, BaseEntity, CreateDateColumn } from "typeorm";

@Entity()
@Unique(["userId", "postId"])
export class Like extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number

    @Column("varchar")
    postId?: string

    // Storing user_id fetched from Auth0
    @Column()
    userId?: string

    @CreateDateColumn()
    createdAt?: Date

    @Column({default: false})
    isRemoved?: boolean
}