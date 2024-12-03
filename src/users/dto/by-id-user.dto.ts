import { IsString } from 'class-validator';

export class ByIdParams {
  @IsString()
  id: number;
}
