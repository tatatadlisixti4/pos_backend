import { ConfigService } from "@nestjs/config"
import type { TypeOrmModuleOptions } from "@nestjs/typeorm"
import { join } from "path"
export const typeOrmConfig = (configService: ConfigService) : TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    password: configService.get('DATABASE_PASS'),
    username: configService.get('DATABASE_USER'),
    database: configService.get('DATABASE_NAME'),
    port: configService.get('DATABASE_PORT'),
    logging: true,
    entities: [join(__dirname, '../**/*.entity.{js,ts}')],
    synchronize: true
})
