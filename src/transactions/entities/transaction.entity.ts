 import { Product } from "../../products/entities/product.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal')
    total: number;

    @Column({type: 'varchar', length: 30, nullable: true})
    coupon: string;

    @Column({type: 'decimal', nullable: true})
    discount: number;

    @Column({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    transactionDate: Date;

    @OneToMany(() => TransactionContents, transactionContents => transactionContents.transaction, {eager: false, cascade: true})
    contents: TransactionContents[]
}

@Entity()
export class TransactionContents {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('int')
    quantity: number;

    @Column('decimal')
    price: number;

    @ManyToOne(() => Product)
    product: Product   

    @ManyToOne(() => Transaction, transaction => transaction.contents)
    transaction: Transaction
}