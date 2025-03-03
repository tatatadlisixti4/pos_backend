import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async create(createProductDto: CreateProductDto) {
    const {categoryId: id} = createProductDto;
    const category = await this.categoryRepository.findOneBy({id});
    if(!category) {
      let errors: string[] = []
      errors.push('La categoría no existe')
      throw new NotFoundException(errors)
    }
    await this.productRepository.save({
      ...createProductDto,
      category
    });    
    return 'Producto añadadido con exito';
  }

  async findAll(categoryId : number | null) {
    if(categoryId){
      const [products, total] = await this.productRepository.findAndCount({
        where: {
          category: {
            id: categoryId
          }
        },
        order: {
          id: 'DESC'
        }
      });
      return {
        products,
        total
      }
    }
    const [products, total] = await this.productRepository.findAndCount({
      order: {
        id: 'DESC'
      }
    });

    return {
      products,
      total 
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
