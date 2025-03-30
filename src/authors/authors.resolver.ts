import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  Author,
  CreateAuthorInput,
  FindAuthorInput,
  UpdateAuthorInput,
} from './authors.schema';
import { AuthorsService } from './authors.service';
import { RedisService } from 'src/redis/redis.service';

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private readonly authorService: AuthorsService,
    private readonly redisService: RedisService,
  ) {}

  @Query(() => [Author], { name: 'authors' })
  async getAuthors(
    @Args('params') params: FindAuthorInput,
  ): Promise<Author[] | void> {
    const cacheKey = `authors:${JSON.stringify(params)}`;
    const cachedAuthors = await this.redisService.getValue<Author[]>(cacheKey);
    if (cachedAuthors) {
      console.log('Cache hit: Returning authors from Redis.');
      return cachedAuthors;
    }
    console.log('Cache miss: Fetching authors from DB.');
    const authors = await this.authorService.getAuthors(params);
    await this.redisService.setValue(cacheKey, authors);
    return authors;
  }
  @Query(() => Author, { name: 'author' })
  async findAuthorById(
    @Args('params') { _id }: FindAuthorInput,
  ): Promise<Author | void> {
    return await this.authorService.findAuthorById(_id!);
  }

  @Mutation(() => Author)
  async createAuthor(@Args('params') author: CreateAuthorInput) {
    return this.authorService.createAuthor(author);
  }

  @Mutation(() => Author)
  async updateAuthor(
    @Args('id') id: string,
    @Args('params') author: UpdateAuthorInput,
  ) {
    return this.authorService.updateAuthor(id, author);
  }

  @Mutation(() => Author)
  async deleteAuthor(@Args('id') id: string) {
    return this.authorService.deleteAuthor(id);
  }
}
