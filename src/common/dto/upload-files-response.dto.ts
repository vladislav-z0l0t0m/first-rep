import { ApiProperty } from '@nestjs/swagger';

export class SuccessfulUploadDto {
  @ApiProperty()
  filename: string;

  @ApiProperty()
  url: string;
}

export class FailedUploadDto {
  @ApiProperty()
  filename: string;

  @ApiProperty()
  message: string;
}

export class UploadFilesSuccessResponseDto {
  @ApiProperty({ type: [SuccessfulUploadDto] })
  successful: SuccessfulUploadDto[];
}

export class UploadFilesPartialResponseDto {
  @ApiProperty({ example: '4 of 5 files uploaded successfully.' })
  message: string;

  @ApiProperty({ type: [SuccessfulUploadDto] })
  successful: SuccessfulUploadDto[];

  @ApiProperty({ type: [FailedUploadDto] })
  failed: FailedUploadDto[];
}
