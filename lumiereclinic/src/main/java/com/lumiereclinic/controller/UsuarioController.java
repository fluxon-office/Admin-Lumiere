package com.lumiereclinic.controller;

import com.lumiereclinic.exception.ResourceBadRequestException;
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
    public Usuario cadastrarPrimeiroUsuario(@RequestBody Usuario usuario) {
        if (usuarioService.possuiUsuariosCadastrados()) {
            throw new ResourceBadRequestException("O bootstrap inicial de usuario ja foi realizado");
        }

        return usuarioService.cadastrarUsuario(usuario);
    }

    @PostMapping
    public Usuario cadastrarUsuario(@RequestBody Usuario usuario) {
        return usuarioService.cadastrarUsuario(usuario);
    }
}
