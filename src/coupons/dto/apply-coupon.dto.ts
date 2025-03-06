import { IsNotEmpty } from "class-validator";

export class ApplyCouponDto {
    @IsNotEmpty({message: 'El cupón no debe ir vacío'})
    coupon_name: string;
}