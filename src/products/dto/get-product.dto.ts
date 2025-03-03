import { IsNumberString, IsOptional } from 'class-validator';
export class GetProductsQueryDto {
    @IsOptional()
    @IsNumberString({}, {message: 'La categoría debe ser un número'})
    category_id?: number
}