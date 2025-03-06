import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/typeorm.config';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true
      }),
      TypeOrmModule.forRootAsync({
        useFactory: typeOrmConfig,
        inject: [ConfigService]
      }),
      CategoriesModule,
      ProductsModule,
      TransactionsModule,
      CouponsModule
    ],
  providers: [SeederService]
})
export class SeederModule {}
