package com.lumiereclinic.controller;

import com.lumiereclinic.dto.BootstrapRequest;
import com.lumiereclinic.model.Usuario;
import com.lumiereclinic.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/bootstrap")
    public Usuario cadastrarPrimeiroUsuario(@RequestBody BootstrapRequest request) {
        return usuarioService.bootstrapPrimeiroAcesso(request);
    }

    @PostMapping
    public Usuario cadastrarUsuario(@RequestBody Usuario usuario) {
        return usuarioService.cadastrarUsuario(usuario);
    }
}
