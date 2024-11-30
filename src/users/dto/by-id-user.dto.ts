import { IsUUID } from 'class-validator';

export class ByIdParams {
  @IsUUID()
  id: string;
}
