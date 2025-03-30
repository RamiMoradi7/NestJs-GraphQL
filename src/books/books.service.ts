import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Book,
  BookDocument,
  CreateBookInput,
  FindBookInput,
  UpdateBookInput,
} from './books.schema';
import { Model, Types } from 'mongoose';
import { AuthorsService } from 'src/authors/authors.service';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    private authorService: AuthorsService,
  ) {}

  async getBooks(params: FindBookInput) {
    const books = await this.bookModel.find(params || {}).exec();
    if (!books.length) throw new NotFoundException('No books found.');
    return books;
  }

  async getBookById(id: string) {
    const book = await this.bookModel.findById(id).exec();
    if (!book?._id) throw new NotFoundException('Book details not found.');
    return book;
  }

  async createBook(params: CreateBookInput) {
    const authorIds = params.authorIds?.map((id) => new Types.ObjectId(id));

    const book = await this.bookModel.create({
      ...params,
      authorIds,
      rentalIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (!book._id) throw new HttpException('Failed to create book', 417);

    if (params.authorIds && params.authorIds.length) {
      for (let i = 0; i < params.authorIds.length; i++) {
        await this.authorService.updateAuthor(params.authorIds[i], {
          bookIds: [book._id.toString()],
        });
      }
    }
    return book;
  }

  async updateBook(id: string, params: UpdateBookInput) {
    const book = await this.bookModel.updateOne({ _id: id }, { ...params });
    if (book.modifiedCount === 0)
      throw new HttpException('Failed to update book.', 417);
    return await this.getBookById(id);
  }

  async deleteBook(id: string) {
    const book = await this.bookModel.findByIdAndDelete(id).exec();
    return book;
  }
}
