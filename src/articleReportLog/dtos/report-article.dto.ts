import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ReportArticleDto {
  @ApiProperty({
    description: '신고사유',
    example: '이 게시글 미친 것 같은데요?',
  })
  @IsNotEmpty({ message: '신고 사유는 필수값입니다.' })
  @IsString({ message: '신고사유는 문자열 타입이어야 합니다.' })
  @Length(1, 100, { message: '신고사유는 1~100글자로 작성해주세요.' })
  reason: string;
}
