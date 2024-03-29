import * as dotenv from "dotenv";
dotenv.config();

const defaultPort = 4000;

interface Environment {
    apollo: {
        introspection: boolean;
        playground: boolean;
    };
    mongoDb: {
        databaseName: string;
        url: string;
    };
    port: number | string;
    auth0: {
        audience: string;
        issuer: string;
    };
}

export const environment: Environment = {
    apollo: {
        introspection: process.env.APOLLO_INTROSPECTION === 'true',
        playground: process.env.APOLLO_PLAYGROUND === 'true',
    },
    mongoDb: {
        databaseName: process.env.MONGODB_DB_NAME as string,
        url: process.env.MONGODB_URL as string,
    },
    port: process.env.PORT || defaultPort,
    auth0: {
        audience: process.env.AUTH0_AUDIENCE as string,
        issuer: process.env.AUTH0_ISSUER as string
    }
};