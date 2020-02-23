import jwt from "express-jwt"
import * as jwksRsa from "jwks-rsa"

const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env

if (!AUTH0_AUDIENCE || !AUTH0_AUDIENCE) {
    throw new Error("You have to remember to set Auth0 env variables!!! LOL!!!")
}
// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set

export const checkJwt = jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and
    // the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),

    // Validate the audience and the issuer.
    audience: AUTH0_AUDIENCE,
    issuer: `https://${AUTH0_DOMAIN}/`,
    algorithms: ["RS256"],
})
