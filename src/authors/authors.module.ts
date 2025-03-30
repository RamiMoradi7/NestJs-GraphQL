import { Module } from '@nestjs/common';
import { AuthorsResolver } from './authors.resolver';
import { AuthorsService } from './authors.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Author, AuthorSchema } from './authors.schema';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Author.name, schema: AuthorSchema }]),
    RedisModule,
  ],
  providers: [AuthorsService, AuthorsResolver],
})
export class AuthorsModule {}
