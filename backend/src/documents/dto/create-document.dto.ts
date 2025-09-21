import { ApiProperty } from '@nestjs/swagger'
import { ArrayMaxSize, IsArray, IsDateString, IsEnum, IsNotEmpty, IsString, Length, Matches, MaxLength, Min, Validate, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ReviewAfterIssue } from '../../common/validators/review-after-issue.validator.js'

export enum DocStatus { Draft='Draft', Review='Review', Approved='Approved', Archived='Archived', Obsolete='Obsolete' }

export class RetentionScheduleDto {
  @ApiProperty({ enum: ['WORM','STANDARD'] })
  @IsEnum(['WORM','STANDARD'] as any)
  policy!: 'WORM'|'STANDARD'

  @ApiProperty({ minimum: 0 })
  @Min(0)
  durationMonths!: number

  @ApiProperty()
  @IsDateString()
  startDate!: string
}

@Validate(ReviewAfterIssue)
export class MetadataDto {
  @ApiProperty() @IsString() @Length(3,3) CompanyCode!: string
  @ApiProperty() @IsString() @Length(2,2) SubsidiaryCode!: string
  @ApiProperty() @IsString() @Length(3,3) DepartmentCode!: string
  @ApiProperty() @IsString() @Length(3,3) DocumentTypeCode!: string
  @ApiProperty() @IsDateString() IssueDate!: string
  @ApiProperty() @IsDateString() ReviewDate!: string
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMaxSize(10) @IsString({ each: true }) @MaxLength(64, { each: true }) Keywords!: string[]
  @ApiProperty() @IsString() @MaxLength(500) Description!: string
  @ApiProperty({ type: RetentionScheduleDto }) @ValidateNested() @Type(() => RetentionScheduleDto) RetentionSchedule!: RetentionScheduleDto
}

export class CreateDocumentDto {
  @ApiProperty({ pattern: '^[A-Z]{3}-[A-Z]{2}-[A-Z]{3}-[A-Z]{3}-\\d{3}$' })
  @Matches(/^[A-Z]{3}-[A-Z]{2}-[A-Z]{3}-[A-Z]{3}-\d{3}$/)
  ID!: string

  @ApiProperty() @IsString() @IsNotEmpty() Title!: string
  @ApiProperty({ type: MetadataDto }) @ValidateNested() @Type(() => MetadataDto) Metadata!: MetadataDto
}
