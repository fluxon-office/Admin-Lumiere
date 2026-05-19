package com.lumiereclinic.service;

import com.lumiereclinic.dto.LoginRequest;
import com.lumiereclinic.dto.LoginResponse;
import com.lumiereclinic.exception.ResourceBadRequestException;
import com.lumiereclinic.model.Usuario;
import com.lumiereclinic.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService implements UserDetailsService {

    public static final String DEFAULT_EMPRESA_ID = "lumiere-clinic";

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario cadastrarUsuario(Usuario usuario) {
        Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(usuario.getEmail());

        if (usuarioExistente.isPresent()) {
            throw new ResourceBadRequestException("Email ja cadastrado");
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        if (usuario.getEmpresaId() == null || usuario.getEmpresaId().isBlank()) {
            usuario.setEmpresaId(DEFAULT_EMPRESA_ID);
        }

        return usuarioRepository.save(usuario);
    }

    public boolean possuiUsuariosCadastrados() {
        return usuarioRepository.count() > 0;
    }

    public LoginResponse autenticarUsuario(LoginRequest loginRequest) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(loginRequest.getEmail());

        if (usuarioOptional.isEmpty()) {
            throw new ResourceBadRequestException("Email ou senha invalidos");
        }

        Usuario usuario = usuarioOptional.get();

        if (!passwordEncoder.matches(loginRequest.getSenha(), usuario.getSenha())) {
            throw new ResourceBadRequestException("Email ou senha invalidos");
        }

        return new LoginResponse(
                "Credenciais validadas com sucesso",
                usuario.getNome(),
                usuario.getEmail()
        );
    }

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado"));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = buscarPorEmail(username);

        return User.withUsername(usuario.getEmail())
                .password(usuario.getSenha())
                .roles("ADMIN")
                .build();
    }
}
