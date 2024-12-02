import { IsInt } from 'class-validator';

export class ByIdParams {
  @IsInt()
  id: number;
}
