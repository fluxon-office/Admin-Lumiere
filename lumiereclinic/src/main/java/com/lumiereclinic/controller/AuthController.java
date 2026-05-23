package com.lumiereclinic.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.lumiereclinic.dto.LoginRequest;
import com.lumiereclinic.dto.LoginResponse;
import com.lumiereclinic.dto.PasswordRecoveryCodeRequest;
import com.lumiereclinic.dto.PasswordResetRequest;
import com.lumiereclinic.dto.SimpleMessageResponse;
import com.lumiereclinic.service.UsuarioService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {
        return usuarioService.autenticarUsuario(loginRequest);
    }

    @PostMapping("/recuperacao/codigo")
    public SimpleMessageResponse solicitarCodigo(@Valid @RequestBody PasswordRecoveryCodeRequest request) {
        return usuarioService.solicitarCodigoRecuperacao(request);
    }

    @PostMapping("/recuperacao/senha")
    public SimpleMessageResponse redefinirSenha(@Valid @RequestBody PasswordResetRequest request) {
        return usuarioService.redefinirSenha(request);
    }
}
