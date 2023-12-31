import { ApiProperty } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateBookmarkCollectionRequestDTO {
  @ApiProperty({
    example: '강릉 맛집',
    description: '북마크 컬렉션 제목',
  })
  @IsNotEmpty({ message: '제목은 필수입니다' })
  @IsString({ message: '제목은 문자열이어야 합니다' })
  @Length(1, 200, { message: '제목은 1자 이상 200자 이하로 입력해주세요' })
  title: string;

  @ApiProperty({
    example: 'FRIENDS_ONLY',
    description:
      '공개 여부 -> PRIVATE(비공개) / FRIENDS_ONLY(친구에게만) / PUBLIC(모두 공개) ',
    enum: Visibility,
  })
  @IsEnum(Visibility, { message: '올바른 공개 여부 값을 선택해주세요' })
  visibility?: Visibility = Visibility.PUBLIC;
}
