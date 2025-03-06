import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';
import { CouponsService } from 'src/coupons/coupons.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents)
    private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly couponService: CouponsService
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    await this.productRepository.manager.transaction(async (transactionEntityManager) => {
      const transaction = new Transaction();
      const total = createTransactionDto.contents.reduce( (total, item) =>  total + (item.price * item.quantity), 0 )
      transaction.total = Math.floor(total);

      if(createTransactionDto.coupon) {
        const coupon = await this.couponService.applyCoupon(createTransactionDto.coupon);
        const discount = Math.floor( (coupon.percentage/100) * total );
        transaction.coupon = coupon.name;
        transaction.discount = discount;
        transaction.total -= discount;
      }
      await transactionEntityManager.save(Transaction, transaction);

      for (const contents of createTransactionDto.contents) {
        const product = await transactionEntityManager.findOne(Product, { where: {id: contents.productId} }) as Product;
        
        const errors : string[] = [];
        if (!product) {
          errors.push(`El producto con el ID:${contents.productId}`);
          throw new NotFoundException(errors);
        }

        if (product.inventory < contents.quantity) {
          errors.push(`El articulo ${product.name} excede la cantidad disponible`);
          throw new BadRequestException(errors);
        }

        product.inventory -= contents.quantity;
        await transactionEntityManager.save(Product, product);
        await transactionEntityManager.save(TransactionContents, { ...contents, transaction, product });
      }
    })
    return 'Venta almacenada correctamente';
  }

  findAll(transactionDate? : string) {
    const options : FindManyOptions<Transaction> = {
      relations: { contents: true }
    };
    if(transactionDate) {
      const date = parseISO(transactionDate);
      if(!isValid(date)) throw new BadRequestException('Formato de fecha inválido');  
      const start = startOfDay(date);
      const end = endOfDay(date);
      options.where = { transactionDate: Between(start, end) }
    }
    return this.transactionRepository.find(options);
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: {id},
      relations: { contents : true }
    });

    const errors : string[] = [];
    if(!transaction) {
      errors.push('Transacción no disponible');
      throw new NotFoundException(errors);  
    }
    return transaction;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  async remove(id: number) {
    const transaction = await this.findOne(id);
    const errors : string[] = [];
    if(!transaction) {
      errors.push('Transacción no disponible');
      throw new NotFoundException(errors);  
    }

    for (const contents of transaction.contents) {
      const product = await this.productRepository.findOneBy({id: contents.id}) as Product;
      product.inventory += contents.quantity;
      await this.productRepository.save(product);
      await this.transactionContentsRepository.remove(contents);
    } 

    await this.transactionRepository.remove(transaction);
    return {message: 'Venta eliminada'};
  }
}
