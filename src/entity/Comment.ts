import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn, CreateDateColumn, BaseEntity } from "typeorm";

@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number

    @Column({default: "test"})
    post_id?: string

    @Column()
    author?: string

    @Column("text")
    content?: string

    @Column({default: false})
    isDeleted?: boolean

    @CreateDateColumn()
    createdAt?: Date
}