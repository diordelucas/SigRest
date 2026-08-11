package br.com.sigrest.api.security;

import br.com.sigrest.api.entity.User;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

/** Emite e valida o JWT usado pelo front. */
@Service
public class TokenService {

    private static final String ISSUER = "sigrest-api";

    @Value("${api.security.token.secret}")
    private String secret;

    @Value("${api.security.token.expiration-hours:8}")
    private long expirationHours;

    public String generate(User user) {
        return JWT.create()
                .withIssuer(ISSUER)
                .withSubject(user.getEmail())
                .withClaim("name", user.getName())
                .withClaim("role", user.getRole())
                .withExpiresAt(Instant.now().plusSeconds(expirationHours * 3600))
                .sign(Algorithm.HMAC256(secret));
    }

    /** Devolve o email (subject) do token, ou null se invalido/expirado. */
    public String subjectOf(String token) {
        try {
            return JWT.require(Algorithm.HMAC256(secret))
                    .withIssuer(ISSUER)
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException ex) {
            return null;
        }
    }
}
