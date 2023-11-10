import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { BookmarkCollectionService } from 'src/bookmarkCollection/bookmark-collection.service';
import { BookmarkCollectionDto } from 'src/bookmarkCollection/dtos/bookmark-collection.dto';
import { UpdateBookmarkCollectionRequestDTO } from 'src/bookmarkCollection/dtos/req/update-bookmark-collection.dto';
import { CreateBookmarkCollectionRequestDTO } from '../bookmarkCollection/dtos/req/create-bookmark-collection.dto';
import { BookmarkDto } from '../bookmark/dtos/bookmark.dto';
import { UserService } from 'src/user/user.service';
import { UserNicknameDto } from './dtos/req/user-nickname.dto';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';

import { JwtAuthGuard } from 'src/auth/strategies/jwt.strategy';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { FetchMyBookmarkCollectionDto } from 'src/bookmarkCollection/dtos/req/fetch-my-bookmark-collections.dto';
import { FriendService } from '../friend/friend.service';
import { OffsetPaginationDto } from 'src/common/dtos/offset-pagination.dto';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(
    private readonly bookmarkCollection: BookmarkCollectionService,
    private readonly bookmark: BookmarkService,
    private readonly userService: UserService,
    private readonly friendService: FriendService,
  ) {}

  @ApiOperation({
    summary: '내 정보 조회',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  profile(@CurrentUser() user: User) {
    return user;
  }

  @ApiOperation({
    summary: '북마크 컬렉션 생성 API',
    description: '제목, 공개여부를 선택하여 유저의 북마크 컬렉션을 생성한다.',
  })
  @ApiBody({
    type: CreateBookmarkCollectionRequestDTO,
    required: true,
  })
  @ApiResponse({
    status: 200,
    type: BookmarkCollectionDto,
    description: '북마크 컬렉션 생성완료',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/me/bookmark-collection')
  async createBookmarkCollection(
    @CurrentUser() user: User,
    @Body() dto: CreateBookmarkCollectionRequestDTO,
  ): Promise<BookmarkCollectionDto> {
    return await this.bookmarkCollection.createBookmarkCollection(user.id, dto);
  }

  @ApiOperation({
    summary: '북마크 컬렉션 삭제 API',
    description: '유저의 북마크 컬렉션을 삭제한다.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: 200,
    type: BookmarkCollectionDto,
    description: '북마크 컬렉션 삭제완료',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('me/bookmark-collection/:id')
  async removeBookmarkCollection(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BookmarkCollectionDto> {
    return await this.bookmarkCollection.removeBookmarkCollection(id);
  }

  @ApiResponse({
    status: 200,
    type: BookmarkCollectionDto,
    isArray: true,
    description: '북마크 컬렉션 조회완료',
  })
  @ApiOkResponsePaginated(BookmarkCollectionDto)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/bookmark-collections')
  async fetchBookmarkCollections(
    @CurrentUser() user: User,
    @Query() dto: FetchMyBookmarkCollectionDto,
  ) {
    return await this.bookmarkCollection.fetchBookmarkCollections(user.id, dto);
  }

  @ApiOperation({
    summary: '북마크 컬렉션 수정 API',
    description: '유저의 북마크 컬렉션을 수정한다.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: 200,
    type: BookmarkCollectionDto,
    description: '북마크 컬렉션 수정완료',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me/bookmark-collection/:id')
  async updateBookmarkCollection(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookmarkCollectionRequestDTO,
  ): Promise<BookmarkCollectionDto> {
    return await this.bookmarkCollection.updateBookmarkCollection(
      user.id,
      id,
      dto,
    );
  }

  @ApiOperation({
    summary: '북마크 컬렉션안에 있는 북마크들 조회 API',
    description: '북마크 컬렉션안에 있는 북마크들 조회한다.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: 200,
    type: BookmarkDto,
    isArray: true,
    description: '북마크 컬렉션안에 있는 북마크들 조회완료',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/bookmark-collection/:id/bookmarks')
  async fetchBookmarksInBookmarkCollection(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BookmarkDto[]> {
    return await this.bookmark.getBookmarksInCollection(id);
  }

  @ApiOperation({
    summary: '닉네임 중복확인 API',
    description: '닉네임 변경하기 전에 닉네임 중복여부를 확인한다.',
  })
  @ApiBody({
    required: true,
    type: UserNicknameDto,
  })
  @ApiResponse({
    status: 201,
    type: String,
    description: '닉네임 중복확인 성공',
  })
  @Post('verify-nickname')
  async verifyIsValidNickname(@Body() dto: UserNicknameDto): Promise<string> {
    return this.userService.verifyIsValidNickname(dto.nickname);
  }

  @ApiOperation({
    summary: '닉네임 변경 API',
    description: '유저 닉네임을 변경한다.',
  })
  @ApiBody({
    required: true,
    type: UserNicknameDto,
  })
  @ApiResponse({
    status: 201,
    description: '닉네임 변경 완료',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('change-nickname')
  async changeUserNickname(
    @CurrentUser() user: User,
    @Body() dto: UserNicknameDto,
  ): Promise<string> {
    return this.userService.changeUserNickname(user.id, dto.nickname);
  }

  @ApiOperation({
    summary: '채팅서버에 유저정보를 제공하기 위한 API(Client 사용x)',
    description: '채팅서버에 유저정보를 제공하기 위한 API(Client 사용x)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: 200,
    type: BookmarkDto,
    isArray: true,
    description: '북마크 컬렉션안에 있는 북마크들 조회완료',
  })
  @Get(':id')
  async getUserInfoById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findUserById(id);
  }

  @ApiOperation({
    summary: '친구 추가 API',
    description: '상대방에게 친구요청을 보내는 API이다.',
  })
  @ApiBody({
    type: Number,
    schema: {
      example: {
        friendId: 1,
      },
    },
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '친구초대 요청 완료',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/invite-friend')
  async sendFriendInviteRequest(
    @CurrentUser() user: User,
    @Body('friendId') friendId: number,
  ): Promise<any> {
    return await this.friendService.sendFriendInviteRequest(user.id, friendId);
  }

  @ApiResponse({
    status: 200,
    isArray: true,
    description: '내 친구 목록 조회완료',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/friends')
  async fetchMyFriends(
    @CurrentUser() user: User,
    @Query() dto: OffsetPaginationDto,
  ) {
    return await this.friendService.fetchMyFriends(user.id, dto);
  }

  @ApiResponse({
    status: 201,
    description: '친구 요청 수락',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('me/friend-invitation/received/:id/accept')
  async acceptFriendInvitation(
    @Param('id', ParseIntPipe) invitationId: number,
  ) {
    return await this.friendService.acceptFriendInvitation(invitationId);
  }

  @ApiResponse({
    status: 200,
    description: '친구 삭제 API',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('me/friend/:id')
  async removeFriend(@Param('id', ParseIntPipe) invitationId: number) {
    return await this.friendService.removeFriend(invitationId);
  }

  @ApiResponse({
    status: 200,
    description: '내가 받은 친구요청 확인하기',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/friend-invitation/received')
  async fetchReceivedFriendInvitiations(
    @CurrentUser() user: User,
    @Query() dto: OffsetPaginationDto,
  ) {
    return await this.friendService.fetchReceivedFriendInvitation(user.id, dto);
  }

  @ApiResponse({
    status: 200,
    description: '내가 보낸 친구요청 확인하기',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/me/friend-invitation/sent')
  async fetchSentFriendInvitiations(
    @CurrentUser() user: User,
    @Query() dto: OffsetPaginationDto,
  ) {
    return await this.friendService.fetchSentFriendInvitation(user.id, dto);
  }
}
