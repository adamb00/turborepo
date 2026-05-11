import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodSchema } from '@workspace/validation';
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }
    return result.data;
  }
}
