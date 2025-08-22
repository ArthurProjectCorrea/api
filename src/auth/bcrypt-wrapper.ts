/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
// Wrapper tipado para bcrypt para evitar avisos de 'any' no uso dos métodos
import * as bcrypt from 'bcrypt';

export const bcryptWrapper = {
  compare: (a: string, b: string) =>
    (bcrypt as any).compare(a, b) as Promise<boolean>,

  hash: (a: string, b: number) => (bcrypt as any).hash(a, b) as Promise<string>,
};
