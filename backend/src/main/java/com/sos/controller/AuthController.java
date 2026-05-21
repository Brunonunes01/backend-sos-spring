package com.sos.controller;

import com.sos.dto.auth.AuthResponse;
import com.sos.dto.auth.LoginRequest;
import com.sos.dto.auth.UserMeResponse;
import com.sos.service.AuthService;
import com.sos.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticação")
public class AuthController {

    private final AuthService authService;
    private final UsuarioService usuarioService;

    public AuthController(AuthService authService, UsuarioService usuarioService) {
        this.authService = authService;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuário")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar token JWT")
    public ResponseEntity<AuthResponse> refresh(@RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(authService.refreshToken(authorizationHeader));
    }

    @GetMapping("/me")
    @Operation(summary = "Usuário autenticado")
    public ResponseEntity<UserMeResponse> me() {
        return ResponseEntity.ok(usuarioService.me());
    }
}
