import { DataSource } from 'typeorm';
import { configDotenv } from 'dotenv';
import { DATA_SOURCE } from './constants';
import { Provider } from '@nestjs/common';

configDotenv();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT) ?? 5432,
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsRun: true,
  logging: true,
});

export default dataSource;

export const databaseProviders: Provider[] = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      return dataSource.initialize();
    },
  },
];
