import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkCollectionRequestDTO } from './dtos/req/create-bookmark-collection.dto';
import {
  UpdateBookmarkCollectionRequestDTO,
  LocationWithContent,
} from './dtos/req/update-bookmark-collection.dto';
import { BookmarkCollectionEntity } from './entities/bookmark-collection.entity';
import { LocationEntity } from '../location/entities/location.entity';
import { CreateBookmarkDto } from 'src/bookmark/dtos/req/create-bookmark.dto';

@Injectable()
export class BookmarkCollectionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @desc 북마크 컬렉션에 들어있는 북마크
   * @param collectionId
   * @returns number[]
   * @author 유정호
   */
  private async getBookmarkIdsInCollection(
    collectionId: number,
  ): Promise<number[]> {
    const bookmarksInCollections =
      await this.prisma.bookmarksInCollection.findMany({
        where: {
          collectionId,
        },
      });

    return bookmarksInCollections.map((obj) => obj.bookmarkId);
  }

  /**
   * @desc 북마크 컬렉션 id로 북마크 찾는 메서드
   * @param id
   * @returns Promise<BookmarkCollectionEntity>
   * @author 유정호
   */
  private async getBookmarkCollectionById(
    id: number,
  ): Promise<BookmarkCollectionEntity> {
    const bookmarkCollection: BookmarkCollectionEntity | null =
      await this.prisma.bookmarkCollection.findUnique({
        where: {
          id,
        },
      });

    if (!bookmarkCollection) {
      throw new BadRequestException('존재하지 않는 북마크 컬렉션입니다.');
    }

    return bookmarkCollection;
  }

  /**
   * @desc 북마크 컬렉션 생성
   * @param dto
   * @returns Promise<BookmarkCollectionEntity>
   * @author 유정호
   */
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

  /**
   * @desc 북마크 컬렉션 삭제
   * @param id
   * @returns Promise<BookmarkCollectionEntity>
   * @author 유정호
   */
  async removeBookmarkCollection(
    id: number,
  ): Promise<BookmarkCollectionEntity> {
    await this.getBookmarkCollectionById(id);

    await this.prisma.bookmarksInCollection.deleteMany({
      where: {
        collectionId: id,
      },
    });

    const bookmarkIdsIncollection: number[] =
      await this.getBookmarkIdsInCollection(id);

    await this.prisma.bookmark.deleteMany({
      where: {
        id: {
          in: bookmarkIdsIncollection,
        },
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

  /**
   * @desc 북마크 컬렉션 수정
   * @param id
   * @param dto
   * @returns Promise<BookmarkCollectionEntity>
   * @author 유정호
   */
  async updateBookmarkCollection(
    id: number,
    dto: UpdateBookmarkCollectionRequestDTO,
  ): Promise<BookmarkCollectionEntity> {
    const { title, visibility, locationsWithContent } = dto;

    await this.getBookmarkCollectionById(id);

    const bookmarkIdsIncollection: number[] =
      await this.getBookmarkIdsInCollection(id);

    //기존에 북마크 컬렉션에 있던 북마크 삭제
    await this.prisma.bookmarksInCollection.deleteMany({
      where: {
        collectionId: id,
      },
    });

    await this.prisma.bookmark.deleteMany({
      where: {
        id: {
          in: bookmarkIdsIncollection,
        },
      },
    });

    const newLocationsWithContent: LocationWithContent[] = [];
    const bookmarkData: CreateBookmarkDto[] = [];

    //location 테이블에 없는 장소인지 확인
    for (const locationWithContent of locationsWithContent) {
      const { longitude, latitude } = locationWithContent;

      const location: LocationEntity | null =
        await this.prisma.location.findUnique({
          where: {
            latitude_longitude: {
              latitude,
              longitude,
            },
          },
        });

      if (location) {
        bookmarkData.push({
          locationId: location.id,
          content: locationWithContent.content,
        });
      } else {
        newLocationsWithContent.push(locationWithContent);
      }
    }

    //location 테이블에 새로운 장소 생성
    for (const newLocationWithContent of newLocationsWithContent) {
      const createdLocation = await this.prisma.location.create({
        data: {
          latitude: newLocationWithContent.latitude,
          longitude: newLocationWithContent.longitude,
        },
      });

      bookmarkData.push({
        locationId: createdLocation.id,
        content: newLocationWithContent.content,
      });
    }

    //북마크 생성
    const bookmarkIds: number[] = [];
    for (const data of bookmarkData) {
      const bookmark = await this.prisma.bookmark.create({
        data,
      });

      bookmarkIds.push(bookmark.id);
    }

    //북마크 컬렉션과 매핑
    await this.prisma.bookmarksInCollection.createMany({
      data: bookmarkIds.map((bookmarkId) => ({
        collectionId: id,
        bookmarkId: bookmarkId,
      })),
    });

    //북마크 컬렉션 정보 수정
    return await this.prisma.bookmarkCollection.update({
      where: {
        id,
      },
      data: {
        title,
        visibility,
      },
    });
  }
}