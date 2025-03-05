import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>   
  ) {}

  create(createCouponDto: CreateCouponDto) {
    return this.couponRepository.save(createCouponDto);
  }

  findAll() {
    return this.couponRepository.find();
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOneBy({id});
    const errors : string[] = [];
    if(!coupon) {
      errors.push('El cupón no está disponible');
      throw new NotFoundException(errors);
    }
    return coupon;
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findOne(id);
    const errors : string[] = [];
    if(!coupon) {
      errors.push('El cupón no está disponible');
      throw new NotFoundException(errors);
    };

    Object.assign(coupon, updateCouponDto);
    await this.couponRepository.save(coupon);
    return "Cupón actualizado correctamente";
  }

  async remove(id: number) {
    const coupon = await this.findOne(id);
    const errors : string[] = [];
    if(!coupon) {
      errors.push('El cupón no está disponible');
      throw new NotFoundException(errors);
    };
    await this.couponRepository.remove(coupon);
    return "Cupón eliminado correctamente";

  }
}
