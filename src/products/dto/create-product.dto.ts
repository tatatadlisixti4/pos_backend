import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from "class-validator"
import { Category } from "src/categories/entities/category.entity"

export class CreateProductDto {
    @IsNotEmpty({message: 'El nombre del producto es obligatorio'})    
    @IsString({message: 'Nombre no válido'})
    name: string

    @IsNotEmpty({message: 'El precio del producto es obligatorio'}) 
    @IsNumber({maxDecimalPlaces: 0}, {message: 'Precio no válido'})  
    @Min(0, {message: 'El precio debe ser mayor a 0'})
    price: number
    
    @IsNotEmpty({message: 'La cantidad no puede ir vacía'}) 
    @IsNumber({maxDecimalPlaces: 0}, {message: 'Cantidad no válida'})  
    @Min(0, {message: 'La cantidad debe ser mayor a 0'})
    inventory: number

    @IsNotEmpty({message: 'La categoría es obligatoria'}) 
    @IsInt({message: 'La categoría no es válida'})  
    categoryId: Category['id']
}
