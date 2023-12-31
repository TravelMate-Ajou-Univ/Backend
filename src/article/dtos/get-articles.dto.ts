import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  isEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ELocation } from './create-article.dto';
import { Period } from '@prisma/client';

export enum ArticleOrderField {
  TITLE_DESCENDING = 'titleDescending',
  TITLE_ASCENDING = 'titleAscending',
  RECENT = 'recent',
}

export class GetArticlesDto {
  @ApiProperty({
    required: false,
    description: 'default:1',
  })
  @Type(() => Number)
  @IsNumber()
  page: number = 1;

  @ApiProperty({
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  limit: number = 10;

  @ApiProperty({
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  authorId?: number;

  @ApiProperty({
    required: false,
    // enum: Period,
    isArray: true,
  })
  @IsOptional()
  period?: Period[];

  @ApiProperty({
    required: false,
    enum: ELocation,
  })
  @IsEnum(ELocation)
  @IsOptional()
  @IsString()
  location?: ELocation;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({
    required: false,
    enum: ArticleOrderField,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    if (isEnum(value, ArticleOrderField)) {
      return value;
    }

    return 'recent';
  })
  order?: ArticleOrderField;
}
