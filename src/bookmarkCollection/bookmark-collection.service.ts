import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkCollectionRequestDTO } from './dtos/req/create-bookmark-collection.dto';
import { BookmarkCollectionEntity } from './entities/bookmark-collection.entity';

@Injectable()
export class BookmarkCollectionService {
  constructor(private readonly prisma: PrismaService) {}

  async createBookmarkCollection(
    dto: CreateBookmarkCollectionRequestDTO,
  ): Promise<BookmarkCollectionEntity> {
    const { title, visibility } = dto;
    const userId = 1; //TODO: JWT payload userId로 추후에 대체

    return await this.prisma.bookmarkCollection.create({
      data: {
        title,
        visibility,
        userId,
      },
    });
  }

  async removeBookmarkCollection(
    id: number,
  ): Promise<BookmarkCollectionEntity> {
    await this.prisma.bookmarksInCollection.deleteMany({
      where: {
        collectionId: id,
      },
    });

    return await this.prisma.bookmarkCollection.delete({
      where: {
        id,
      },
    });
  }

  async fetchBookmarkCollections(): Promise<BookmarkCollectionEntity[]> {
    //TODO: JWT payload userId로 추후에 대체
    return await this.prisma.bookmarkCollection.findMany({
      where: {
        userId: 1,
      },
    });
  }
}
