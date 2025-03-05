import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository : Repository<Transaction>,
    @InjectRepository(TransactionContents)
    private readonly transactionContentsRepository : Repository<TransactionContents>,
    @InjectRepository(Product)
    private readonly productRepository : Repository<Product>
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const transaction = new Transaction;
    transaction.total = createTransactionDto.total;

    let products : Product[] = [];
    for (const contents of createTransactionDto.contents) {
      const product = await this.productRepository.findOne({where: {id: contents.productId}});
      products.push(product as Product);
      if(!product) throw new NotFoundException('Producto no disponible');
      if(product.inventory < contents.quantity) throw new UnprocessableEntityException('Stock insuficiente');
    }
    
    await this.transactionRepository.save(transaction);
    let i = 0;
    for (const contents of createTransactionDto.contents) {
      const product = products[i];
      const updatedStock = product.inventory - contents.quantity;
      product.inventory = updatedStock;

      await this.productRepository.save(product);
      await this.transactionContentsRepository.save({
        ...contents,
        product,
        transaction,
      });
      i++;
    }
    return 'Venta registrada correctamente';
  }

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
