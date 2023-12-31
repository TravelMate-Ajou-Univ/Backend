import { ApiProperty } from '@nestjs/swagger';

export enum EPresignedPostType {
  ARTICLE = 'article',
  THUMBNAIL = 'thumbnail',
  PROFILE = 'profile',
  CHAT = 'chat',
}

export class GetPresignedPostDto {
  @ApiProperty({
    example: 'article',
    description: 'type',
    enum: EPresignedPostType,
  })
  type: EPresignedPostType;
}
