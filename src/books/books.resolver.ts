import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthorsService } from 'src/authors/authors.service';
import {
  Book,
  CreateBookInput,
  FindBookInput,
  UpdateBookInput,
} from './books.schema';
import { BooksService } from './books.service';
import { RedisService } from 'src/redis/redis.service';

@Resolver(() => Book)
export class BooksResolver {
  constructor(
    private readonly booksService: BooksService,
    private authorsService: AuthorsService,
    private readonly redisService: RedisService,
  ) {}

  @Query(() => [Book], { name: 'books' })
  async getBooks(
    @Args('params') params: FindBookInput,
  ): Promise<Book[] | void> {
    const cacheKey = `books:${JSON.stringify(params)}`;
    const cachedBooks = await this.redisService.getValue<Book[]>(cacheKey);
    if (cachedBooks) {
      console.log('Cache hit: Returning books from Redis.');
      return cachedBooks;
    }
    console.log('Cache miss: Fetching books from DB');
    const books = await this.booksService.getBooks(params);
    await this.redisService.setValue(cacheKey, books);
    return books;
  }

  @Query(() => Book, { name: 'book' })
  async findBookById(
    @Args('params') { _id }: FindBookInput,
  ): Promise<Book | void> {
    return await this.booksService.getBookById(_id as string);
  }

  @Mutation(() => Book)
  async createBook(@Args('params') author: CreateBookInput) {
    return this.booksService.createBook(author);
  }

  @Mutation(() => Book)
  async updateBook(
    @Args('id') id: string,
    @Args('params') author: UpdateBookInput,
  ) {
    return this.booksService.updateBook(id, author);
  }

  @Mutation(() => Book)
  async deleteBook(@Args('id') id: string) {
    return this.booksService.deleteBook(id);
  }

  @ResolveField(() => Book)
  async authorIds(@Parent() parent: Book) {
    return await this.authorsService.findByBookId(parent?._id);
  }
}
