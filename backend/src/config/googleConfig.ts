import { google } from "googleapis";
import * as dotenv from 'dotenv';
dotenv.config();

export function createOAuthClient() {
    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
    return client;
}
