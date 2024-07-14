import 'dotenv/config';
import * as joi from 'joi';

interface EnvironmentVars {
  PORT: number;
  NATS_SERVERS: string[];
  JWT_SECRET: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    JWT_SECRET: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config valudation error: ${error.message}`);
}

const environmentsVariables: EnvironmentVars = value;

export const envs = {
  port: environmentsVariables.PORT,
  natsServer: environmentsVariables.NATS_SERVERS,
  jwtSecret: environmentsVariables.JWT_SECRET,
};
