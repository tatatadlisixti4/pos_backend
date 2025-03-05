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
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents)
    private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    await this.productRepository.manager.transaction(async (transactionEntityManager) => {

      const transaction = new Transaction();
      transaction.total = createTransactionDto.total;
      await transactionEntityManager.save(Transaction, transaction);

      for (const contents of createTransactionDto.contents) {
        const product = await transactionEntityManager.findOne(Product, { where: {id: contents.productId} }) as Product;
        if (!product) throw new NotFoundException('Producto no disponible');
        if (product.inventory < contents.quantity) throw new UnprocessableEntityException('Stock insuficiente');
        product.inventory -= contents.quantity;
        
        await transactionEntityManager.save(Product, product);
        await transactionEntityManager.save(TransactionContents, { ...contents, transaction, product });
      }
    })
    return 'Venta almacenada correctamente';
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
