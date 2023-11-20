import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany} from "typeorm";
import {Exclude} from '@nestjs/class-transformer'
import { Transaction } from "src/transaction/entities/transaction.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn({name: "user_id"})
    public readonly id: number;

    @Column()
    public name: string;


    @Column({unique: true})
    public email: string;

    @Exclude()
    @Column({name: "google_access_token", nullable: true})
    public googleAccessToken?: string;

    @Exclude()
    @Column({nullable: true, name: "password"})
    public password?: string;

    @Exclude()
    @Column({default: false, name: "requested_temporary_password"})
    public requestedTemporaryPassword?: boolean;

    @Exclude()
    @Column({nullable: true, name: "temporary_password", length: 16})
    public temporaryPassword?: string;

    @Exclude()
    @Column({nullable: true, name: "temporary_password_requested_at"})
    public temporaryPasswordRequestedAt?: Date;

    @Exclude()
    @Column({default: false, name: "activated_account"})
    public activatedAccount: boolean;

    @Exclude()
    @Column({nullable: true, name: "activation_code", length: 32})
    public activationCode?: string;

    @CreateDateColumn({name: "created_at"})
    public readonly createdAt: Date;

    @UpdateDateColumn({name: "updated_at"})
    public readonly updatedAt: Date;

    @Column()
    public role: number;

    @OneToMany(() => Transaction, transaction => transaction.user)
    transaction: Transaction[]

}
