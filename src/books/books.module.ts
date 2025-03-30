import { forwardRef, Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksResolver } from './books.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './books.schema';
import { Author, AuthorSchema } from 'src/authors/authors.schema';
import { AuthorsModule } from 'src/authors/authors.module';
import { AuthorsService } from 'src/authors/authors.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: Author.name, schema: AuthorSchema },
    ]),
    RedisModule,
    forwardRef(() => AuthorsModule),
  ],
  providers: [BooksService, BooksResolver, AuthorsService],
})
export class BooksModule {}
